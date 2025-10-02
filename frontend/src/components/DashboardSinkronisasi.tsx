import React, { useState, useEffect } from 'react';
import './DashboardSinkronisasi.css';

// Interface untuk sumber API
interface SumberAPI {
  id: string;
  nama: string;
  url: string;
  jenis: 'harga' | 'stok' | 'spesifikasi' | 'promo';
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  description: string;
  authRequired: boolean;
  rateLimit: number; // requests per minute
}

// Interface untuk parameter sinkronisasi
interface ParameterSinkronisasi {
  sumberAPI: string;
  interval: number; // dalam menit
  autoSync: boolean;
  filterKategori: string[];
  filterMerk: string[];
  batchSize: number;
  timeout: number; // dalam detik
  retryCount: number;
  notifikasi: boolean;
}

// Interface untuk progress sinkronisasi
interface ProgressSinkronisasi {
  id: string;
  sumberAPI: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  startTime: string;
  endTime?: string;
  estimatedTimeRemaining?: number; // dalam detik
  currentOperation: string;
  errors: string[];
}

// Interface untuk hasil import
interface HasilImport {
  id: string;
  sumberAPI: string;
  tanggalImport: string;
  totalData: number;
  dataBaruDitambahkan: number;
  dataDigunakan: number;
  dataGagal: number;
  ringkasanPerubahan: {
    hargaBerubah: number;
    stokBerubah: number;
    spesifikasiBerubah: number;
    promoBaru: number;
  };
  status: 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  notes?: string;
  dataPreview: any[];
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const DashboardSinkronisasi: React.FC = () => {
  // State management
  const [daftarSumberAPI, setDaftarSumberAPI] = useState<SumberAPI[]>([]);
  const [selectedSumberAPI, setSelectedSumberAPI] = useState<SumberAPI | null>(null);
  const [parameterSinkronisasi, setParameterSinkronisasi] = useState<ParameterSinkronisasi>({
    sumberAPI: '',
    interval: 60,
    autoSync: false,
    filterKategori: [],
    filterMerk: [],
    batchSize: 100,
    timeout: 30,
    retryCount: 3,
    notifikasi: true
  });
  const [progressSinkronisasi, setProgressSinkronisasi] = useState<ProgressSinkronisasi | null>(null);
  const [daftarHasilImport, setDaftarHasilImport] = useState<HasilImport[]>([]);
  const [selectedHasilImport, setSelectedHasilImport] = useState<HasilImport | null>(null);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  const [activeTab, setActiveTab] = useState<'sumber' | 'parameter' | 'monitor' | 'hasil'>('sumber');
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showKeluarModal, setShowKeluarModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Method: aksesModulSinkronisasi
  const aksesModulSinkronisasi = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data tiruan sumber API
      const mockSumberAPI: SumberAPI[] = [
        {
          id: 'api-001',
          nama: 'API Harga Mobil Indonesia',
          url: 'https://api.hargamobil.id/v1',
          jenis: 'harga',
          status: 'active',
          lastSync: '2024-12-15T10:30:00Z',
          description: 'API untuk mendapatkan harga terbaru mobil dari berbagai dealer',
          authRequired: true,
          rateLimit: 100
        },
        {
          id: 'api-002',
          nama: 'API Stok Kendaraan',
          url: 'https://api.stokkendaraan.com/v2',
          jenis: 'stok',
          status: 'active',
          lastSync: '2024-12-15T09:15:00Z',
          description: 'API untuk sinkronisasi data stok kendaraan real-time',
          authRequired: true,
          rateLimit: 200
        },
        {
          id: 'api-003',
          nama: 'API Spesifikasi Motor',
          url: 'https://api.spekmotor.net/v1',
          jenis: 'spesifikasi',
          status: 'inactive',
          lastSync: '2024-12-14T16:45:00Z',
          description: 'API untuk mendapatkan spesifikasi lengkap motor',
          authRequired: false,
          rateLimit: 50
        },
        {
          id: 'api-004',
          nama: 'API Promo Dealer',
          url: 'https://api.promodealer.id/v1',
          jenis: 'promo',
          status: 'error',
          lastSync: '2024-12-15T08:00:00Z',
          description: 'API untuk sinkronisasi data promo dan diskon dari dealer',
          authRequired: true,
          rateLimit: 75
        }
      ];

      // Data tiruan hasil import
      const mockHasilImport: HasilImport[] = [
        {
          id: 'import-001',
          sumberAPI: 'API Harga Mobil Indonesia',
          tanggalImport: '2024-12-15T10:30:00Z',
          totalData: 1250,
          dataBaruDitambahkan: 45,
          dataDigunakan: 1180,
          dataGagal: 25,
          ringkasanPerubahan: {
            hargaBerubah: 320,
            stokBerubah: 0,
            spesifikasiBerubah: 0,
            promoBaru: 0
          },
          status: 'pending_review',
          dataPreview: [
            { merk: 'Toyota', model: 'Avanza', hargaLama: 250000000, hargaBaru: 255000000 },
            { merk: 'Honda', model: 'Brio', hargaLama: 180000000, hargaBaru: 185000000 }
          ]
        },
        {
          id: 'import-002',
          sumberAPI: 'API Stok Kendaraan',
          tanggalImport: '2024-12-15T09:15:00Z',
          totalData: 890,
          dataBaruDitambahkan: 12,
          dataDigunakan: 878,
          dataGagal: 0,
          ringkasanPerubahan: {
            hargaBerubah: 0,
            stokBerubah: 156,
            spesifikasiBerubah: 0,
            promoBaru: 0
          },
          status: 'approved',
          reviewedBy: 'Admin Sistem',
          reviewDate: '2024-12-15T09:30:00Z',
          notes: 'Data stok berhasil diperbarui',
          dataPreview: [
            { merk: 'Yamaha', model: 'NMAX', stokLama: 15, stokBaru: 8 },
            { merk: 'Honda', model: 'PCX', stokLama: 22, stokBaru: 18 }
          ]
        },
        {
          id: 'import-003',
          sumberAPI: 'API Promo Dealer',
          tanggalImport: '2024-12-15T08:00:00Z',
          totalData: 45,
          dataBaruDitambahkan: 8,
          dataDigunakan: 32,
          dataGagal: 5,
          ringkasanPerubahan: {
            hargaBerubah: 0,
            stokBerubah: 0,
            spesifikasiBerubah: 0,
            promoBaru: 8
          },
          status: 'rejected',
          reviewedBy: 'Manager Promo',
          reviewDate: '2024-12-15T08:15:00Z',
          notes: 'Data promo tidak sesuai dengan kebijakan perusahaan',
          dataPreview: [
            { merk: 'Toyota', model: 'Innova', promoLama: 'Cashback 5jt', promoBaru: 'Cashback 10jt' }
          ]
        }
      ];

      setDaftarSumberAPI(mockSumberAPI);
      setDaftarHasilImport(mockHasilImport);
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Modul sinkronisasi berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat modul sinkronisasi', 
        success: null 
      });
    }
  };

  // Method: pilihSumberAPI
  const pilihSumberAPI = (sumberAPI: SumberAPI) => {
    setSelectedSumberAPI(sumberAPI);
    setParameterSinkronisasi(prev => ({
      ...prev,
      sumberAPI: sumberAPI.id
    }));
    setStatusHalaman({ 
      loading: false, 
      error: null, 
      success: `Sumber API "${sumberAPI.nama}" dipilih` 
    });
  };

  // Method: aturParameterSinkronisasi
  const aturParameterSinkronisasi = (parameter: ParameterSinkronisasi) => {
    setParameterSinkronisasi(parameter);
    setShowParameterModal(true);
  };

  // Method: triggerSinkronisasiData
  const triggerSinkronisasiData = async () => {
    if (!selectedSumberAPI) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Pilih sumber API terlebih dahulu', 
        success: null 
      });
      return;
    }

    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi memulai sinkronisasi
      const newProgress: ProgressSinkronisasi = {
        id: `sync-${Date.now()}`,
        sumberAPI: selectedSumberAPI.nama,
        status: 'running',
        progress: 0,
        totalRecords: 1000,
        processedRecords: 0,
        successRecords: 0,
        failedRecords: 0,
        startTime: new Date().toISOString(),
        currentOperation: 'Menghubungkan ke API...',
        errors: []
      };

      setProgressSinkronisasi(newProgress);
      setActiveTab('monitor');
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Sinkronisasi data dimulai' 
      });

      // Simulasi progress sinkronisasi
      simulateProgress(newProgress);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memulai sinkronisasi data', 
        success: null 
      });
    }
  };

  // Method: monitorProgressSinkronisasi
  const monitorProgressSinkronisasi = () => {
    setActiveTab('monitor');
    return progressSinkronisasi;
  };

  // Method: reviewHasilImport
  const reviewHasilImport = (hasilImport: HasilImport) => {
    setSelectedHasilImport(hasilImport);
    setReviewNotes(hasilImport.notes || '');
    setShowReviewModal(true);
  };

  // Method: setujuiImport
  const setujuiImport = async () => {
    if (!selectedHasilImport) return;

    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedHasil = {
        ...selectedHasilImport,
        status: 'approved' as const,
        reviewedBy: 'Current Admin',
        reviewDate: new Date().toISOString(),
        notes: reviewNotes
      };

      setDaftarHasilImport(prev => 
        prev.map(h => h.id === selectedHasilImport.id ? updatedHasil : h)
      );

      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Import data berhasil disetujui' 
      });
      setShowReviewModal(false);
      setSelectedHasilImport(null);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyetujui import data', 
        success: null 
      });
    }
  };

  // Method: tolakImport
  const tolakImport = async (alasan: string) => {
    if (!selectedHasilImport) return;

    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedHasil = {
        ...selectedHasilImport,
        status: 'rejected' as const,
        reviewedBy: 'Current Admin',
        reviewDate: new Date().toISOString(),
        notes: alasan
      };

      setDaftarHasilImport(prev => 
        prev.map(h => h.id === selectedHasilImport.id ? updatedHasil : h)
      );

      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Import data berhasil ditolak' 
      });
      setShowReviewModal(false);
      setSelectedHasilImport(null);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menolak import data', 
        success: null 
      });
    }
  };

  // Method: keluarModul
  const keluarModul = () => {
    setShowKeluarModal(true);
  };

  // Helper functions
  const simulateProgress = (initialProgress: ProgressSinkronisasi) => {
    let currentProgress = { ...initialProgress };
    const interval = setInterval(() => {
      currentProgress.progress += Math.random() * 10;
      currentProgress.processedRecords = Math.floor((currentProgress.progress / 100) * currentProgress.totalRecords);
      currentProgress.successRecords = Math.floor(currentProgress.processedRecords * 0.95);
      currentProgress.failedRecords = currentProgress.processedRecords - currentProgress.successRecords;
      
      if (currentProgress.progress < 30) {
        currentProgress.currentOperation = 'Mengambil data dari API...';
      } else if (currentProgress.progress < 60) {
        currentProgress.currentOperation = 'Memproses dan validasi data...';
      } else if (currentProgress.progress < 90) {
        currentProgress.currentOperation = 'Menyimpan data ke database...';
      } else {
        currentProgress.currentOperation = 'Menyelesaikan sinkronisasi...';
      }

      if (currentProgress.progress >= 100) {
        currentProgress.progress = 100;
        currentProgress.status = 'completed';
        currentProgress.endTime = new Date().toISOString();
        currentProgress.currentOperation = 'Sinkronisasi selesai';
        
        // Buat hasil import baru
        const newHasilImport: HasilImport = {
          id: `import-${Date.now()}`,
          sumberAPI: currentProgress.sumberAPI,
          tanggalImport: new Date().toISOString(),
          totalData: currentProgress.totalRecords,
          dataBaruDitambahkan: Math.floor(Math.random() * 50) + 10,
          dataDigunakan: currentProgress.successRecords,
          dataGagal: currentProgress.failedRecords,
          ringkasanPerubahan: {
            hargaBerubah: Math.floor(Math.random() * 200) + 50,
            stokBerubah: Math.floor(Math.random() * 100) + 20,
            spesifikasiBerubah: Math.floor(Math.random() * 30) + 5,
            promoBaru: Math.floor(Math.random() * 15) + 2
          },
          status: 'pending_review',
          dataPreview: [
            { merk: 'Toyota', model: 'Avanza', hargaLama: 250000000, hargaBaru: 255000000 },
            { merk: 'Honda', model: 'Brio', hargaLama: 180000000, hargaBaru: 185000000 }
          ]
        };

        setDaftarHasilImport(prev => [newHasilImport, ...prev]);
        clearInterval(interval);
      }

      setProgressSinkronisasi({ ...currentProgress });
    }, 500);
  };

  const handleKeluarModul = (konfirmasi: boolean) => {
    setShowKeluarModal(false);
    if (konfirmasi) {
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Keluar dari modul sinkronisasi' 
      });
      // Di implementasi nyata, ini akan redirect ke halaman lain
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': case 'approved': return '#28a745';
      case 'running': case 'pending_review': return '#ffc107';
      case 'inactive': case 'paused': return '#6c757d';
      case 'error': case 'failed': case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getJenisColor = (jenis: string) => {
    switch (jenis) {
      case 'harga': return '#007bff';
      case 'stok': return '#28a745';
      case 'spesifikasi': return '#17a2b8';
      case 'promo': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  // Effects
  useEffect(() => {
    aksesModulSinkronisasi();
  }, []);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="dashboard-sinkronisasi">
      <div className="header-section">
        <div className="header-content">
          <h1>Dashboard Sinkronisasi</h1>
          <p>Kelola sinkronisasi data dari berbagai sumber API eksternal</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={triggerSinkronisasiData}
            disabled={!selectedSumberAPI || statusHalaman.loading || progressSinkronisasi?.status === 'running'}
          >
            <i className="fas fa-sync-alt"></i>
            Mulai Sinkronisasi
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setShowParameterModal(true)}
          >
            <i className="fas fa-cog"></i>
            Atur Parameter
          </button>
          <button 
            className="btn-danger"
            onClick={keluarModul}
          >
            <i className="fas fa-sign-out-alt"></i>
            Keluar Modul
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusHalaman.error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {statusHalaman.error}
        </div>
      )}
      
      {statusHalaman.success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {statusHalaman.success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'sumber' ? 'active' : ''}`}
          onClick={() => setActiveTab('sumber')}
        >
          <i className="fas fa-database"></i>
          Sumber API
        </button>
        <button 
          className={`tab-button ${activeTab === 'parameter' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameter')}
        >
          <i className="fas fa-sliders-h"></i>
          Parameter
        </button>
        <button 
          className={`tab-button ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          <i className="fas fa-chart-line"></i>
          Monitor Progress
        </button>
        <button 
          className={`tab-button ${activeTab === 'hasil' ? 'active' : ''}`}
          onClick={() => setActiveTab('hasil')}
        >
          <i className="fas fa-file-import"></i>
          Hasil Import
          {daftarHasilImport.filter(h => h.status === 'pending_review').length > 0 && (
            <span className="notification-badge">
              {daftarHasilImport.filter(h => h.status === 'pending_review').length}
            </span>
          )}
        </button>
      </div>

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat data sinkronisasi...</p>
        </div>
      )}

      {/* Tab Content */}
      {!statusHalaman.loading && (
        <div className="tab-content">
          {/* Tab Sumber API */}
          {activeTab === 'sumber' && (
            <div className="sumber-api-section">
              <div className="section-header">
                <h2>Sumber API Tersedia</h2>
                <p>Pilih sumber API untuk sinkronisasi data</p>
              </div>
              
              <div className="api-grid">
                {daftarSumberAPI.map(api => (
                  <div 
                    key={api.id} 
                    className={`api-card ${selectedSumberAPI?.id === api.id ? 'selected' : ''}`}
                    onClick={() => pilihSumberAPI(api)}
                  >
                    <div className="api-header">
                      <div className="api-title">
                        <h3>{api.nama}</h3>
                        <div className="api-badges">
                          <span 
                            className="badge jenis"
                            style={{ backgroundColor: getJenisColor(api.jenis) }}
                          >
                            {api.jenis}
                          </span>
                          <span 
                            className="badge status"
                            style={{ backgroundColor: getStatusColor(api.status) }}
                          >
                            {api.status}
                          </span>
                        </div>
                      </div>
                      {selectedSumberAPI?.id === api.id && (
                        <div className="selected-indicator">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      )}
                    </div>
                    
                    <div className="api-info">
                      <p className="api-description">{api.description}</p>
                      <div className="api-details">
                        <div className="detail-item">
                          <i className="fas fa-link"></i>
                          <span>{api.url}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-clock"></i>
                          <span>Last sync: {formatDate(api.lastSync)}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-tachometer-alt"></i>
                          <span>Rate limit: {api.rateLimit}/min</span>
                        </div>
                        {api.authRequired && (
                          <div className="detail-item">
                            <i className="fas fa-lock"></i>
                            <span>Authentication required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Parameter */}
          {activeTab === 'parameter' && (
            <div className="parameter-section">
              <div className="section-header">
                <h2>Parameter Sinkronisasi</h2>
                <p>Konfigurasi parameter untuk sinkronisasi data</p>
              </div>
              
              {selectedSumberAPI ? (
                <div className="parameter-form">
                  <div className="selected-api-info">
                    <h3>API Terpilih: {selectedSumberAPI.nama}</h3>
                    <p>{selectedSumberAPI.description}</p>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Interval Sinkronisasi (menit)</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.interval}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          interval: parseInt(e.target.value) || 60
                        }))}
                        min="5"
                        max="1440"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Batch Size</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.batchSize}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          batchSize: parseInt(e.target.value) || 100
                        }))}
                        min="10"
                        max="1000"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Timeout (detik)</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.timeout}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          timeout: parseInt(e.target.value) || 30
                        }))}
                        min="10"
                        max="300"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Retry Count</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.retryCount}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          retryCount: parseInt(e.target.value) || 3
                        }))}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={parameterSinkronisasi.autoSync}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          autoSync: e.target.checked
                        }))}
                      />
                      <span>Auto Sync</span>
                    </label>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={parameterSinkronisasi.notifikasi}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          notifikasi: e.target.checked
                        }))}
                      />
                      <span>Notifikasi</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="no-api-selected">
                  <i className="fas fa-info-circle"></i>
                  <h3>Pilih Sumber API</h3>
                  <p>Pilih sumber API terlebih dahulu untuk mengatur parameter sinkronisasi</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Monitor Progress */}
          {activeTab === 'monitor' && (
            <div className="monitor-section">
              <div className="section-header">
                <h2>Monitor Progress Sinkronisasi</h2>
                <p>Pantau progress sinkronisasi data real-time</p>
              </div>
              
              {progressSinkronisasi ? (
                <div className="progress-container">
                  <div className="progress-header">
                    <h3>Sinkronisasi: {progressSinkronisasi.sumberAPI}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(progressSinkronisasi.status) }}
                    >
                      {progressSinkronisasi.status}
                    </span>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressSinkronisasi.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(progressSinkronisasi.progress)}%</span>
                  </div>
                  
                  <div className="progress-stats">
                    <div className="stat-item">
                      <span>Total Records:</span>
                      <strong>{formatNumber(progressSinkronisasi.totalRecords)}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Processed:</span>
                      <strong>{formatNumber(progressSinkronisasi.processedRecords)}</strong>
                    </div>
                    <div className="stat-item success">
                      <span>Success:</span>
                      <strong>{formatNumber(progressSinkronisasi.successRecords)}</strong>
                    </div>
                    <div className="stat-item error">
                      <span>Failed:</span>
                      <strong>{formatNumber(progressSinkronisasi.failedRecords)}</strong>
                    </div>
                  </div>
                  
                  <div className="current-operation">
                    <i className="fas fa-cog fa-spin"></i>
                    <span>{progressSinkronisasi.currentOperation}</span>
                  </div>
                  
                  <div className="progress-timeline">
                    <div className="timeline-item">
                      <span>Started:</span>
                      <strong>{formatDate(progressSinkronisasi.startTime)}</strong>
                    </div>
                    {progressSinkronisasi.endTime && (
                      <div className="timeline-item">
                        <span>Completed:</span>
                        <strong>{formatDate(progressSinkronisasi.endTime)}</strong>
                      </div>
                    )}
                  </div>
                  
                  {progressSinkronisasi.errors.length > 0 && (
                    <div className="error-list">
                      <h4>Errors:</h4>
                      {progressSinkronisasi.errors.map((error, index) => (
                        <div key={index} className="error-item">
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-progress">
                  <i className="fas fa-chart-line"></i>
                  <h3>Tidak Ada Sinkronisasi Aktif</h3>
                  <p>Mulai sinkronisasi untuk melihat progress real-time</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Hasil Import */}
          {activeTab === 'hasil' && (
            <div className="hasil-section">
              <div className="section-header">
                <h2>Hasil Import Data</h2>
                <p>Review dan kelola hasil import dari sinkronisasi</p>
              </div>
              
              <div className="hasil-grid">
                {daftarHasilImport.map(hasil => (
                  <div key={hasil.id} className="hasil-card">
                    <div className="hasil-header">
                      <div className="hasil-title">
                        <h3>{hasil.sumberAPI}</h3>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(hasil.status) }}
                        >
                          {hasil.status}
                        </span>
                      </div>
                      <div className="hasil-date">
                        {formatDate(hasil.tanggalImport)}
                      </div>
                    </div>
                    
                    <div className="hasil-stats">
                      <div className="stat-row">
                        <span>Total Data:</span>
                        <strong>{formatNumber(hasil.totalData)}</strong>
                      </div>
                      <div className="stat-row success">
                        <span>Data Berhasil:</span>
                        <strong>{formatNumber(hasil.dataDigunakan)}</strong>
                      </div>
                      <div className="stat-row new">
                        <span>Data Baru:</span>
                        <strong>{formatNumber(hasil.dataBaruDitambahkan)}</strong>
                      </div>
                      <div className="stat-row error">
                        <span>Data Gagal:</span>
                        <strong>{formatNumber(hasil.dataGagal)}</strong>
                      </div>
                    </div>
                    
                    <div className="perubahan-summary">
                      <h4>Ringkasan Perubahan:</h4>
                      <div className="perubahan-grid">
                        <div className="perubahan-item">
                          <i className="fas fa-dollar-sign"></i>
                          <span>Harga: {formatNumber(hasil.ringkasanPerubahan.hargaBerubah)}</span>
                        </div>
                        <div className="perubahan-item">
                          <i className="fas fa-boxes"></i>
                          <span>Stok: {formatNumber(hasil.ringkasanPerubahan.stokBerubah)}</span>
                        </div>
                        <div className="perubahan-item">
                          <i className="fas fa-list"></i>
                          <span>Spek: {formatNumber(hasil.ringkasanPerubahan.spesifikasiBerubah)}</span>
                        </div>
                        <div className="perubahan-item">
                          <i className="fas fa-tags"></i>
                          <span>Promo: {formatNumber(hasil.ringkasanPerubahan.promoBaru)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {hasil.reviewedBy && (
                      <div className="review-info">
                        <p><strong>Reviewed by:</strong> {hasil.reviewedBy}</p>
                        <p><strong>Date:</strong> {formatDate(hasil.reviewDate!)}</p>
                        {hasil.notes && <p><strong>Notes:</strong> {hasil.notes}</p>}
                      </div>
                    )}
                    
                    <div className="hasil-actions">
                      {hasil.status === 'pending_review' && (
                        <button 
                          className="btn-primary"
                          onClick={() => reviewHasilImport(hasil)}
                        >
                          <i className="fas fa-eye"></i>
                          Review
                        </button>
                      )}
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedHasilImport(hasil);
                          setShowReviewModal(true);
                        }}
                      >
                        <i className="fas fa-info-circle"></i>
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {daftarHasilImport.length === 0 && (
                <div className="no-hasil">
                  <i className="fas fa-file-import"></i>
                  <h3>Belum Ada Hasil Import</h3>
                  <p>Hasil import akan muncul setelah sinkronisasi selesai</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Parameter */}
      {showParameterModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Atur Parameter Sinkronisasi</h2>
              <button 
                className="btn-close"
                onClick={() => setShowParameterModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="parameter-form">
                <div className="form-section">
                  <h3>Pengaturan Dasar</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Interval Sinkronisasi (menit)</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.interval}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          interval: parseInt(e.target.value) || 60
                        }))}
                        min="5"
                        max="1440"
                      />
                      <small>Interval waktu antara sinkronisasi otomatis</small>
                    </div>
                    
                    <div className="form-group">
                      <label>Batch Size</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.batchSize}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          batchSize: parseInt(e.target.value) || 100
                        }))}
                        min="10"
                        max="1000"
                      />
                      <small>Jumlah record yang diproses per batch</small>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Pengaturan Lanjutan</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Timeout (detik)</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.timeout}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          timeout: parseInt(e.target.value) || 30
                        }))}
                        min="10"
                        max="300"
                      />
                      <small>Timeout untuk setiap request API</small>
                    </div>
                    
                    <div className="form-group">
                      <label>Retry Count</label>
                      <input
                        type="number"
                        value={parameterSinkronisasi.retryCount}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          retryCount: parseInt(e.target.value) || 3
                        }))}
                        min="1"
                        max="10"
                      />
                      <small>Jumlah percobaan ulang jika gagal</small>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Opsi Tambahan</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={parameterSinkronisasi.autoSync}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          autoSync: e.target.checked
                        }))}
                      />
                      <span>Auto Sync</span>
                      <small>Aktifkan sinkronisasi otomatis berdasarkan interval</small>
                    </label>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={parameterSinkronisasi.notifikasi}
                        onChange={(e) => setParameterSinkronisasi(prev => ({
                          ...prev,
                          notifikasi: e.target.checked
                        }))}
                      />
                      <span>Notifikasi</span>
                      <small>Kirim notifikasi setelah sinkronisasi selesai</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowParameterModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowParameterModal(false);
                  setStatusHalaman({ 
                    loading: false, 
                    error: null, 
                    success: 'Parameter sinkronisasi berhasil disimpan' 
                  });
                }}
              >
                Simpan Parameter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Review */}
      {showReviewModal && selectedHasilImport && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Review Hasil Import</h2>
              <button 
                className="btn-close"
                onClick={() => setShowReviewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="review-details">
                <div className="import-summary">
                  <h3>{selectedHasilImport.sumberAPI}</h3>
                  <p>Import Date: {formatDate(selectedHasilImport.tanggalImport)}</p>
                  
                  <div className="summary-stats">
                    <div className="summary-item">
                      <span>Total Data:</span>
                      <strong>{formatNumber(selectedHasilImport.totalData)}</strong>
                    </div>
                    <div className="summary-item success">
                      <span>Berhasil:</span>
                      <strong>{formatNumber(selectedHasilImport.dataDigunakan)}</strong>
                    </div>
                    <div className="summary-item new">
                      <span>Baru:</span>
                      <strong>{formatNumber(selectedHasilImport.dataBaruDitambahkan)}</strong>
                    </div>
                    <div className="summary-item error">
                      <span>Gagal:</span>
                      <strong>{formatNumber(selectedHasilImport.dataGagal)}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="data-preview">
                  <h4>Preview Data:</h4>
                  <div className="preview-table">
                    {selectedHasilImport.dataPreview.map((item, index) => (
                      <div key={index} className="preview-row">
                        <pre>{JSON.stringify(item, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="review-notes">
                  <label>Catatan Review:</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk review ini..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Tutup
              </button>
              {selectedHasilImport.status === 'pending_review' && (
                <>
                  <button 
                    className="btn-danger"
                    onClick={() => tolakImport(reviewNotes)}
                    disabled={statusHalaman.loading}
                  >
                    {statusHalaman.loading ? 'Menolak...' : 'Tolak Import'}
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={setujuiImport}
                    disabled={statusHalaman.loading}
                  >
                    {statusHalaman.loading ? 'Menyetujui...' : 'Setujui Import'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Keluar */}
      {showKeluarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Konfirmasi Keluar</h2>
              <button 
                className="btn-close"
                onClick={() => setShowKeluarModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="keluar-confirmation">
                <i className="fas fa-question-circle question-icon"></i>
                <h3>Apakah Anda yakin ingin keluar dari modul sinkronisasi?</h3>
                <p>Proses sinkronisasi yang sedang berjalan akan tetap berlanjut di background.</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleKeluarModul(false)}
              >
                Batal
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleKeluarModul(true)}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSinkronisasi;