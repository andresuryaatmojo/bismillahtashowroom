import React, { useState, useEffect } from 'react';
import './HalamanPembayaran.css';

// Interface untuk data pembayaran
interface DataPembayaran {
  id: string;
  nomorTransaksi: string;
  namaCustomer: string;
  emailCustomer: string;
  jenisLayanan: 'iklan' | 'test_drive' | 'konsultasi' | 'perpanjangan';
  jumlahPembayaran: number;
  metodePembayaran: 'transfer' | 'kartu_kredit' | 'e_wallet' | 'cash';
  statusPembayaran: 'pending' | 'verified' | 'rejected' | 'refunded';
  tanggalPembayaran: string;
  tanggalVerifikasi?: string;
  buktiPembayaran: string;
  keterangan?: string;
  adminVerifikator?: string;
}

// Interface untuk tarif layanan
interface TarifLayanan {
  id: string;
  jenisLayanan: string;
  namaLayanan: string;
  hargaDasar: number;
  biayaAdmin: number;
  pajak: number;
  totalTarif: number;
  status: 'active' | 'inactive';
  tanggalUpdate: string;
}

// Interface untuk laporan
interface LaporanPembayaran {
  periode: string;
  totalTransaksi: number;
  totalPendapatan: number;
  totalRefund: number;
  pendapatanBersih: number;
  jumlahVerified: number;
  jumlahPending: number;
  jumlahRejected: number;
  jumlahRefunded: number;
}

// Interface untuk filter
interface FilterPembayaran {
  jenisLayanan: string;
  statusPembayaran: string;
  metodePembayaran: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  minJumlah: string;
  maxJumlah: string;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const HalamanPembayaran: React.FC = () => {
  // State management
  const [daftarPembayaran, setDaftarPembayaran] = useState<DataPembayaran[]>([]);
  const [filteredPembayaran, setFilteredPembayaran] = useState<DataPembayaran[]>([]);
  const [daftarTarif, setDaftarTarif] = useState<TarifLayanan[]>([]);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  const [activeTab, setActiveTab] = useState<'pembayaran' | 'tarif' | 'laporan'>('pembayaran');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterPembayaran>({
    jenisLayanan: '',
    statusPembayaran: '',
    metodePembayaran: '',
    tanggalMulai: '',
    tanggalAkhir: '',
    minJumlah: '',
    maxJumlah: ''
  });
  const [showVerifikasiModal, setShowVerifikasiModal] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState<DataPembayaran | null>(null);
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [editingTarif, setEditingTarif] = useState<TarifLayanan | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [laporanData, setLaporanData] = useState<LaporanPembayaran | null>(null);
  const [formTarif, setFormTarif] = useState({
    jenisLayanan: '',
    namaLayanan: '',
    hargaDasar: 0,
    biayaAdmin: 0,
    pajak: 0
  });

  // Method: aksesHalamanPembayaran
  const aksesHalamanPembayaran = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data tiruan pembayaran
      const mockPembayaran: DataPembayaran[] = [
        {
          id: 'pay-001',
          nomorTransaksi: 'TRX-2024-001',
          namaCustomer: 'Ahmad Wijaya',
          emailCustomer: 'ahmad.wijaya@email.com',
          jenisLayanan: 'iklan',
          jumlahPembayaran: 500000,
          metodePembayaran: 'transfer',
          statusPembayaran: 'pending',
          tanggalPembayaran: '2024-12-15',
          buktiPembayaran: '/uploads/bukti-001.jpg',
          keterangan: 'Pembayaran iklan premium 1 bulan'
        },
        {
          id: 'pay-002',
          nomorTransaksi: 'TRX-2024-002',
          namaCustomer: 'Siti Nurhaliza',
          emailCustomer: 'siti.nurhaliza@email.com',
          jenisLayanan: 'test_drive',
          jumlahPembayaran: 100000,
          metodePembayaran: 'e_wallet',
          statusPembayaran: 'verified',
          tanggalPembayaran: '2024-12-14',
          tanggalVerifikasi: '2024-12-14',
          buktiPembayaran: '/uploads/bukti-002.jpg',
          adminVerifikator: 'Admin Keuangan',
          keterangan: 'Biaya test drive Toyota Avanza'
        },
        {
          id: 'pay-003',
          nomorTransaksi: 'TRX-2024-003',
          namaCustomer: 'Budi Santoso',
          emailCustomer: 'budi.santoso@email.com',
          jenisLayanan: 'konsultasi',
          jumlahPembayaran: 250000,
          metodePembayaran: 'kartu_kredit',
          statusPembayaran: 'verified',
          tanggalPembayaran: '2024-12-13',
          tanggalVerifikasi: '2024-12-13',
          buktiPembayaran: '/uploads/bukti-003.jpg',
          adminVerifikator: 'Admin Keuangan',
          keterangan: 'Konsultasi kredit mobil'
        },
        {
          id: 'pay-004',
          nomorTransaksi: 'TRX-2024-004',
          namaCustomer: 'Maya Sari',
          emailCustomer: 'maya.sari@email.com',
          jenisLayanan: 'perpanjangan',
          jumlahPembayaran: 300000,
          metodePembayaran: 'transfer',
          statusPembayaran: 'rejected',
          tanggalPembayaran: '2024-12-12',
          tanggalVerifikasi: '2024-12-13',
          buktiPembayaran: '/uploads/bukti-004.jpg',
          adminVerifikator: 'Admin Keuangan',
          keterangan: 'Bukti pembayaran tidak valid'
        },
        {
          id: 'pay-005',
          nomorTransaksi: 'TRX-2024-005',
          namaCustomer: 'Rudi Hermawan',
          emailCustomer: 'rudi.hermawan@email.com',
          jenisLayanan: 'iklan',
          jumlahPembayaran: 750000,
          metodePembayaran: 'transfer',
          statusPembayaran: 'refunded',
          tanggalPembayaran: '2024-12-10',
          tanggalVerifikasi: '2024-12-11',
          buktiPembayaran: '/uploads/bukti-005.jpg',
          adminVerifikator: 'Admin Keuangan',
          keterangan: 'Refund atas permintaan customer'
        }
      ];

      // Data tiruan tarif
      const mockTarif: TarifLayanan[] = [
        {
          id: 'tarif-001',
          jenisLayanan: 'iklan',
          namaLayanan: 'Iklan Premium 1 Bulan',
          hargaDasar: 450000,
          biayaAdmin: 25000,
          pajak: 25000,
          totalTarif: 500000,
          status: 'active',
          tanggalUpdate: '2024-12-01'
        },
        {
          id: 'tarif-002',
          jenisLayanan: 'test_drive',
          namaLayanan: 'Test Drive Standar',
          hargaDasar: 85000,
          biayaAdmin: 10000,
          pajak: 5000,
          totalTarif: 100000,
          status: 'active',
          tanggalUpdate: '2024-12-01'
        },
        {
          id: 'tarif-003',
          jenisLayanan: 'konsultasi',
          namaLayanan: 'Konsultasi Kredit',
          hargaDasar: 200000,
          biayaAdmin: 30000,
          pajak: 20000,
          totalTarif: 250000,
          status: 'active',
          tanggalUpdate: '2024-12-01'
        },
        {
          id: 'tarif-004',
          jenisLayanan: 'perpanjangan',
          namaLayanan: 'Perpanjangan Iklan',
          hargaDasar: 270000,
          biayaAdmin: 15000,
          pajak: 15000,
          totalTarif: 300000,
          status: 'active',
          tanggalUpdate: '2024-12-01'
        }
      ];

      setDaftarPembayaran(mockPembayaran);
      setFilteredPembayaran(mockPembayaran);
      setDaftarTarif(mockTarif);
      setStatusHalaman({ loading: false, error: null, success: 'Data pembayaran berhasil dimuat' });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat data pembayaran', 
        success: null 
      });
    }
  };

  // Method: pilihFilter
  const pilihFilter = (kriteriaFilter: Partial<FilterPembayaran>) => {
    setFilter(prev => ({
      ...prev,
      ...kriteriaFilter
    }));
  };

  // Method: pilihVerifikasiPembayaran
  const pilihVerifikasiPembayaran = (idPembayaran: string) => {
    const pembayaran = daftarPembayaran.find(p => p.id === idPembayaran);
    if (pembayaran) {
      setSelectedPembayaran(pembayaran);
      setShowVerifikasiModal(true);
    }
  };

  // Method: pilihAturTarif
  const pilihAturTarif = () => {
    setActiveTab('tarif');
  };

  // Method: inputTarifBaru
  const inputTarifBaru = async (tarifBaru: typeof formTarif) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalTarif = tarifBaru.hargaDasar + tarifBaru.biayaAdmin + tarifBaru.pajak;
      
      if (editingTarif) {
        // Update tarif yang sudah ada
        const updatedTarif: TarifLayanan = {
          ...editingTarif,
          ...tarifBaru,
          totalTarif,
          tanggalUpdate: new Date().toISOString().split('T')[0]
        };
        
        setDaftarTarif(prev => 
          prev.map(t => t.id === editingTarif.id ? updatedTarif : t)
        );
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Tarif berhasil diperbarui' 
        });
      } else {
        // Buat tarif baru
        const newTarif: TarifLayanan = {
          id: `tarif-${Date.now()}`,
          ...tarifBaru,
          totalTarif,
          status: 'active',
          tanggalUpdate: new Date().toISOString().split('T')[0]
        };
        
        setDaftarTarif(prev => [newTarif, ...prev]);
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Tarif baru berhasil ditambahkan' 
        });
      }
      
      setShowTarifModal(false);
      setEditingTarif(null);
      setFormTarif({
        jenisLayanan: '',
        namaLayanan: '',
        hargaDasar: 0,
        biayaAdmin: 0,
        pajak: 0
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyimpan tarif', 
        success: null 
      });
    }
  };

  // Method: pilihProsesRefund
  const pilihProsesRefund = (idPembayaran: string) => {
    const pembayaran = daftarPembayaran.find(p => p.id === idPembayaran);
    if (pembayaran) {
      setSelectedPembayaran(pembayaran);
      setShowRefundModal(true);
    }
  };

  // Method: generateLaporan
  const generateLaporan = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hitung statistik dari data pembayaran
      const totalTransaksi = daftarPembayaran.length;
      const totalPendapatan = daftarPembayaran
        .filter(p => p.statusPembayaran === 'verified')
        .reduce((sum, p) => sum + p.jumlahPembayaran, 0);
      const totalRefund = daftarPembayaran
        .filter(p => p.statusPembayaran === 'refunded')
        .reduce((sum, p) => sum + p.jumlahPembayaran, 0);
      const pendapatanBersih = totalPendapatan - totalRefund;
      
      const jumlahVerified = daftarPembayaran.filter(p => p.statusPembayaran === 'verified').length;
      const jumlahPending = daftarPembayaran.filter(p => p.statusPembayaran === 'pending').length;
      const jumlahRejected = daftarPembayaran.filter(p => p.statusPembayaran === 'rejected').length;
      const jumlahRefunded = daftarPembayaran.filter(p => p.statusPembayaran === 'refunded').length;
      
      const laporan: LaporanPembayaran = {
        periode: 'Desember 2024',
        totalTransaksi,
        totalPendapatan,
        totalRefund,
        pendapatanBersih,
        jumlahVerified,
        jumlahPending,
        jumlahRejected,
        jumlahRefunded
      };
      
      setLaporanData(laporan);
      setActiveTab('laporan');
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Laporan berhasil dibuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal membuat laporan', 
        success: null 
      });
    }
  };

  // Helper functions
  const applyFilters = () => {
    let filtered = daftarPembayaran;

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter(pembayaran =>
        pembayaran.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pembayaran.namaCustomer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pembayaran.emailCustomer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan jenis layanan
    if (filter.jenisLayanan) {
      filtered = filtered.filter(p => p.jenisLayanan === filter.jenisLayanan);
    }

    // Filter berdasarkan status pembayaran
    if (filter.statusPembayaran) {
      filtered = filtered.filter(p => p.statusPembayaran === filter.statusPembayaran);
    }

    // Filter berdasarkan metode pembayaran
    if (filter.metodePembayaran) {
      filtered = filtered.filter(p => p.metodePembayaran === filter.metodePembayaran);
    }

    // Filter berdasarkan tanggal
    if (filter.tanggalMulai) {
      filtered = filtered.filter(p => p.tanggalPembayaran >= filter.tanggalMulai);
    }
    if (filter.tanggalAkhir) {
      filtered = filtered.filter(p => p.tanggalPembayaran <= filter.tanggalAkhir);
    }

    // Filter berdasarkan jumlah
    if (filter.minJumlah) {
      filtered = filtered.filter(p => p.jumlahPembayaran >= parseInt(filter.minJumlah));
    }
    if (filter.maxJumlah) {
      filtered = filtered.filter(p => p.jumlahPembayaran <= parseInt(filter.maxJumlah));
    }

    setFilteredPembayaran(filtered);
  };

  const handleVerifikasiPembayaran = async (status: 'verified' | 'rejected', keterangan?: string) => {
    if (!selectedPembayaran) return;
    
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPembayaran: DataPembayaran = {
        ...selectedPembayaran,
        statusPembayaran: status,
        tanggalVerifikasi: new Date().toISOString().split('T')[0],
        adminVerifikator: 'Current Admin',
        keterangan: keterangan || selectedPembayaran.keterangan
      };
      
      setDaftarPembayaran(prev => 
        prev.map(p => p.id === selectedPembayaran.id ? updatedPembayaran : p)
      );
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: `Pembayaran berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}` 
      });
      setShowVerifikasiModal(false);
      setSelectedPembayaran(null);
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memproses verifikasi', 
        success: null 
      });
    }
  };

  const handleRefund = async () => {
    if (!selectedPembayaran) return;
    
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedPembayaran: DataPembayaran = {
        ...selectedPembayaran,
        statusPembayaran: 'refunded',
        keterangan: refundReason
      };
      
      setDaftarPembayaran(prev => 
        prev.map(p => p.id === selectedPembayaran.id ? updatedPembayaran : p)
      );
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Refund berhasil diproses' 
      });
      setShowRefundModal(false);
      setSelectedPembayaran(null);
      setRefundReason('');
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memproses refund', 
        success: null 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getJenisLayananColor = (jenis: string) => {
    switch (jenis) {
      case 'iklan': return '#007bff';
      case 'test_drive': return '#28a745';
      case 'konsultasi': return '#17a2b8';
      case 'perpanjangan': return '#fd7e14';
      default: return '#6c757d';
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

  // Effects
  useEffect(() => {
    aksesHalamanPembayaran();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filter, daftarPembayaran]);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="halaman-pembayaran">
      <div className="header-section">
        <div className="header-content">
          <h1>Kelola Pembayaran</h1>
          <p>Verifikasi pembayaran, atur tarif, dan kelola refund</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={generateLaporan}
            disabled={statusHalaman.loading}
          >
            <i className="fas fa-chart-bar"></i>
            Generate Laporan
          </button>
          <button 
            className="btn-secondary"
            onClick={pilihAturTarif}
          >
            <i className="fas fa-cog"></i>
            Atur Tarif
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
          className={`tab-button ${activeTab === 'pembayaran' ? 'active' : ''}`}
          onClick={() => setActiveTab('pembayaran')}
        >
          <i className="fas fa-credit-card"></i>
          Pembayaran
        </button>
        <button 
          className={`tab-button ${activeTab === 'tarif' ? 'active' : ''}`}
          onClick={() => setActiveTab('tarif')}
        >
          <i className="fas fa-tags"></i>
          Tarif Layanan
        </button>
        <button 
          className={`tab-button ${activeTab === 'laporan' ? 'active' : ''}`}
          onClick={() => setActiveTab('laporan')}
        >
          <i className="fas fa-chart-line"></i>
          Laporan
        </button>
      </div>

      {/* Tab Content - Pembayaran */}
      {activeTab === 'pembayaran' && (
        <>
          {/* Filter dan Pencarian */}
          <div className="filter-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Cari pembayaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <select
                value={filter.jenisLayanan}
                onChange={(e) => pilihFilter({ jenisLayanan: e.target.value })}
              >
                <option value="">Semua Layanan</option>
                <option value="iklan">Iklan</option>
                <option value="test_drive">Test Drive</option>
                <option value="konsultasi">Konsultasi</option>
                <option value="perpanjangan">Perpanjangan</option>
              </select>
              
              <select
                value={filter.statusPembayaran}
                onChange={(e) => pilihFilter({ statusPembayaran: e.target.value })}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="refunded">Refunded</option>
              </select>
              
              <select
                value={filter.metodePembayaran}
                onChange={(e) => pilihFilter({ metodePembayaran: e.target.value })}
              >
                <option value="">Semua Metode</option>
                <option value="transfer">Transfer Bank</option>
                <option value="kartu_kredit">Kartu Kredit</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="cash">Cash</option>
              </select>
              
              <input
                type="date"
                placeholder="Tanggal Mulai"
                value={filter.tanggalMulai}
                onChange={(e) => pilihFilter({ tanggalMulai: e.target.value })}
              />
              
              <input
                type="date"
                placeholder="Tanggal Akhir"
                value={filter.tanggalAkhir}
                onChange={(e) => pilihFilter({ tanggalAkhir: e.target.value })}
              />
            </div>
          </div>

          {/* Statistik Pembayaran */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="stat-content">
                <h3>{formatNumber(daftarPembayaran.length)}</h3>
                <p>Total Transaksi</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{formatNumber(daftarPembayaran.filter(p => p.statusPembayaran === 'pending').length)}</h3>
                <p>Menunggu Verifikasi</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon verified">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{formatNumber(daftarPembayaran.filter(p => p.statusPembayaran === 'verified').length)}</h3>
                <p>Terverifikasi</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon revenue">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(daftarPembayaran.filter(p => p.statusPembayaran === 'verified').reduce((sum, p) => sum + p.jumlahPembayaran, 0))}</h3>
                <p>Total Pendapatan</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {statusHalaman.loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat data pembayaran...</p>
            </div>
          )}

          {/* Tabel Pembayaran */}
          {!statusHalaman.loading && (
            <div className="table-container">
              <table className="pembayaran-table">
                <thead>
                  <tr>
                    <th>No. Transaksi</th>
                    <th>Customer</th>
                    <th>Layanan</th>
                    <th>Jumlah</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPembayaran.map(pembayaran => (
                    <tr key={pembayaran.id}>
                      <td>
                        <div className="transaction-info">
                          <strong>{pembayaran.nomorTransaksi}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <strong>{pembayaran.namaCustomer}</strong>
                          <small>{pembayaran.emailCustomer}</small>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="badge layanan"
                          style={{ backgroundColor: getJenisLayananColor(pembayaran.jenisLayanan) }}
                        >
                          {pembayaran.jenisLayanan.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <strong>{formatCurrency(pembayaran.jumlahPembayaran)}</strong>
                      </td>
                      <td>
                        <span className="metode-pembayaran">
                          {pembayaran.metodePembayaran.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="badge status"
                          style={{ backgroundColor: getStatusColor(pembayaran.statusPembayaran) }}
                        >
                          {pembayaran.statusPembayaran}
                        </span>
                      </td>
                      <td>{formatDate(pembayaran.tanggalPembayaran)}</td>
                      <td>
                        <div className="action-buttons">
                          {pembayaran.statusPembayaran === 'pending' && (
                            <button 
                              className="btn-verify"
                              onClick={() => pilihVerifikasiPembayaran(pembayaran.id)}
                            >
                              <i className="fas fa-check"></i>
                              Verifikasi
                            </button>
                          )}
                          {pembayaran.statusPembayaran === 'verified' && (
                            <button 
                              className="btn-refund"
                              onClick={() => pilihProsesRefund(pembayaran.id)}
                            >
                              <i className="fas fa-undo"></i>
                              Refund
                            </button>
                          )}
                          <button 
                            className="btn-detail"
                            onClick={() => window.open(pembayaran.buktiPembayaran, '_blank')}
                          >
                            <i className="fas fa-eye"></i>
                            Bukti
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!statusHalaman.loading && filteredPembayaran.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-credit-card"></i>
              <h3>Tidak ada pembayaran ditemukan</h3>
              <p>Belum ada pembayaran yang sesuai dengan filter yang dipilih</p>
            </div>
          )}
        </>
      )}

      {/* Tab Content - Tarif */}
      {activeTab === 'tarif' && (
        <>
          <div className="tarif-header">
            <h2>Kelola Tarif Layanan</h2>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingTarif(null);
                setFormTarif({
                  jenisLayanan: '',
                  namaLayanan: '',
                  hargaDasar: 0,
                  biayaAdmin: 0,
                  pajak: 0
                });
                setShowTarifModal(true);
              }}
            >
              <i className="fas fa-plus"></i>
              Tambah Tarif
            </button>
          </div>

          <div className="tarif-grid">
            {daftarTarif.map(tarif => (
              <div key={tarif.id} className="tarif-card">
                <div className="tarif-header-card">
                  <h3>{tarif.namaLayanan}</h3>
                  <span 
                    className={`status-badge ${tarif.status}`}
                  >
                    {tarif.status}
                  </span>
                </div>
                
                <div className="tarif-details">
                  <div className="tarif-item">
                    <span>Harga Dasar:</span>
                    <strong>{formatCurrency(tarif.hargaDasar)}</strong>
                  </div>
                  <div className="tarif-item">
                    <span>Biaya Admin:</span>
                    <strong>{formatCurrency(tarif.biayaAdmin)}</strong>
                  </div>
                  <div className="tarif-item">
                    <span>Pajak:</span>
                    <strong>{formatCurrency(tarif.pajak)}</strong>
                  </div>
                  <div className="tarif-item total">
                    <span>Total:</span>
                    <strong>{formatCurrency(tarif.totalTarif)}</strong>
                  </div>
                </div>
                
                <div className="tarif-meta">
                  <small>Diupdate: {formatDate(tarif.tanggalUpdate)}</small>
                </div>
                
                <div className="tarif-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => {
                      setEditingTarif(tarif);
                      setFormTarif({
                        jenisLayanan: tarif.jenisLayanan,
                        namaLayanan: tarif.namaLayanan,
                        hargaDasar: tarif.hargaDasar,
                        biayaAdmin: tarif.biayaAdmin,
                        pajak: tarif.pajak
                      });
                      setShowTarifModal(true);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab Content - Laporan */}
      {activeTab === 'laporan' && laporanData && (
        <div className="laporan-section">
          <div className="laporan-header">
            <h2>Laporan Pembayaran - {laporanData.periode}</h2>
            <button 
              className="btn-primary"
              onClick={() => window.print()}
            >
              <i className="fas fa-print"></i>
              Cetak Laporan
            </button>
          </div>

          <div className="laporan-stats">
            <div className="laporan-card">
              <h3>Ringkasan Transaksi</h3>
              <div className="laporan-item">
                <span>Total Transaksi:</span>
                <strong>{formatNumber(laporanData.totalTransaksi)}</strong>
              </div>
              <div className="laporan-item">
                <span>Terverifikasi:</span>
                <strong>{formatNumber(laporanData.jumlahVerified)}</strong>
              </div>
              <div className="laporan-item">
                <span>Pending:</span>
                <strong>{formatNumber(laporanData.jumlahPending)}</strong>
              </div>
              <div className="laporan-item">
                <span>Ditolak:</span>
                <strong>{formatNumber(laporanData.jumlahRejected)}</strong>
              </div>
              <div className="laporan-item">
                <span>Refund:</span>
                <strong>{formatNumber(laporanData.jumlahRefunded)}</strong>
              </div>
            </div>

            <div className="laporan-card">
              <h3>Ringkasan Keuangan</h3>
              <div className="laporan-item">
                <span>Total Pendapatan:</span>
                <strong className="positive">{formatCurrency(laporanData.totalPendapatan)}</strong>
              </div>
              <div className="laporan-item">
                <span>Total Refund:</span>
                <strong className="negative">{formatCurrency(laporanData.totalRefund)}</strong>
              </div>
              <div className="laporan-item total">
                <span>Pendapatan Bersih:</span>
                <strong className="positive">{formatCurrency(laporanData.pendapatanBersih)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Pembayaran */}
      {showVerifikasiModal && selectedPembayaran && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Verifikasi Pembayaran</h2>
              <button 
                className="btn-close"
                onClick={() => setShowVerifikasiModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="pembayaran-detail">
                <h3>{selectedPembayaran.nomorTransaksi}</h3>
                <p><strong>Customer:</strong> {selectedPembayaran.namaCustomer}</p>
                <p><strong>Layanan:</strong> {selectedPembayaran.jenisLayanan}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(selectedPembayaran.jumlahPembayaran)}</p>
                <p><strong>Metode:</strong> {selectedPembayaran.metodePembayaran}</p>
                <p><strong>Tanggal:</strong> {formatDate(selectedPembayaran.tanggalPembayaran)}</p>
                
                <div className="bukti-pembayaran">
                  <img 
                    src={selectedPembayaran.buktiPembayaran} 
                    alt="Bukti Pembayaran"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '15px' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowVerifikasiModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleVerifikasiPembayaran('rejected', 'Bukti pembayaran tidak valid')}
                disabled={statusHalaman.loading}
              >
                {statusHalaman.loading ? 'Memproses...' : 'Tolak'}
              </button>
              <button 
                className="btn-success"
                onClick={() => handleVerifikasiPembayaran('verified')}
                disabled={statusHalaman.loading}
              >
                {statusHalaman.loading ? 'Memproses...' : 'Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tarif */}
      {showTarifModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTarif ? 'Edit Tarif' : 'Tambah Tarif Baru'}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowTarifModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              inputTarifBaru(formTarif);
            }} className="tarif-form">
              <div className="form-group">
                <label>Jenis Layanan *</label>
                <select
                  value={formTarif.jenisLayanan}
                  onChange={(e) => setFormTarif(prev => ({ ...prev, jenisLayanan: e.target.value }))}
                  required
                >
                  <option value="">Pilih Jenis Layanan</option>
                  <option value="iklan">Iklan</option>
                  <option value="test_drive">Test Drive</option>
                  <option value="konsultasi">Konsultasi</option>
                  <option value="perpanjangan">Perpanjangan</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Nama Layanan *</label>
                <input
                  type="text"
                  value={formTarif.namaLayanan}
                  onChange={(e) => setFormTarif(prev => ({ ...prev, namaLayanan: e.target.value }))}
                  required
                  placeholder="Masukkan nama layanan"
                />
              </div>
              
              <div className="form-group">
                <label>Harga Dasar *</label>
                <input
                  type="number"
                  value={formTarif.hargaDasar}
                  onChange={(e) => setFormTarif(prev => ({ ...prev, hargaDasar: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Biaya Admin</label>
                <input
                  type="number"
                  value={formTarif.biayaAdmin}
                  onChange={(e) => setFormTarif(prev => ({ ...prev, biayaAdmin: parseInt(e.target.value) || 0 }))}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Pajak</label>
                <input
                  type="number"
                  value={formTarif.pajak}
                  onChange={(e) => setFormTarif(prev => ({ ...prev, pajak: parseInt(e.target.value) || 0 }))}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="total-preview">
                <strong>Total Tarif: {formatCurrency(formTarif.hargaDasar + formTarif.biayaAdmin + formTarif.pajak)}</strong>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowTarifModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={statusHalaman.loading}
                >
                  {statusHalaman.loading ? 'Menyimpan...' : (editingTarif ? 'Update Tarif' : 'Simpan Tarif')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Refund */}
      {showRefundModal && selectedPembayaran && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Proses Refund</h2>
              <button 
                className="btn-close"
                onClick={() => setShowRefundModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="refund-info">
                <h3>{selectedPembayaran.nomorTransaksi}</h3>
                <p><strong>Customer:</strong> {selectedPembayaran.namaCustomer}</p>
                <p><strong>Jumlah Refund:</strong> {formatCurrency(selectedPembayaran.jumlahPembayaran)}</p>
              </div>
              
              <div className="form-group">
                <label>Alasan Refund *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Masukkan alasan refund..."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowRefundModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-danger"
                onClick={handleRefund}
                disabled={statusHalaman.loading || !refundReason.trim()}
              >
                {statusHalaman.loading ? 'Memproses...' : 'Proses Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanPembayaran;