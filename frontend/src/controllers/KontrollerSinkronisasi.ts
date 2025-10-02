import axios, { AxiosResponse } from 'axios';
import KontrollerAuth from './KontrollerAuth';

// ==================== INTERFACES ====================

export interface OpsiAPI {
  id: string;
  nama: string;
  deskripsi: string;
  endpoint: string;
  metode: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'aktif' | 'nonaktif' | 'maintenance';
  versi: string;
  dokumentasi: string;
  rateLimit: number;
  authentication: 'bearer' | 'api_key' | 'oauth' | 'none';
  lastSync: Date;
  dataCount: number;
}

export interface ParameterSinkronisasi {
  apiId: string;
  jenisData: 'mobil' | 'pengguna' | 'transaksi' | 'iklan' | 'semua';
  rentangTanggal: {
    mulai: Date;
    selesai: Date;
  };
  batchSize: number;
  overwriteExisting: boolean;
  validateData: boolean;
  backupBeforeSync: boolean;
  notifyOnComplete: boolean;
  filterKriteria?: {
    [key: string]: any;
  };
}

export interface PersetujuanImport {
  id: string;
  requestId: string;
  jenisData: string;
  jumlahRecord: number;
  estimasiWaktu: number; // dalam menit
  risikoLevel: 'rendah' | 'sedang' | 'tinggi';
  dampakSistem: string[];
  requester: {
    id: string;
    nama: string;
    role: string;
  };
  approver?: {
    id: string;
    nama: string;
    role: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  tanggalRequest: Date;
  tanggalApproval?: Date;
  alasanPenolakan?: string;
  dataPreview: any[];
}

export interface ProsesSinkronisasi {
  id: string;
  parameterId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  startTime: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number; // dalam detik
  currentBatch: number;
  totalBatches: number;
  errors: SinkronisasiError[];
  logs: SinkronisasiLog[];
}

export interface SinkronisasiError {
  id: string;
  recordId?: string;
  errorType: 'validation' | 'network' | 'database' | 'business_logic';
  errorCode: string;
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
}

export interface SinkronisasiLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface RollbackData {
  id: string;
  sinkronisasiId: string;
  jenisRollback: 'partial' | 'complete';
  affectedTables: string[];
  backupLocation: string;
  rollbackStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  rollbackProgress: number;
  startTime: Date;
  endTime?: Date;
  rollbackLogs: SinkronisasiLog[];
}

export interface ResponSinkronisasi {
  success: boolean;
  message: string;
  data?: any;
  processId?: string;
  estimatedTime?: number;
}

export interface StatistikSinkronisasi {
  totalSinkronisasi: number;
  sinkronisasiBerhasil: number;
  sinkronisasiGagal: number;
  rataRataWaktu: number; // dalam menit
  dataVolume: {
    harian: number;
    mingguan: number;
    bulanan: number;
  };
  apiTerpopuler: OpsiAPI[];
  errorTerbanyak: {
    type: string;
    count: number;
  }[];
}

// ==================== MAIN CONTROLLER ====================

export class KontrollerSinkronisasi {
  private baseURL: string;
  private authController: KontrollerAuth;
  private cache: Map<string, any>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 menit

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.authController = KontrollerAuth.getInstance();
    this.cache = new Map();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Menampilkan opsi API yang tersedia untuk sinkronisasi
   */
  async tampilkanOpsiAPI(): Promise<OpsiAPI[]> {
    try {
      const cacheKey = 'api_options';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<OpsiAPI[]> = await axios.get(
        `${this.baseURL}/sinkronisasi/api-options`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const apiOptions = response.data;
      this.setCache(cacheKey, apiOptions);
      return apiOptions;

    } catch (error) {
      console.error('Error fetching API options:', error);
      return this.getMockApiOptions();
    }
  }

  /**
   * Memulai proses sinkronisasi dengan parameter yang diberikan
   */
  async mulaiProsesSinkronisasi(parameter: ParameterSinkronisasi): Promise<ResponSinkronisasi> {
    try {
      // Validasi parameter
      const validationResult = this.validasiParameterSinkronisasi(parameter);
      if (!validationResult.valid) {
        return {
          success: false,
          message: `Validasi gagal: ${validationResult.errors.join(', ')}`
        };
      }

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ResponSinkronisasi> = await axios.post(
        `${this.baseURL}/sinkronisasi/start`,
        parameter,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Clear cache setelah memulai sinkronisasi
      this.clearCache();
      return response.data;

    } catch (error) {
      console.error('Error starting synchronization:', error);
      return {
        success: false,
        message: 'Gagal memulai proses sinkronisasi',
        processId: this.generateMockProcessId()
      };
    }
  }

  /**
   * Meminta persetujuan untuk import data
   */
  async mintaPersetujuanImport(parameter: ParameterSinkronisasi): Promise<PersetujuanImport> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<PersetujuanImport> = await axios.post(
        `${this.baseURL}/sinkronisasi/request-approval`,
        parameter,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error requesting import approval:', error);
      return this.getMockPersetujuanImport();
    }
  }

  /**
   * Memproses persetujuan import (approve/reject)
   */
  async prosesPersetujuan(
    approvalId: string, 
    action: 'approve' | 'reject', 
    alasan?: string
  ): Promise<ResponSinkronisasi> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ResponSinkronisasi> = await axios.post(
        `${this.baseURL}/sinkronisasi/process-approval`,
        {
          approvalId,
          action,
          alasan
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error processing approval:', error);
      return {
        success: false,
        message: 'Gagal memproses persetujuan'
      };
    }
  }

  /**
   * Rollback data import yang sudah dilakukan
   */
  async rollbackDataImport(sinkronisasiId: string, jenisRollback: 'partial' | 'complete' = 'complete'): Promise<ResponSinkronisasi> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ResponSinkronisasi> = await axios.post(
        `${this.baseURL}/sinkronisasi/rollback`,
        {
          sinkronisasiId,
          jenisRollback
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Clear cache setelah rollback
      this.clearCache();
      return response.data;

    } catch (error) {
      console.error('Error rolling back data:', error);
      return {
        success: false,
        message: 'Gagal melakukan rollback data'
      };
    }
  }

  // ==================== ADDITIONAL METHODS ====================

  /**
   * Mendapatkan status proses sinkronisasi
   */
  async getStatusSinkronisasi(processId: string): Promise<ProsesSinkronisasi | null> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ProsesSinkronisasi> = await axios.get(
        `${this.baseURL}/sinkronisasi/status/${processId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  /**
   * Membatalkan proses sinkronisasi yang sedang berjalan
   */
  async batalkanSinkronisasi(processId: string): Promise<ResponSinkronisasi> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ResponSinkronisasi> = await axios.post(
        `${this.baseURL}/sinkronisasi/cancel/${processId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error cancelling sync:', error);
      return {
        success: false,
        message: 'Gagal membatalkan sinkronisasi'
      };
    }
  }

  /**
   * Mendapatkan riwayat sinkronisasi
   */
  async getRiwayatSinkronisasi(limit: number = 20): Promise<ProsesSinkronisasi[]> {
    try {
      const cacheKey = `sync_history_${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ProsesSinkronisasi[]> = await axios.get(
        `${this.baseURL}/sinkronisasi/history?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const history = response.data;
      this.setCache(cacheKey, history);
      return history;

    } catch (error) {
      console.error('Error getting sync history:', error);
      return [];
    }
  }

  /**
   * Mendapatkan statistik sinkronisasi
   */
  async getStatistikSinkronisasi(): Promise<StatistikSinkronisasi> {
    try {
      const cacheKey = 'sync_statistics';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<StatistikSinkronisasi> = await axios.get(
        `${this.baseURL}/sinkronisasi/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const statistics = response.data;
      this.setCache(cacheKey, statistics);
      return statistics;

    } catch (error) {
      console.error('Error getting sync statistics:', error);
      return this.getMockStatistikSinkronisasi();
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validasi parameter sinkronisasi
   */
  private validasiParameterSinkronisasi(parameter: ParameterSinkronisasi): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!parameter.apiId) {
      errors.push('API ID harus diisi');
    }

    if (!parameter.jenisData) {
      errors.push('Jenis data harus dipilih');
    }

    if (!parameter.rentangTanggal.mulai || !parameter.rentangTanggal.selesai) {
      errors.push('Rentang tanggal harus diisi');
    }

    if (parameter.rentangTanggal.mulai > parameter.rentangTanggal.selesai) {
      errors.push('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
    }

    if (parameter.batchSize <= 0 || parameter.batchSize > 10000) {
      errors.push('Batch size harus antara 1-10000');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==================== CACHE METHODS ====================

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ==================== UTILITY METHODS ====================

  private generateMockProcessId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}d`;
    } else {
      return `${secs}d`;
    }
  }

  // ==================== MOCK DATA METHODS ====================

  private getMockApiOptions(): OpsiAPI[] {
    return [
      {
        id: 'api_1',
        nama: 'Mobil API',
        deskripsi: 'API untuk sinkronisasi data mobil',
        endpoint: '/api/v1/mobil',
        metode: 'GET',
        status: 'aktif',
        versi: '1.2.0',
        dokumentasi: 'https://docs.example.com/mobil-api',
        rateLimit: 1000,
        authentication: 'bearer',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dataCount: 15420
      },
      {
        id: 'api_2',
        nama: 'User API',
        deskripsi: 'API untuk sinkronisasi data pengguna',
        endpoint: '/api/v1/users',
        metode: 'GET',
        status: 'aktif',
        versi: '2.1.0',
        dokumentasi: 'https://docs.example.com/user-api',
        rateLimit: 500,
        authentication: 'api_key',
        lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000),
        dataCount: 8750
      },
      {
        id: 'api_3',
        nama: 'Transaction API',
        deskripsi: 'API untuk sinkronisasi data transaksi',
        endpoint: '/api/v1/transactions',
        metode: 'GET',
        status: 'maintenance',
        versi: '1.0.5',
        dokumentasi: 'https://docs.example.com/transaction-api',
        rateLimit: 200,
        authentication: 'oauth',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dataCount: 3280
      }
    ];
  }

  private getMockPersetujuanImport(): PersetujuanImport {
    return {
      id: 'approval_1',
      requestId: 'req_' + Date.now(),
      jenisData: 'mobil',
      jumlahRecord: 1500,
      estimasiWaktu: 45,
      risikoLevel: 'sedang',
      dampakSistem: [
        'Update data katalog mobil',
        'Refresh cache sistem',
        'Notifikasi ke admin'
      ],
      requester: {
        id: 'user_1',
        nama: 'Admin Sistem',
        role: 'administrator'
      },
      status: 'pending',
      tanggalRequest: new Date(),
      dataPreview: [
        {
          id: 'mob_1',
          merk: 'Toyota',
          model: 'Avanza',
          tahun: 2023,
          harga: 220000000
        },
        {
          id: 'mob_2',
          merk: 'Honda',
          model: 'Brio',
          tahun: 2023,
          harga: 180000000
        }
      ]
    };
  }

  private getMockStatistikSinkronisasi(): StatistikSinkronisasi {
    return {
      totalSinkronisasi: 156,
      sinkronisasiBerhasil: 142,
      sinkronisasiGagal: 14,
      rataRataWaktu: 23.5,
      dataVolume: {
        harian: 2500,
        mingguan: 17500,
        bulanan: 75000
      },
      apiTerpopuler: this.getMockApiOptions().slice(0, 2),
      errorTerbanyak: [
        { type: 'Network Timeout', count: 8 },
        { type: 'Data Validation', count: 4 },
        { type: 'Authentication', count: 2 }
      ]
    };
  }
}

export default KontrollerSinkronisasi;
