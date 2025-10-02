import React, { useState, useEffect } from 'react';
import './HalamanMenuKredit.css';

// Interface untuk parameter kredit
interface ParameterKredit {
  id: string;
  namaParameter: string;
  jenisKendaraan: 'mobil' | 'motor';
  merkKendaraan: string;
  modelKendaraan: string;
  tahunKendaraan: number;
  hargaKendaraan: number;
  bunga: number; // dalam persen per tahun
  tenor: number; // dalam bulan
  dp: number; // dalam persen
  dpMinimal: number; // dalam rupiah
  cicilanPerBulan: number;
  totalBayar: number;
  status: 'active' | 'inactive';
  tanggalDibuat: string;
  tanggalUpdate: string;
  createdBy: string;
}

// Interface untuk form parameter
interface FormParameter {
  namaParameter: string;
  jenisKendaraan: 'mobil' | 'motor';
  merkKendaraan: string;
  modelKendaraan: string;
  tahunKendaraan: number;
  hargaKendaraan: number;
  bunga: number;
  tenor: number;
  dp: number;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Interface untuk keputusan lanjut
interface KeputusanLanjut {
  aksi: 'kelola' | 'keluar' | null;
  konfirmasi: boolean;
}

const HalamanMenuKredit: React.FC = () => {
  // State management
  const [daftarParameter, setDaftarParameter] = useState<ParameterKredit[]>([]);
  const [filteredParameter, setFilteredParameter] = useState<ParameterKredit[]>([]);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showKeputusanModal, setShowKeputusanModal] = useState(false);
  const [editingParameter, setEditingParameter] = useState<ParameterKredit | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<ParameterKredit | null>(null);
  const [keputusanLanjut, setKeputusanLanjut] = useState<KeputusanLanjut>({
    aksi: null,
    konfirmasi: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [formParameter, setFormParameter] = useState<FormParameter>({
    namaParameter: '',
    jenisKendaraan: 'mobil',
    merkKendaraan: '',
    modelKendaraan: '',
    tahunKendaraan: new Date().getFullYear(),
    hargaKendaraan: 0,
    bunga: 0,
    tenor: 12,
    dp: 20
  });

  // Method: aksesMenuParameterKredit
  const aksesMenuParameterKredit = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data tiruan parameter kredit
      const mockParameter: ParameterKredit[] = [
        {
          id: 'param-001',
          namaParameter: 'Kredit Toyota Avanza 2024',
          jenisKendaraan: 'mobil',
          merkKendaraan: 'Toyota',
          modelKendaraan: 'Avanza',
          tahunKendaraan: 2024,
          hargaKendaraan: 250000000,
          bunga: 8.5,
          tenor: 36,
          dp: 20,
          dpMinimal: 50000000,
          cicilanPerBulan: 7850000,
          totalBayar: 282600000,
          status: 'active',
          tanggalDibuat: '2024-12-01',
          tanggalUpdate: '2024-12-15',
          createdBy: 'Admin Kredit'
        },
        {
          id: 'param-002',
          namaParameter: 'Kredit Honda Brio 2024',
          jenisKendaraan: 'mobil',
          merkKendaraan: 'Honda',
          modelKendaraan: 'Brio',
          tahunKendaraan: 2024,
          hargaKendaraan: 180000000,
          bunga: 7.8,
          tenor: 48,
          dp: 25,
          dpMinimal: 45000000,
          cicilanPerBulan: 4200000,
          totalBayar: 201600000,
          status: 'active',
          tanggalDibuat: '2024-12-02',
          tanggalUpdate: '2024-12-14',
          createdBy: 'Admin Kredit'
        },
        {
          id: 'param-003',
          namaParameter: 'Kredit Yamaha NMAX 2024',
          jenisKendaraan: 'motor',
          merkKendaraan: 'Yamaha',
          modelKendaraan: 'NMAX',
          tahunKendaraan: 2024,
          hargaKendaraan: 35000000,
          bunga: 9.2,
          tenor: 24,
          dp: 30,
          dpMinimal: 10500000,
          cicilanPerBulan: 1350000,
          totalBayar: 32400000,
          status: 'active',
          tanggalDibuat: '2024-12-03',
          tanggalUpdate: '2024-12-13',
          createdBy: 'Admin Kredit'
        },
        {
          id: 'param-004',
          namaParameter: 'Kredit Honda PCX 2024',
          jenisKendaraan: 'motor',
          merkKendaraan: 'Honda',
          modelKendaraan: 'PCX',
          tahunKendaraan: 2024,
          hargaKendaraan: 42000000,
          bunga: 8.9,
          tenor: 36,
          dp: 25,
          dpMinimal: 10500000,
          cicilanPerBulan: 1180000,
          totalBayar: 42480000,
          status: 'inactive',
          tanggalDibuat: '2024-11-15',
          tanggalUpdate: '2024-12-10',
          createdBy: 'Admin Kredit'
        },
        {
          id: 'param-005',
          namaParameter: 'Kredit Mitsubishi Xpander 2024',
          jenisKendaraan: 'mobil',
          merkKendaraan: 'Mitsubishi',
          modelKendaraan: 'Xpander',
          tahunKendaraan: 2024,
          hargaKendaraan: 280000000,
          bunga: 8.2,
          tenor: 60,
          dp: 15,
          dpMinimal: 42000000,
          cicilanPerBulan: 5650000,
          totalBayar: 339000000,
          status: 'active',
          tanggalDibuat: '2024-12-05',
          tanggalUpdate: '2024-12-15',
          createdBy: 'Admin Kredit'
        }
      ];

      setDaftarParameter(mockParameter);
      setFilteredParameter(mockParameter);
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Parameter kredit berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat parameter kredit', 
        success: null 
      });
    }
  };

  // Method: tambahParameterBaru
  const tambahParameterBaru = () => {
    setEditingParameter(null);
    setFormParameter({
      namaParameter: '',
      jenisKendaraan: 'mobil',
      merkKendaraan: '',
      modelKendaraan: '',
      tahunKendaraan: new Date().getFullYear(),
      hargaKendaraan: 0,
      bunga: 0,
      tenor: 12,
      dp: 20
    });
    setShowFormModal(true);
  };

  // Method: inputDataParameter
  const inputDataParameter = async (bunga: number, tenor: number, dp: number) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hitung parameter kredit
      const dpMinimal = (formParameter.hargaKendaraan * dp) / 100;
      const jumlahPinjaman = formParameter.hargaKendaraan - dpMinimal;
      const bungaBulanan = bunga / 100 / 12;
      const cicilanPerBulan = Math.round(
        (jumlahPinjaman * bungaBulanan * Math.pow(1 + bungaBulanan, tenor)) /
        (Math.pow(1 + bungaBulanan, tenor) - 1)
      );
      const totalBayar = dpMinimal + (cicilanPerBulan * tenor);
      
      if (editingParameter) {
        // Update parameter yang sudah ada
        const updatedParameter: ParameterKredit = {
          ...editingParameter,
          ...formParameter,
          bunga,
          tenor,
          dp,
          dpMinimal,
          cicilanPerBulan,
          totalBayar,
          tanggalUpdate: new Date().toISOString().split('T')[0]
        };
        
        setDaftarParameter(prev => 
          prev.map(p => p.id === editingParameter.id ? updatedParameter : p)
        );
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Parameter kredit berhasil diperbarui' 
        });
      } else {
        // Buat parameter baru
        const newParameter: ParameterKredit = {
          id: `param-${Date.now()}`,
          ...formParameter,
          bunga,
          tenor,
          dp,
          dpMinimal,
          cicilanPerBulan,
          totalBayar,
          status: 'active',
          tanggalDibuat: new Date().toISOString().split('T')[0],
          tanggalUpdate: new Date().toISOString().split('T')[0],
          createdBy: 'Current Admin'
        };
        
        setDaftarParameter(prev => [newParameter, ...prev]);
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Parameter kredit baru berhasil ditambahkan' 
        });
      }
      
      setShowFormModal(false);
      setEditingParameter(null);
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyimpan parameter kredit', 
        success: null 
      });
    }
  };

  // Method: editParameterEksisting
  const editParameterEksisting = (idParameter: string) => {
    const parameter = daftarParameter.find(p => p.id === idParameter);
    if (parameter) {
      setEditingParameter(parameter);
      setFormParameter({
        namaParameter: parameter.namaParameter,
        jenisKendaraan: parameter.jenisKendaraan,
        merkKendaraan: parameter.merkKendaraan,
        modelKendaraan: parameter.modelKendaraan,
        tahunKendaraan: parameter.tahunKendaraan,
        hargaKendaraan: parameter.hargaKendaraan,
        bunga: parameter.bunga,
        tenor: parameter.tenor,
        dp: parameter.dp
      });
      setShowFormModal(true);
    }
  };

  // Method: updateDataParameter
  const updateDataParameter = async (dataParameterBaru: FormParameter) => {
    if (!editingParameter) return;
    
    setFormParameter(dataParameterBaru);
    await inputDataParameter(dataParameterBaru.bunga, dataParameterBaru.tenor, dataParameterBaru.dp);
  };

  // Method: hapusParameter
  const hapusParameter = (idParameter: string) => {
    const parameter = daftarParameter.find(p => p.id === idParameter);
    if (parameter) {
      setSelectedParameter(parameter);
      setShowDeleteModal(true);
    }
  };

  // Method: lanjutKelolaParameter
  const lanjutKelolaParameter = () => {
    setKeputusanLanjut({ aksi: 'kelola', konfirmasi: false });
    setShowKeputusanModal(true);
  };

  // Method: periksaKeputusanLanjut
  const periksaKeputusanLanjut = () => {
    return keputusanLanjut;
  };

  // Method: keluarDariMenu
  const keluarDariMenu = () => {
    setKeputusanLanjut({ aksi: 'keluar', konfirmasi: false });
    setShowKeputusanModal(true);
  };

  // Helper functions
  const applyFilters = () => {
    let filtered = daftarParameter;

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter(parameter =>
        parameter.namaParameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parameter.merkKendaraan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parameter.modelKendaraan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan jenis kendaraan
    if (filterJenis) {
      filtered = filtered.filter(p => p.jenisKendaraan === filterJenis);
    }

    // Filter berdasarkan status
    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    setFilteredParameter(filtered);
  };

  const handleDeleteParameter = async () => {
    if (!selectedParameter) return;
    
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDaftarParameter(prev => 
        prev.filter(p => p.id !== selectedParameter.id)
      );
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Parameter kredit berhasil dihapus' 
      });
      setShowDeleteModal(false);
      setSelectedParameter(null);
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menghapus parameter kredit', 
        success: null 
      });
    }
  };

  const handleKeputusanLanjut = (konfirmasi: boolean) => {
    setKeputusanLanjut(prev => ({ ...prev, konfirmasi }));
    setShowKeputusanModal(false);
    
    if (konfirmasi) {
      if (keputusanLanjut.aksi === 'keluar') {
        // Simulasi keluar dari menu
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Keluar dari menu parameter kredit' 
        });
        // Di implementasi nyata, ini akan redirect ke halaman lain
      } else if (keputusanLanjut.aksi === 'kelola') {
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Melanjutkan pengelolaan parameter kredit' 
        });
      }
    }
  };

  const toggleParameterStatus = async (idParameter: string) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDaftarParameter(prev => 
        prev.map(p => 
          p.id === idParameter 
            ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
            : p
        )
      );
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Status parameter berhasil diubah' 
      });
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal mengubah status parameter', 
        success: null 
      });
    }
  };

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
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#28a745' : '#6c757d';
  };

  const getJenisColor = (jenis: string) => {
    return jenis === 'mobil' ? '#007bff' : '#17a2b8';
  };

  // Effects
  useEffect(() => {
    aksesMenuParameterKredit();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterJenis, filterStatus, daftarParameter]);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="halaman-menu-kredit">
      <div className="header-section">
        <div className="header-content">
          <h1>Menu Parameter Kredit</h1>
          <p>Kelola parameter kredit untuk berbagai jenis kendaraan</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={tambahParameterBaru}
            disabled={statusHalaman.loading}
          >
            <i className="fas fa-plus"></i>
            Tambah Parameter
          </button>
          <button 
            className="btn-secondary"
            onClick={lanjutKelolaParameter}
          >
            <i className="fas fa-cog"></i>
            Lanjut Kelola
          </button>
          <button 
            className="btn-danger"
            onClick={keluarDariMenu}
          >
            <i className="fas fa-sign-out-alt"></i>
            Keluar Menu
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

      {/* Filter dan Pencarian */}
      <div className="filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari parameter kredit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option value="mobil">Mobil</option>
            <option value="motor">Motor</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Statistik Parameter */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarParameter.length)}</h3>
            <p>Total Parameter</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarParameter.filter(p => p.status === 'active').length)}</h3>
            <p>Parameter Aktif</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon mobil">
            <i className="fas fa-car"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarParameter.filter(p => p.jenisKendaraan === 'mobil').length)}</h3>
            <p>Parameter Mobil</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon motor">
            <i className="fas fa-motorcycle"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarParameter.filter(p => p.jenisKendaraan === 'motor').length)}</h3>
            <p>Parameter Motor</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat parameter kredit...</p>
        </div>
      )}

      {/* Grid Parameter Kredit */}
      {!statusHalaman.loading && (
        <div className="parameter-grid">
          {filteredParameter.map(parameter => (
            <div key={parameter.id} className="parameter-card">
              <div className="parameter-header">
                <div className="parameter-title">
                  <h3>{parameter.namaParameter}</h3>
                  <div className="parameter-badges">
                    <span 
                      className="badge jenis"
                      style={{ backgroundColor: getJenisColor(parameter.jenisKendaraan) }}
                    >
                      {parameter.jenisKendaraan}
                    </span>
                    <span 
                      className="badge status"
                      style={{ backgroundColor: getStatusColor(parameter.status) }}
                    >
                      {parameter.status}
                    </span>
                  </div>
                </div>
                <div className="parameter-actions">
                  <button 
                    className="btn-toggle"
                    onClick={() => toggleParameterStatus(parameter.id)}
                    title={parameter.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    <i className={`fas ${parameter.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="parameter-info">
                <div className="vehicle-info">
                  <p><strong>Kendaraan:</strong> {parameter.merkKendaraan} {parameter.modelKendaraan} {parameter.tahunKendaraan}</p>
                  <p><strong>Harga:</strong> {formatCurrency(parameter.hargaKendaraan)}</p>
                </div>
                
                <div className="credit-details">
                  <div className="detail-row">
                    <span>Bunga:</span>
                    <strong>{parameter.bunga}% / tahun</strong>
                  </div>
                  <div className="detail-row">
                    <span>Tenor:</span>
                    <strong>{parameter.tenor} bulan</strong>
                  </div>
                  <div className="detail-row">
                    <span>DP:</span>
                    <strong>{parameter.dp}% ({formatCurrency(parameter.dpMinimal)})</strong>
                  </div>
                  <div className="detail-row highlight">
                    <span>Cicilan/Bulan:</span>
                    <strong>{formatCurrency(parameter.cicilanPerBulan)}</strong>
                  </div>
                  <div className="detail-row total">
                    <span>Total Bayar:</span>
                    <strong>{formatCurrency(parameter.totalBayar)}</strong>
                  </div>
                </div>
              </div>
              
              <div className="parameter-meta">
                <small>Dibuat: {formatDate(parameter.tanggalDibuat)} oleh {parameter.createdBy}</small>
                <small>Update: {formatDate(parameter.tanggalUpdate)}</small>
              </div>
              
              <div className="parameter-card-actions">
                <button 
                  className="btn-edit"
                  onClick={() => editParameterEksisting(parameter.id)}
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => hapusParameter(parameter.id)}
                >
                  <i className="fas fa-trash"></i>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!statusHalaman.loading && filteredParameter.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-calculator"></i>
          <h3>Tidak ada parameter kredit ditemukan</h3>
          <p>Belum ada parameter kredit yang sesuai dengan filter yang dipilih</p>
          <button 
            className="btn-primary"
            onClick={tambahParameterBaru}
          >
            <i className="fas fa-plus"></i>
            Tambah Parameter Pertama
          </button>
        </div>
      )}

      {/* Modal Form Parameter */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingParameter ? 'Edit Parameter Kredit' : 'Tambah Parameter Kredit'}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowFormModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              inputDataParameter(formParameter.bunga, formParameter.tenor, formParameter.dp);
            }} className="parameter-form">
              <div className="form-section">
                <h3>Informasi Dasar</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Parameter *</label>
                    <input
                      type="text"
                      value={formParameter.namaParameter}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, namaParameter: e.target.value }))}
                      required
                      placeholder="Masukkan nama parameter"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Jenis Kendaraan *</label>
                    <select
                      value={formParameter.jenisKendaraan}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, jenisKendaraan: e.target.value as 'mobil' | 'motor' }))}
                      required
                    >
                      <option value="mobil">Mobil</option>
                      <option value="motor">Motor</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Merk Kendaraan *</label>
                    <input
                      type="text"
                      value={formParameter.merkKendaraan}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, merkKendaraan: e.target.value }))}
                      required
                      placeholder="Contoh: Toyota, Honda"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Model Kendaraan *</label>
                    <input
                      type="text"
                      value={formParameter.modelKendaraan}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, modelKendaraan: e.target.value }))}
                      required
                      placeholder="Contoh: Avanza, Brio"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tahun Kendaraan *</label>
                    <input
                      type="number"
                      value={formParameter.tahunKendaraan}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, tahunKendaraan: parseInt(e.target.value) || new Date().getFullYear() }))}
                      required
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Harga Kendaraan *</label>
                  <input
                    type="number"
                    value={formParameter.hargaKendaraan}
                    onChange={(e) => setFormParameter(prev => ({ ...prev, hargaKendaraan: parseInt(e.target.value) || 0 }))}
                    required
                    min="0"
                    placeholder="0"
                  />
                  <small>Harga dalam Rupiah</small>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Parameter Kredit</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bunga per Tahun (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formParameter.bunga}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, bunga: parseFloat(e.target.value) || 0 }))}
                      required
                      min="0"
                      max="50"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tenor (Bulan) *</label>
                    <select
                      value={formParameter.tenor}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, tenor: parseInt(e.target.value) }))}
                      required
                    >
                      <option value={12}>12 Bulan</option>
                      <option value={24}>24 Bulan</option>
                      <option value={36}>36 Bulan</option>
                      <option value={48}>48 Bulan</option>
                      <option value={60}>60 Bulan</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Down Payment (%) *</label>
                    <input
                      type="number"
                      value={formParameter.dp}
                      onChange={(e) => setFormParameter(prev => ({ ...prev, dp: parseInt(e.target.value) || 0 }))}
                      required
                      min="10"
                      max="80"
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview Perhitungan */}
              {formParameter.hargaKendaraan > 0 && formParameter.bunga > 0 && (
                <div className="calculation-preview">
                  <h3>Preview Perhitungan</h3>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span>Harga Kendaraan:</span>
                      <strong>{formatCurrency(formParameter.hargaKendaraan)}</strong>
                    </div>
                    <div className="preview-item">
                      <span>DP ({formParameter.dp}%):</span>
                      <strong>{formatCurrency((formParameter.hargaKendaraan * formParameter.dp) / 100)}</strong>
                    </div>
                    <div className="preview-item">
                      <span>Jumlah Pinjaman:</span>
                      <strong>{formatCurrency(formParameter.hargaKendaraan - ((formParameter.hargaKendaraan * formParameter.dp) / 100))}</strong>
                    </div>
                    <div className="preview-item highlight">
                      <span>Cicilan per Bulan:</span>
                      <strong>
                        {(() => {
                          const dpAmount = (formParameter.hargaKendaraan * formParameter.dp) / 100;
                          const loanAmount = formParameter.hargaKendaraan - dpAmount;
                          const monthlyRate = formParameter.bunga / 100 / 12;
                          const installment = Math.round(
                            (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, formParameter.tenor)) /
                            (Math.pow(1 + monthlyRate, formParameter.tenor) - 1)
                          );
                          return formatCurrency(installment);
                        })()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowFormModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={statusHalaman.loading}
                >
                  {statusHalaman.loading ? 'Menyimpan...' : (editingParameter ? 'Update Parameter' : 'Simpan Parameter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && selectedParameter && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Konfirmasi Hapus Parameter</h2>
              <button 
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-confirmation">
                <i className="fas fa-exclamation-triangle warning-icon"></i>
                <h3>Apakah Anda yakin ingin menghapus parameter ini?</h3>
                <p><strong>{selectedParameter.namaParameter}</strong></p>
                <p>Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteParameter}
                disabled={statusHalaman.loading}
              >
                {statusHalaman.loading ? 'Menghapus...' : 'Hapus Parameter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Keputusan Lanjut */}
      {showKeputusanModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Konfirmasi Tindakan</h2>
              <button 
                className="btn-close"
                onClick={() => setShowKeputusanModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="decision-confirmation">
                <i className="fas fa-question-circle question-icon"></i>
                <h3>
                  {keputusanLanjut.aksi === 'keluar' 
                    ? 'Apakah Anda yakin ingin keluar dari menu parameter kredit?' 
                    : 'Apakah Anda ingin melanjutkan pengelolaan parameter kredit?'
                  }
                </h3>
                <p>
                  {keputusanLanjut.aksi === 'keluar' 
                    ? 'Anda akan kembali ke menu utama.' 
                    : 'Anda akan tetap berada di halaman ini untuk mengelola parameter.'
                  }
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleKeputusanLanjut(false)}
              >
                Tidak
              </button>
              <button 
                className={keputusanLanjut.aksi === 'keluar' ? 'btn-danger' : 'btn-primary'}
                onClick={() => handleKeputusanLanjut(true)}
              >
                {keputusanLanjut.aksi === 'keluar' ? 'Ya, Keluar' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanMenuKredit;