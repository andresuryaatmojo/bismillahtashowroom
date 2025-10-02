const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data pembayaran
export interface DataPembayaran {
  id: string;
  nomorTransaksi: string;
  nomorPembayaran: string;
  tanggalPembayaran: string;
  tanggalJatuhTempo?: string;
  jumlah: number;
  jumlahDibayar: number;
  sisaPembayaran: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partial';
  metodePembayaran: MetodePembayaran;
  transaksi: InfoTransaksi;
  pelanggan: InfoPelanggan;
  riwayatPembayaran: RiwayatPembayaran[];
  dokumenPembayaran: DokumenPembayaran[];
  cicilan?: InfoCicilan;
  refund?: InfoRefund;
  metadata: MetadataPembayaran;
}

// Interface untuk metode pembayaran
export interface MetodePembayaran {
  jenis: 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'ewallet' | 'qris' | 'virtual_account' | 'installment';
  provider: string;
  nomorRekening?: string;
  namaBank?: string;
  nomorKartu?: string;
  ewalletProvider?: string;
  virtualAccountNumber?: string;
  qrisCode?: string;
  biayaAdmin: number;
  biayaLayanan: number;
}

// Interface untuk info transaksi
export interface InfoTransaksi {
  id: string;
  jenis: 'pembelian' | 'service' | 'trade_in' | 'test_drive' | 'konsultasi';
  mobil: {
    id: string;
    nama: string;
    merk: string;
    model: string;
    tahun: number;
    harga: number;
    foto: string;
  };
  dealer: {
    id: string;
    nama: string;
    alamat: string;
    telepon: string;
  };
  sales?: {
    id: string;
    nama: string;
    telepon: string;
    email: string;
  };
}

// Interface untuk info pelanggan
export interface InfoPelanggan {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  jenisIdentitas: 'ktp' | 'sim' | 'passport';
  nomorIdentitas: string;
}

// Interface untuk riwayat pembayaran
export interface RiwayatPembayaran {
  id: string;
  tanggal: string;
  jumlah: number;
  metodePembayaran: string;
  status: 'success' | 'pending' | 'failed';
  referensi: string;
  catatan?: string;
  buktiPembayaran?: string;
  diverifikasiOleh?: string;
  tanggalVerifikasi?: string;
}

// Interface untuk dokumen pembayaran
export interface DokumenPembayaran {
  id: string;
  nama: string;
  jenis: 'invoice' | 'receipt' | 'proof_of_payment' | 'contract' | 'agreement';
  url: string;
  ukuran: number;
  tanggalUpload: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy: string;
}

// Interface untuk info cicilan
export interface InfoCicilan {
  jumlahBulan: number;
  nominalPerBulan: number;
  sukuBunga: number;
  uangMuka: number;
  sisaCicilan: number;
  cicilanKe: number;
  tanggalCicilanBerikutnya: string;
  statusCicilan: 'current' | 'overdue' | 'completed';
  denda?: number;
  riwayatCicilan: RiwayatCicilan[];
}

// Interface untuk riwayat cicilan
export interface RiwayatCicilan {
  id: string;
  cicilanKe: number;
  tanggalJatuhTempo: string;
  tanggalBayar?: string;
  jumlah: number;
  denda: number;
  status: 'paid' | 'pending' | 'overdue';
  metodePembayaran?: string;
  referensi?: string;
}

// Interface untuk info refund
export interface InfoRefund {
  id: string;
  jumlahRefund: number;
  alasanRefund: string;
  tanggalPengajuan: string;
  tanggalDisetujui?: string;
  tanggalDibayar?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'completed';
  metodePengembalian: string;
  nomorRekeningTujuan?: string;
  catatan?: string;
  disetujuiOleh?: string;
}

// Interface untuk metadata pembayaran
export interface MetadataPembayaran {
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  sessionId: string;
  referrer?: string;
  campaignSource?: string;
}

// Interface untuk filter pembayaran
export interface FilterPembayaran {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  status?: string[];
  metodePembayaran?: string[];
  jenisTransaksi?: string[];
  dealer?: string[];
  rentangJumlah?: {
    min: number;
    max: number;
  };
  pelanggan?: string;
  nomorTransaksi?: string;
}

// Interface untuk statistik pembayaran
export interface StatistikPembayaran {
  totalPembayaran: number;
  totalNilai: number;
  pembayaranSelesai: number;
  pembayaranPending: number;
  pembayaranGagal: number;
  totalRefund: number;
  nilaiRefund: number;
  rataRataNilaiPembayaran: number;
  metodeTerpopuler: {
    metode: string;
    jumlah: number;
    persentase: number;
  }[];
  trendBulanan: {
    bulan: string;
    jumlahTransaksi: number;
    nilaiTransaksi: number;
  }[];
  distribusiStatus: {
    [key: string]: number;
  };
  waktuRataRataPenyelesaian: number; // dalam jam
}

// Interface untuk halaman data pembayaran
export interface HalamanDataPembayaran {
  pembayaran: DataPembayaran[];
  total: number;
  statistik: StatistikPembayaran;
  filter: FilterPembayaran;
  sortOptions: SortOption[];
  exportOptions: ExportOption[];
}

// Interface untuk opsi sort
export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

// Interface untuk opsi export
export interface ExportOption {
  value: string;
  label: string;
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
}

// Interface untuk konfigurasi pembayaran
export interface KonfigurasiPembayaran {
  metodePembayaranAktif: string[];
  batasWaktuPembayaran: number; // dalam menit
  biayaAdminDefault: {
    [key: string]: number;
  };
  minimumPembayaran: number;
  maksimumPembayaran: number;
  autoVerifikasi: boolean;
  notifikasiPembayaran: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  integrasiPaymentGateway: {
    [key: string]: {
      active: boolean;
      apiKey: string;
      secretKey: string;
      webhookUrl: string;
    };
  };
}

export class KontrollerPembayaran {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter for payment data)

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat data pembayaran dengan filter dan pagination
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 20)
   * @param filter - Filter pencarian
   * @param sortBy - Urutan ('terbaru' | 'terlama' | 'nilai_tinggi' | 'nilai_rendah' | 'status')
   * @returns Promise<HalamanDataPembayaran>
   */
  public async muatDataPembayaran(
    page: number = 1,
    limit: number = 20,
    filter?: FilterPembayaran,
    sortBy: string = 'terbaru'
  ): Promise<HalamanDataPembayaran> {
    try {
      // Check cache first
      const cacheKey = `pembayaran_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      // Add filter parameters
      if (filter) {
        if (filter.tanggalMulai) params.append('tanggalMulai', filter.tanggalMulai);
        if (filter.tanggalSelesai) params.append('tanggalSelesai', filter.tanggalSelesai);
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.metodePembayaran) params.append('metodePembayaran', filter.metodePembayaran.join(','));
        if (filter.jenisTransaksi) params.append('jenisTransaksi', filter.jenisTransaksi.join(','));
        if (filter.dealer) params.append('dealer', filter.dealer.join(','));
        if (filter.pelanggan) params.append('pelanggan', filter.pelanggan);
        if (filter.nomorTransaksi) params.append('nomorTransaksi', filter.nomorTransaksi);
        if (filter.rentangJumlah) {
          params.append('jumlahMin', filter.rentangJumlah.min.toString());
          params.append('jumlahMax', filter.rentangJumlah.max.toString());
        }
      }

      const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const halamanData: HalamanDataPembayaran = {
        pembayaran: result.data.payments || [],
        total: result.data.total || 0,
        statistik: result.data.statistics || this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        exportOptions: this.getExportOptions()
      };

      // Cache the result
      this.setToCache(cacheKey, halamanData);

      return halamanData;

    } catch (error) {
      console.error('Error loading payment data:', error);
      return {
        pembayaran: [],
        total: 0,
        statistik: this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        exportOptions: this.getExportOptions()
      };
    }
  }

  /**
   * Memuat detail pembayaran berdasarkan ID
   * @param idPembayaran - ID pembayaran
   * @returns Promise<DataPembayaran | null>
   */
  public async muatDetailPembayaran(idPembayaran: string): Promise<DataPembayaran | null> {
    try {
      // Check cache first
      const cacheKey = `payment_detail_${idPembayaran}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

    } catch (error) {
      console.error('Error loading payment detail:', error);
      return null;
    }
  }

  /**
   * Proses verifikasi pembayaran
   * @param idPembayaran - ID pembayaran
   * @param status - Status verifikasi ('approved' | 'rejected')
   * @param catatan - Catatan verifikasi
   * @returns Promise<{success: boolean, message: string}>
   */
  public async verifikasiPembayaran(
    idPembayaran: string,
    status: 'approved' | 'rejected',
    catatan?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          status,
          catatan
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memverifikasi pembayaran');
      }

      // Clear cache
      this.clearCacheByPattern('pembayaran_');
      this.clearCacheByPattern(`payment_detail_${idPembayaran}`);

      return {
        success: true,
        message: `Pembayaran berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memverifikasi pembayaran'
      };
    }
  }

  /**
   * Proses refund pembayaran
   * @param idPembayaran - ID pembayaran
   * @param jumlahRefund - Jumlah yang akan direfund
   * @param alasan - Alasan refund
   * @param metodePengembalian - Metode pengembalian dana
   * @returns Promise<{success: boolean, message: string, refundId?: string}>
   */
  public async prosesRefund(
    idPembayaran: string,
    jumlahRefund: number,
    alasan: string,
    metodePengembalian: string
  ): Promise<{
    success: boolean;
    message: string;
    refundId?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          jumlahRefund,
          alasan,
          metodePengembalian
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memproses refund');
      }

      // Clear cache
      this.clearCacheByPattern('pembayaran_');
      this.clearCacheByPattern(`payment_detail_${idPembayaran}`);

      return {
        success: true,
        message: 'Refund berhasil diproses',
        refundId: result.data.refundId
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses refund'
      };
    }
  }

  /**
   * Update status pembayaran
   * @param idPembayaran - ID pembayaran
   * @param statusBaru - Status baru
   * @param catatan - Catatan perubahan
   * @returns Promise<{success: boolean, message: string}>
   */
  public async updateStatusPembayaran(
    idPembayaran: string,
    statusBaru: string,
    catatan?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          status: statusBaru,
          catatan
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate status pembayaran');
      }

      // Clear cache
      this.clearCacheByPattern('pembayaran_');
      this.clearCacheByPattern(`payment_detail_${idPembayaran}`);

      return {
        success: true,
        message: 'Status pembayaran berhasil diupdate'
      };

    } catch (error) {
      console.error('Error updating payment status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate status pembayaran'
      };
    }
  }

  /**
   * Generate invoice pembayaran
   * @param idPembayaran - ID pembayaran
   * @param format - Format invoice ('pdf' | 'html')
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async generateInvoice(
    idPembayaran: string,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}/invoice?format=${format}`, {
        method: 'GET',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error('Gagal generate invoice');
      }

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${idPembayaran}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return {
          success: true,
          message: 'Invoice berhasil diunduh'
        };
      } else {
        const result = await response.json();
        return {
          success: true,
          message: 'Invoice berhasil digenerate',
          downloadUrl: result.data.downloadUrl
        };
      }

    } catch (error) {
      console.error('Error generating invoice:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat generate invoice'
      };
    }
  }

  /**
   * Kirim reminder pembayaran
   * @param idPembayaran - ID pembayaran
   * @param jenis - Jenis reminder ('email' | 'sms' | 'whatsapp')
   * @returns Promise<{success: boolean, message: string}>
   */
  public async kirimReminderPembayaran(
    idPembayaran: string,
    jenis: 'email' | 'sms' | 'whatsapp'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${idPembayaran}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ jenis })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim reminder');
      }

      return {
        success: true,
        message: `Reminder berhasil dikirim via ${jenis}`
      };

    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim reminder'
      };
    }
  }

  /**
   * Export data pembayaran
   * @param filter - Filter untuk export
   * @param format - Format export ('csv' | 'excel' | 'pdf')
   * @param fields - Field yang akan diexport
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async exportDataPembayaran(
    filter?: FilterPembayaran,
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    fields?: string[]
  ): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          filter,
          format,
          fields
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Export berhasil dibuat',
        downloadUrl: result.data.downloadUrl
      };

    } catch (error) {
      console.error('Error exporting payment data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat export data'
      };
    }
  }

  /**
   * Memuat konfigurasi pembayaran
   * @returns Promise<KonfigurasiPembayaran | null>
   */
  public async muatKonfigurasiPembayaran(): Promise<KonfigurasiPembayaran | null> {
    try {
      // Check cache first
      const cacheKey = 'payment_config';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/payments/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

    } catch (error) {
      console.error('Error loading payment configuration:', error);
      return null;
    }
  }

  /**
   * Update konfigurasi pembayaran
   * @param konfigurasi - Konfigurasi baru
   * @returns Promise<{success: boolean, message: string}>
   */
  public async updateKonfigurasiPembayaran(
    konfigurasi: Partial<KonfigurasiPembayaran>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(konfigurasi)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate konfigurasi pembayaran');
      }

      // Clear cache
      this.clearCacheByPattern('payment_config');

      return {
        success: true,
        message: 'Konfigurasi pembayaran berhasil diupdate'
      };

    } catch (error) {
      console.error('Error updating payment configuration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate konfigurasi'
      };
    }
  }

  /**
   * Format currency to Rupiah
   */
  public formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format tanggal
   */
  public formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Format status pembayaran
   */
  public formatStatusPembayaran(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Menunggu Pembayaran',
      'processing': 'Sedang Diproses',
      'completed': 'Selesai',
      'failed': 'Gagal',
      'cancelled': 'Dibatalkan',
      'refunded': 'Dikembalikan',
      'partial': 'Sebagian'
    };
    return statusMap[status] || status;
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikPembayaran {
    return {
      totalPembayaran: 0,
      totalNilai: 0,
      pembayaranSelesai: 0,
      pembayaranPending: 0,
      pembayaranGagal: 0,
      totalRefund: 0,
      nilaiRefund: 0,
      rataRataNilaiPembayaran: 0,
      metodeTerpopuler: [],
      trendBulanan: [],
      distribusiStatus: {},
      waktuRataRataPenyelesaian: 0
    };
  }

  /**
   * Get sort options
   */
  private getSortOptions(): SortOption[] {
    return [
      { value: 'terbaru', label: 'Terbaru', field: 'tanggalPembayaran', direction: 'desc' },
      { value: 'terlama', label: 'Terlama', field: 'tanggalPembayaran', direction: 'asc' },
      { value: 'nilai_tinggi', label: 'Nilai Tertinggi', field: 'jumlah', direction: 'desc' },
      { value: 'nilai_rendah', label: 'Nilai Terendah', field: 'jumlah', direction: 'asc' },
      { value: 'status', label: 'Status', field: 'status', direction: 'asc' },
      { value: 'pelanggan', label: 'Nama Pelanggan', field: 'pelanggan.nama', direction: 'asc' },
      { value: 'metode', label: 'Metode Pembayaran', field: 'metodePembayaran.jenis', direction: 'asc' }
    ];
  }

  /**
   * Get export options
   */
  private getExportOptions(): ExportOption[] {
    return [
      {
        value: 'basic',
        label: 'Data Dasar',
        format: 'excel',
        fields: ['nomorTransaksi', 'tanggalPembayaran', 'pelanggan.nama', 'jumlah', 'status', 'metodePembayaran.jenis']
      },
      {
        value: 'detailed',
        label: 'Data Lengkap',
        format: 'excel',
        fields: ['*']
      },
      {
        value: 'financial',
        label: 'Laporan Keuangan',
        format: 'pdf',
        fields: ['nomorTransaksi', 'tanggalPembayaran', 'jumlah', 'jumlahDibayar', 'sisaPembayaran', 'status']
      }
    ];
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setToCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private clearCacheByPattern(pattern: string): void {
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerPembayaran;
