import React, { useState, useEffect } from 'react';
import './APIEksternal.css';

// Interface untuk kriteria pencarian
interface KriteriaHarga {
  merk?: string;
  model?: string;
  tahun?: number;
  kategori?: 'mobil' | 'motor';
  jenisHarga?: 'otr' | 'off_the_road' | 'kredit' | 'cash';
  lokasi?: string;
  dealer?: string;
  kondisi?: 'baru' | 'bekas';
  rentangHarga?: {
    min: number;
    max: number;
  };
}

// Interface untuk data harga
interface DataHarga {
  id: string;
  merk: string;
  model: string;
  varian: string;
  tahun: number;
  kategori: 'mobil' | 'motor';
  hargaOTR: number;
  hargaOffTheRoad: number;
  hargaKredit?: number;
  hargaCash?: number;
  lokasi: string;
  dealer: string;
  kondisi: 'baru' | 'bekas';
  spesifikasi: {
    mesin: string;
    transmisi: string;
    bahanBakar: string;
    warna: string[];
  };
  gambar: string;
  status: 'available' | 'sold' | 'reserved';
  lastUpdated: string;
  sumberData: string;
  validUntil: string;
  promo?: {
    judul: string;
    deskripsi: string;
    diskon: number;
    berlakuHingga: string;
  };
}

// Interface untuk response API
interface APIResponse {
  success: boolean;
  data: DataHarga[];
  totalData: number;
  currentPage: number;
  totalPages: number;
  message?: string;
  error?: string;
  metadata: {
    requestId: string;
    timestamp: string;
    source: string;
    processingTime: number;
  };
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const APIEksternal: React.FC = () => {
  // State management
  const [kriteria, setKriteria] = useState<KriteriaHarga>({
    kategori: 'mobil',
    jenisHarga: 'otr',
    kondisi: 'baru'
  });
  const [dataHarga, setDataHarga] = useState<DataHarga[]>([]);
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedData, setSelectedData] = useState<DataHarga | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Daftar merk dan model untuk dropdown
  const merkOptions = {
    mobil: ['Toyota', 'Honda', 'Suzuki', 'Daihatsu', 'Mitsubishi', 'Nissan', 'Mazda', 'Hyundai', 'KIA'],
    motor: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'TVS', 'Benelli', 'Ducati', 'BMW']
  };

  const modelOptions: { [key: string]: string[] } = {
    Toyota: ['Avanza', 'Innova', 'Fortuner', 'Camry', 'Corolla', 'Yaris', 'Vios', 'Rush'],
    Honda: ['Brio', 'Mobilio', 'BR-V', 'HR-V', 'CR-V', 'Civic', 'Accord', 'City'],
    Yamaha: ['NMAX', 'Aerox', 'Lexi', 'Vixion', 'R15', 'R25', 'MT-25', 'Xride'],
    Suzuki: ['Ertiga', 'XL7', 'Baleno', 'Swift', 'Jimny', 'GSX-R150', 'Address', 'Nex']
  };

  // Method: mintaDataHarga
  const mintaDataHarga = async (kriteriaFilter: KriteriaHarga) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock data berdasarkan kriteria
      const mockData: DataHarga[] = generateMockData(kriteriaFilter);
      
      // Simulasi response API
      const response: APIResponse = {
        success: true,
        data: mockData,
        totalData: mockData.length,
        currentPage: 1,
        totalPages: Math.ceil(mockData.length / itemsPerPage),
        message: 'Data harga berhasil diambil',
        metadata: {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'External Price API v2.1',
          processingTime: Math.random() * 1000 + 500 // 500-1500ms
        }
      };

      setApiResponse(response);
      setDataHarga(mockData);
      setCurrentPage(1);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: `Berhasil mengambil ${mockData.length} data harga` 
      });
    } catch (error) {
      const errorMessage = 'Gagal mengambil data harga dari API eksternal';
      setStatusHalaman({ 
        loading: false, 
        error: errorMessage, 
        success: null 
      });
      
      // Simulasi error response
      setApiResponse({
        success: false,
        data: [],
        totalData: 0,
        currentPage: 1,
        totalPages: 0,
        error: errorMessage,
        metadata: {
          requestId: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'External Price API v2.1',
          processingTime: 0
        }
      });
    }
  };

  // Helper function untuk generate mock data
  const generateMockData = (kriteriaFilter: KriteriaHarga): DataHarga[] => {
    const data: DataHarga[] = [];
    const jumlahData = Math.floor(Math.random() * 50) + 20; // 20-70 data
    
    const merkList = kriteriaFilter.merk ? [kriteriaFilter.merk] : merkOptions[kriteriaFilter.kategori || 'mobil'];
    const lokasiList = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang'];
    const dealerList = ['Auto Prima', 'Mobil Sejahtera', 'Kendaraan Jaya', 'Motor Center', 'Dealer Utama'];
    const warnaList = ['Putih', 'Hitam', 'Silver', 'Merah', 'Biru', 'Abu-abu'];
    
    for (let i = 0; i < jumlahData; i++) {
      const merk = merkList[Math.floor(Math.random() * merkList.length)];
      const modelList = modelOptions[merk] || ['Model A', 'Model B', 'Model C'];
      const model = kriteriaFilter.model || modelList[Math.floor(Math.random() * modelList.length)];
      const tahun = kriteriaFilter.tahun || (2020 + Math.floor(Math.random() * 5));
      const hargaBase = kriteriaFilter.kategori === 'mobil' 
        ? 150000000 + Math.random() * 500000000 
        : 15000000 + Math.random() * 50000000;
      
      // Filter berdasarkan rentang harga jika ada
      if (kriteriaFilter.rentangHarga) {
        if (hargaBase < kriteriaFilter.rentangHarga.min || hargaBase > kriteriaFilter.rentangHarga.max) {
          continue;
        }
      }
      
      const dataItem: DataHarga = {
        id: `item-${i + 1}`,
        merk,
        model,
        varian: `${model} ${['Base', 'GL', 'GLS', 'Premium'][Math.floor(Math.random() * 4)]}`,
        tahun,
        kategori: kriteriaFilter.kategori || 'mobil',
        hargaOTR: Math.round(hargaBase),
        hargaOffTheRoad: Math.round(hargaBase * 1.1),
        hargaKredit: Math.round(hargaBase * 0.95),
        hargaCash: Math.round(hargaBase * 0.92),
        lokasi: kriteriaFilter.lokasi || lokasiList[Math.floor(Math.random() * lokasiList.length)],
        dealer: kriteriaFilter.dealer || dealerList[Math.floor(Math.random() * dealerList.length)],
        kondisi: kriteriaFilter.kondisi || 'baru',
        spesifikasi: {
          mesin: kriteriaFilter.kategori === 'mobil' ? '1.5L DOHC' : '150cc SOHC',
          transmisi: ['Manual', 'Automatic', 'CVT'][Math.floor(Math.random() * 3)],
          bahanBakar: ['Bensin', 'Solar', 'Hybrid'][Math.floor(Math.random() * 3)],
          warna: warnaList.slice(0, Math.floor(Math.random() * 3) + 2)
        },
        gambar: `https://via.placeholder.com/300x200?text=${merk}+${model}`,
        status: ['available', 'sold', 'reserved'][Math.floor(Math.random() * 3)] as 'available' | 'sold' | 'reserved',
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        sumberData: 'External Price API',
        validUntil: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        promo: Math.random() > 0.7 ? {
          judul: 'Promo Spesial',
          deskripsi: 'Dapatkan diskon menarik untuk pembelian bulan ini',
          diskon: Math.floor(Math.random() * 20000000) + 5000000,
          berlakuHingga: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        } : undefined
      };
      
      data.push(dataItem);
    }
    
    return data;
  };

  // Handler functions
  const handleKriteriaChange = (field: keyof KriteriaHarga, value: any) => {
    setKriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    mintaDataHarga(kriteria);
  };

  const handleReset = () => {
    setKriteria({
      kategori: 'mobil',
      jenisHarga: 'otr',
      kondisi: 'baru'
    });
    setDataHarga([]);
    setApiResponse(null);
    setCurrentPage(1);
  };

  const handleDetailView = (data: DataHarga) => {
    setSelectedData(data);
    setShowDetailModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#28a745';
      case 'sold': return '#dc3545';
      case 'reserved': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getKategoriIcon = (kategori: string) => {
    return kategori === 'mobil' ? 'fas fa-car' : 'fas fa-motorcycle';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataHarga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataHarga.length / itemsPerPage);

  // Effects
  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="api-eksternal">
      <div className="header-section">
        <div className="header-content">
          <h1>API Eksternal - Data Harga</h1>
          <p>Ambil data harga kendaraan dari sumber API eksternal</p>
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

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h2>Kriteria Pencarian</h2>
          <button 
            className="btn-toggle"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
          >
            <i className={`fas fa-chevron-${showAdvancedFilter ? 'up' : 'down'}`}></i>
            {showAdvancedFilter ? 'Sembunyikan' : 'Tampilkan'} Filter Lanjutan
          </button>
        </div>
        
        <div className="filter-form">
          {/* Basic Filters */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Kategori</label>
              <select
                value={kriteria.kategori}
                onChange={(e) => handleKriteriaChange('kategori', e.target.value as 'mobil' | 'motor')}
              >
                <option value="mobil">Mobil</option>
                <option value="motor">Motor</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Merk</label>
              <select
                value={kriteria.merk || ''}
                onChange={(e) => handleKriteriaChange('merk', e.target.value || undefined)}
              >
                <option value="">Semua Merk</option>
                {merkOptions[kriteria.kategori || 'mobil'].map(merk => (
                  <option key={merk} value={merk}>{merk}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Model</label>
              <select
                value={kriteria.model || ''}
                onChange={(e) => handleKriteriaChange('model', e.target.value || undefined)}
                disabled={!kriteria.merk}
              >
                <option value="">Semua Model</option>
                {kriteria.merk && modelOptions[kriteria.merk]?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Kondisi</label>
              <select
                value={kriteria.kondisi}
                onChange={(e) => handleKriteriaChange('kondisi', e.target.value as 'baru' | 'bekas')}
              >
                <option value="baru">Baru</option>
                <option value="bekas">Bekas</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilter && (
            <div className="advanced-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Tahun</label>
                  <input
                    type="number"
                    value={kriteria.tahun || ''}
                    onChange={(e) => handleKriteriaChange('tahun', parseInt(e.target.value) || undefined)}
                    placeholder="Contoh: 2023"
                    min="2000"
                    max="2025"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Jenis Harga</label>
                  <select
                    value={kriteria.jenisHarga}
                    onChange={(e) => handleKriteriaChange('jenisHarga', e.target.value)}
                  >
                    <option value="otr">OTR (On The Road)</option>
                    <option value="off_the_road">Off The Road</option>
                    <option value="kredit">Harga Kredit</option>
                    <option value="cash">Harga Cash</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Lokasi</label>
                  <input
                    type="text"
                    value={kriteria.lokasi || ''}
                    onChange={(e) => handleKriteriaChange('lokasi', e.target.value || undefined)}
                    placeholder="Contoh: Jakarta"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Dealer</label>
                  <input
                    type="text"
                    value={kriteria.dealer || ''}
                    onChange={(e) => handleKriteriaChange('dealer', e.target.value || undefined)}
                    placeholder="Nama dealer"
                  />
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group range-group">
                  <label>Rentang Harga</label>
                  <div className="range-inputs">
                    <input
                      type="number"
                      value={kriteria.rentangHarga?.min || ''}
                      onChange={(e) => handleKriteriaChange('rentangHarga', {
                        ...kriteria.rentangHarga,
                        min: parseInt(e.target.value) || 0
                      })}
                      placeholder="Harga minimum"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={kriteria.rentangHarga?.max || ''}
                      onChange={(e) => handleKriteriaChange('rentangHarga', {
                        ...kriteria.rentangHarga,
                        max: parseInt(e.target.value) || 0
                      })}
                      placeholder="Harga maksimum"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="filter-actions">
            <button 
              className="btn-primary"
              onClick={handleSearch}
              disabled={statusHalaman.loading}
            >
              <i className="fas fa-search"></i>
              {statusHalaman.loading ? 'Mencari...' : 'Cari Data Harga'}
            </button>
            <button 
              className="btn-secondary"
              onClick={handleReset}
              disabled={statusHalaman.loading}
            >
              <i className="fas fa-undo"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* API Response Info */}
      {apiResponse && (
        <div className="api-response-info">
          <div className="response-header">
            <h3>Informasi Response API</h3>
            <span className={`status-badge ${apiResponse.success ? 'success' : 'error'}`}>
              {apiResponse.success ? 'Success' : 'Error'}
            </span>
          </div>
          
          <div className="response-details">
            <div className="detail-item">
              <span>Request ID:</span>
              <strong>{apiResponse.metadata.requestId}</strong>
            </div>
            <div className="detail-item">
              <span>Source:</span>
              <strong>{apiResponse.metadata.source}</strong>
            </div>
            <div className="detail-item">
              <span>Processing Time:</span>
              <strong>{Math.round(apiResponse.metadata.processingTime)}ms</strong>
            </div>
            <div className="detail-item">
              <span>Timestamp:</span>
              <strong>{formatDate(apiResponse.metadata.timestamp)}</strong>
            </div>
            <div className="detail-item">
              <span>Total Data:</span>
              <strong>{apiResponse.totalData} items</strong>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Mengambil data harga dari API eksternal...</p>
          <small>Mohon tunggu, proses ini mungkin memakan waktu beberapa detik</small>
        </div>
      )}

      {/* Data Results */}
      {!statusHalaman.loading && dataHarga.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Hasil Pencarian</h2>
            <div className="results-info">
              <span>Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, dataHarga.length)} dari {dataHarga.length} data</span>
            </div>
          </div>
          
          <div className="data-grid">
            {currentItems.map(item => (
              <div key={item.id} className="data-card">
                <div className="card-header">
                  <div className="vehicle-info">
                    <div className="vehicle-title">
                      <i className={getKategoriIcon(item.kategori)}></i>
                      <h3>{item.merk} {item.model}</h3>
                    </div>
                    <span className="vehicle-variant">{item.varian}</span>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                </div>
                
                <div className="card-image">
                  <img src={item.gambar} alt={`${item.merk} ${item.model}`} />
                  {item.promo && (
                    <div className="promo-badge">
                      <i className="fas fa-tag"></i>
                      Promo
                    </div>
                  )}
                </div>
                
                <div className="card-content">
                  <div className="price-info">
                    <div className="main-price">
                      <span className="price-label">
                        {kriteria.jenisHarga === 'otr' ? 'Harga OTR' :
                         kriteria.jenisHarga === 'off_the_road' ? 'Off The Road' :
                         kriteria.jenisHarga === 'kredit' ? 'Harga Kredit' : 'Harga Cash'}
                      </span>
                      <span className="price-value">
                        {formatCurrency(
                          kriteria.jenisHarga === 'otr' ? item.hargaOTR :
                          kriteria.jenisHarga === 'off_the_road' ? item.hargaOffTheRoad :
                          kriteria.jenisHarga === 'kredit' ? (item.hargaKredit || item.hargaOTR) :
                          (item.hargaCash || item.hargaOTR)
                        )}
                      </span>
                    </div>
                    
                    {item.promo && (
                      <div className="promo-info">
                        <span className="promo-discount">
                          Hemat {formatCurrency(item.promo.diskon)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="vehicle-details">
                    <div className="detail-row">
                      <span>Tahun:</span>
                      <strong>{item.tahun}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Kondisi:</span>
                      <strong>{item.kondisi}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Lokasi:</span>
                      <strong>{item.lokasi}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Dealer:</span>
                      <strong>{item.dealer}</strong>
                    </div>
                  </div>
                  
                  <div className="spec-summary">
                    <div className="spec-item">
                      <i className="fas fa-cog"></i>
                      <span>{item.spesifikasi.mesin}</span>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-exchange-alt"></i>
                      <span>{item.spesifikasi.transmisi}</span>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-gas-pump"></i>
                      <span>{item.spesifikasi.bahanBakar}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="update-info">
                      <small>Update: {formatDate(item.lastUpdated)}</small>
                    </div>
                    <button 
                      className="btn-detail"
                      onClick={() => handleDetailView(item)}
                    >
                      <i className="fas fa-eye"></i>
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn-page ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="btn-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!statusHalaman.loading && dataHarga.length === 0 && apiResponse && (
        <div className="no-data">
          <i className="fas fa-search"></i>
          <h3>Tidak Ada Data Ditemukan</h3>
          <p>Coba ubah kriteria pencarian atau gunakan filter yang berbeda</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedData && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detail {selectedData.merk} {selectedData.model}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-content">
                <div className="detail-image">
                  <img src={selectedData.gambar} alt={`${selectedData.merk} ${selectedData.model}`} />
                  {selectedData.promo && (
                    <div className="promo-overlay">
                      <div className="promo-content">
                        <h4>{selectedData.promo.judul}</h4>
                        <p>{selectedData.promo.deskripsi}</p>
                        <div className="promo-discount">
                          Hemat {formatCurrency(selectedData.promo.diskon)}
                        </div>
                        <small>Berlaku hingga: {formatDate(selectedData.promo.berlakuHingga)}</small>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="detail-info">
                  <div className="info-section">
                    <h3>Informasi Umum</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span>Merk:</span>
                        <strong>{selectedData.merk}</strong>
                      </div>
                      <div className="info-item">
                        <span>Model:</span>
                        <strong>{selectedData.model}</strong>
                      </div>
                      <div className="info-item">
                        <span>Varian:</span>
                        <strong>{selectedData.varian}</strong>
                      </div>
                      <div className="info-item">
                        <span>Tahun:</span>
                        <strong>{selectedData.tahun}</strong>
                      </div>
                      <div className="info-item">
                        <span>Kategori:</span>
                        <strong>{selectedData.kategori}</strong>
                      </div>
                      <div className="info-item">
                        <span>Kondisi:</span>
                        <strong>{selectedData.kondisi}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h3>Informasi Harga</h3>
                    <div className="price-grid">
                      <div className="price-item">
                        <span>Harga OTR:</span>
                        <strong>{formatCurrency(selectedData.hargaOTR)}</strong>
                      </div>
                      <div className="price-item">
                        <span>Off The Road:</span>
                        <strong>{formatCurrency(selectedData.hargaOffTheRoad)}</strong>
                      </div>
                      {selectedData.hargaKredit && (
                        <div className="price-item">
                          <span>Harga Kredit:</span>
                          <strong>{formatCurrency(selectedData.hargaKredit)}</strong>
                        </div>
                      )}
                      {selectedData.hargaCash && (
                        <div className="price-item">
                          <span>Harga Cash:</span>
                          <strong>{formatCurrency(selectedData.hargaCash)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h3>Spesifikasi</h3>
                    <div className="spec-grid">
                      <div className="spec-item">
                        <i className="fas fa-cog"></i>
                        <div>
                          <span>Mesin</span>
                          <strong>{selectedData.spesifikasi.mesin}</strong>
                        </div>
                      </div>
                      <div className="spec-item">
                        <i className="fas fa-exchange-alt"></i>
                        <div>
                          <span>Transmisi</span>
                          <strong>{selectedData.spesifikasi.transmisi}</strong>
                        </div>
                      </div>
                      <div className="spec-item">
                        <i className="fas fa-gas-pump"></i>
                        <div>
                          <span>Bahan Bakar</span>
                          <strong>{selectedData.spesifikasi.bahanBakar}</strong>
                        </div>
                      </div>
                      <div className="spec-item">
                        <i className="fas fa-palette"></i>
                        <div>
                          <span>Warna Tersedia</span>
                          <strong>{selectedData.spesifikasi.warna.join(', ')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h3>Informasi Dealer</h3>
                    <div className="dealer-info">
                      <div className="dealer-item">
                        <i className="fas fa-store"></i>
                        <div>
                          <span>Dealer</span>
                          <strong>{selectedData.dealer}</strong>
                        </div>
                      </div>
                      <div className="dealer-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <div>
                          <span>Lokasi</span>
                          <strong>{selectedData.lokasi}</strong>
                        </div>
                      </div>
                      <div className="dealer-item">
                        <i className="fas fa-info-circle"></i>
                        <div>
                          <span>Status</span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(selectedData.status) }}
                          >
                            {selectedData.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h3>Informasi Data</h3>
                    <div className="data-info">
                      <div className="data-item">
                        <span>Sumber Data:</span>
                        <strong>{selectedData.sumberData}</strong>
                      </div>
                      <div className="data-item">
                        <span>Last Updated:</span>
                        <strong>{formatDate(selectedData.lastUpdated)}</strong>
                      </div>
                      <div className="data-item">
                        <span>Valid Until:</span>
                        <strong>{formatDate(selectedData.validUntil)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIEksternal;