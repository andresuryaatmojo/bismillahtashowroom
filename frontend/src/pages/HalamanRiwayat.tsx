import React, { useState, useEffect } from 'react';

// Interfaces
interface DataMobil {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  foto: string[];
  harga: number;
}

interface DataTransaksi {
  id: string;
  mobilId: string;
  mobil: DataMobil;
  tanggalTransaksi: string;
  jenisTransaksi: 'pembelian' | 'test-drive' | 'service' | 'konsultasi';
  status: 'completed' | 'pending' | 'cancelled';
  totalHarga?: number;
  metodePembayaran?: string;
  catatan?: string;
  dealer: {
    nama: string;
    lokasi: string;
  };
  hasReview: boolean;
}

interface DataUlasan {
  id: string;
  transaksiId: string;
  mobilId: string;
  rating: number;
  komentar: string;
  foto: string[];
  tanggalUlasan: string;
  helpful: number;
  status: 'published' | 'pending' | 'rejected';
}

interface KriteriaFilter {
  jenisTransaksi: string;
  status: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  dealer: string;
  hasReview: boolean | null;
}

interface StatusHalaman {
  view: 'list' | 'review-form' | 'review-success' | 'detail';
  loading: boolean;
  error: string | null;
  selectedTransaksi: DataTransaksi | null;
  reviewData: Partial<DataUlasan>;
  uploadedPhotos: File[];
  filter: KriteriaFilter;
  showFilterModal: boolean;
}

const HalamanRiwayat: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    view: 'list',
    loading: true,
    error: null,
    selectedTransaksi: null,
    reviewData: {},
    uploadedPhotos: [],
    filter: {
      jenisTransaksi: '',
      status: '',
      tanggalMulai: '',
      tanggalAkhir: '',
      dealer: '',
      hasReview: null
    },
    showFilterModal: false
  });

  const [daftarTransaksi, setDaftarTransaksi] = useState<DataTransaksi[]>([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState<DataTransaksi[]>([]);
  const [daftarDealer, setDaftarDealer] = useState<string[]>([]);

  // Methods implementation
  const aksesHalamanRiwayat = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'list' }));
    
    // Simulate API call to load transaction history
    setTimeout(() => {
      const mockTransaksi: DataTransaksi[] = [
        {
          id: 'TXN001',
          mobilId: 'MOB001',
          mobil: {
            id: 'MOB001',
            merk: 'Toyota',
            model: 'Camry',
            tahun: 2023,
            warna: 'Putih Mutiara',
            foto: ['camry1.jpg', 'camry2.jpg'],
            harga: 650000000
          },
          tanggalTransaksi: '2024-01-15',
          jenisTransaksi: 'pembelian',
          status: 'completed',
          totalHarga: 650000000,
          metodePembayaran: 'Kredit',
          catatan: 'Pembelian dengan paket asuransi',
          dealer: {
            nama: 'Toyota Fatmawati',
            lokasi: 'Jakarta Selatan'
          },
          hasReview: false
        },
        {
          id: 'TXN002',
          mobilId: 'MOB002',
          mobil: {
            id: 'MOB002',
            merk: 'Honda',
            model: 'Civic',
            tahun: 2022,
            warna: 'Hitam',
            foto: ['civic1.jpg'],
            harga: 450000000
          },
          tanggalTransaksi: '2024-01-10',
          jenisTransaksi: 'test-drive',
          status: 'completed',
          dealer: {
            nama: 'Honda Kemang',
            lokasi: 'Jakarta Selatan'
          },
          hasReview: true
        },
        {
          id: 'TXN003',
          mobilId: 'MOB003',
          mobil: {
            id: 'MOB003',
            merk: 'Mazda',
            model: 'CX-5',
            tahun: 2023,
            warna: 'Merah',
            foto: ['cx5.jpg'],
            harga: 580000000
          },
          tanggalTransaksi: '2024-01-05',
          jenisTransaksi: 'konsultasi',
          status: 'completed',
          dealer: {
            nama: 'Mazda Pondok Indah',
            lokasi: 'Jakarta Selatan'
          },
          hasReview: false
        }
      ];
      
      setDaftarTransaksi(mockTransaksi);
      setFilteredTransaksi(mockTransaksi);
      
      // Extract unique dealers
      const dealers = [...new Set(mockTransaksi.map(t => t.dealer.nama))];
      setDaftarDealer(dealers);
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const pilihMobilUntukDiulas = (idMobil: string) => {
    const transaksi = daftarTransaksi.find(t => t.mobilId === idMobil && !t.hasReview);
    if (transaksi) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedTransaksi: transaksi,
        view: 'review-form',
        reviewData: {
          transaksiId: transaksi.id,
          mobilId: idMobil,
          rating: 0,
          komentar: '',
          foto: []
        }
      }));
    }
  };

  const inputRatingDanUlasan = (rating: number, komentar: string) => {
    setStatusHalaman(prev => ({
      ...prev,
      reviewData: {
        ...prev.reviewData,
        rating,
        komentar
      }
    }));
  };

  const putuskanTambahFoto = (keputusan: boolean) => {
    if (!keputusan) {
      setStatusHalaman(prev => ({
        ...prev,
        uploadedPhotos: []
      }));
    }
  };

  const unggahFoto = (fileFoto: File[]) => {
    setStatusHalaman(prev => ({
      ...prev,
      uploadedPhotos: [...prev.uploadedPhotos, ...fileFoto]
    }));
  };

  const kirimUlasan = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const ulasanBaru: DataUlasan = {
        id: Date.now().toString(),
        transaksiId: statusHalaman.reviewData.transaksiId!,
        mobilId: statusHalaman.reviewData.mobilId!,
        rating: statusHalaman.reviewData.rating!,
        komentar: statusHalaman.reviewData.komentar!,
        foto: statusHalaman.uploadedPhotos.map(f => f.name),
        tanggalUlasan: new Date().toISOString(),
        helpful: 0,
        status: 'published'
      };
      
      // Update transaction to mark as reviewed
      setDaftarTransaksi(prev => 
        prev.map(t => 
          t.id === statusHalaman.reviewData.transaksiId 
            ? { ...t, hasReview: true }
            : t
        )
      );
      
      setStatusHalaman(prev => ({
        ...prev,
        view: 'review-success',
        loading: false,
        reviewData: ulasanBaru
      }));
    }, 2000);
  };

  const terapkanFilter = (kriteriaFilter: KriteriaFilter) => {
    let filtered = [...daftarTransaksi];
    
    if (kriteriaFilter.jenisTransaksi) {
      filtered = filtered.filter(t => t.jenisTransaksi === kriteriaFilter.jenisTransaksi);
    }
    
    if (kriteriaFilter.status) {
      filtered = filtered.filter(t => t.status === kriteriaFilter.status);
    }
    
    if (kriteriaFilter.dealer) {
      filtered = filtered.filter(t => t.dealer.nama === kriteriaFilter.dealer);
    }
    
    if (kriteriaFilter.hasReview !== null) {
      filtered = filtered.filter(t => t.hasReview === kriteriaFilter.hasReview);
    }
    
    if (kriteriaFilter.tanggalMulai) {
      filtered = filtered.filter(t => new Date(t.tanggalTransaksi) >= new Date(kriteriaFilter.tanggalMulai));
    }
    
    if (kriteriaFilter.tanggalAkhir) {
      filtered = filtered.filter(t => new Date(t.tanggalTransaksi) <= new Date(kriteriaFilter.tanggalAkhir));
    }
    
    setFilteredTransaksi(filtered);
    setStatusHalaman(prev => ({
      ...prev,
      filter: kriteriaFilter,
      showFilterModal: false
    }));
  };

  const lihatDaftarRiwayat = () => {
    setStatusHalaman(prev => ({ ...prev, view: 'list' }));
  };

  const pilihTransaksiTertentu = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (transaksi) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedTransaksi: transaksi,
        view: 'detail'
      }));
    }
  };

  const pilihAksi = (jenisAksi: string) => {
    if (!statusHalaman.selectedTransaksi) return;
    
    switch (jenisAksi) {
      case 'review':
        pilihMobilUntukDiulas(statusHalaman.selectedTransaksi.mobilId);
        break;
      case 'repeat-order':
        // Navigate to purchase page with same car
        window.location.href = `/pembelian?mobil=${statusHalaman.selectedTransaksi.mobilId}`;
        break;
      case 'contact-dealer':
        // Navigate to chat with dealer
        window.location.href = `/chat?dealer=${statusHalaman.selectedTransaksi.dealer.nama}`;
        break;
      case 'download-invoice':
        // Download invoice
        alert('Mengunduh invoice...');
        break;
      default:
        break;
    }
  };

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Required Transaction History Methods
  const aksesMenuRiwayat = () => {
    setStatusHalaman(prev => ({ ...prev, view: 'list' }));
    aksesHalamanRiwayat();
  };

  const lihatRiwayatTransaksi = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call to load all transaction history
    setTimeout(() => {
      setFilteredTransaksi(daftarTransaksi);
      setStatusHalaman(prev => ({ ...prev, loading: false, view: 'list' }));
    }, 500);
  };

  const filterRiwayat = (kriteria: Partial<KriteriaFilter>) => {
    const newFilter = { ...statusHalaman.filter, ...kriteria };
    terapkanFilter(newFilter);
  };

  const exportRiwayat = (format: 'pdf' | 'excel' | 'csv') => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate export process
    setTimeout(() => {
      const data = filteredTransaksi.map(t => ({
        'ID Transaksi': t.id,
        'Tanggal': formatDate(t.tanggalTransaksi),
        'Jenis Transaksi': t.jenisTransaksi,
        'Mobil': `${t.mobil.merk} ${t.mobil.model} ${t.mobil.tahun}`,
        'Status': t.status,
        'Total Harga': t.totalHarga ? formatCurrency(t.totalHarga) : '-',
        'Dealer': t.dealer.nama,
        'Lokasi': t.dealer.lokasi,
        'Sudah Diulas': t.hasReview ? 'Ya' : 'Tidak'
      }));

      // Create and download file
      const filename = `riwayat-transaksi-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        const csv = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For PDF and Excel, simulate download
        alert(`File ${filename} berhasil diunduh!`);
      }
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 2000);
  };

  const detailTransaksi = (idTransaksi: string) => {
    pilihTransaksiTertentu(idTransaksi);
  };

  const batalkanTransaksi = async (idTransaksi: string, alasan: string) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDaftarTransaksi(prev => 
        prev.map(t => 
          t.id === idTransaksi 
            ? { ...t, status: 'cancelled' as const, catatan: `Dibatalkan: ${alasan}` }
            : t
        )
      );
      
      // Update filtered list
      setFilteredTransaksi(prev => 
        prev.map(t => 
          t.id === idTransaksi 
            ? { ...t, status: 'cancelled' as const, catatan: `Dibatalkan: ${alasan}` }
            : t
        )
      );
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Transaksi berhasil dibatalkan');
    } catch (error) {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Gagal membatalkan transaksi');
    }
  };

  const ulasanTransaksi = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (transaksi && !transaksi.hasReview) {
      pilihMobilUntukDiulas(transaksi.mobilId);
    } else {
      alert('Transaksi ini sudah diulas atau tidak dapat diulas');
    }
  };

  const cetakInvoice = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan');
      return;
    }

    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate invoice generation
    setTimeout(() => {
      const invoiceData = {
        id: transaksi.id,
        tanggal: formatDate(transaksi.tanggalTransaksi),
        mobil: `${transaksi.mobil.merk} ${transaksi.mobil.model} ${transaksi.mobil.tahun}`,
        harga: transaksi.totalHarga ? formatCurrency(transaksi.totalHarga) : '-',
        dealer: transaksi.dealer.nama,
        lokasi: transaksi.dealer.lokasi,
        metodePembayaran: transaksi.metodePembayaran || '-'
      };

      // Create invoice content
      const invoiceContent = `
        INVOICE TRANSAKSI
        ================
        
        ID Transaksi: ${invoiceData.id}
        Tanggal: ${invoiceData.tanggal}
        
        Detail Mobil:
        ${invoiceData.mobil}
        
        Harga: ${invoiceData.harga}
        Metode Pembayaran: ${invoiceData.metodePembayaran}
        
        Dealer: ${invoiceData.dealer}
        Lokasi: ${invoiceData.lokasi}
        
        Terima kasih atas kepercayaan Anda!
      `;

      // Create and download PDF (simulated)
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaksi.id}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Invoice berhasil diunduh!');
    }, 1000);
  };

  const trackingStatus = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan');
      return;
    }

    // Simulate tracking information
    const trackingInfo = {
      'completed': [
        { status: 'Pesanan Diterima', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Verifikasi Dokumen', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Proses Pembayaran', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Penyiapan Kendaraan', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Serah Terima', tanggal: transaksi.tanggalTransaksi, selesai: true }
      ],
      'pending': [
        { status: 'Pesanan Diterima', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Verifikasi Dokumen', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Proses Pembayaran', tanggal: '', selesai: false },
        { status: 'Penyiapan Kendaraan', tanggal: '', selesai: false },
        { status: 'Serah Terima', tanggal: '', selesai: false }
      ],
      'cancelled': [
        { status: 'Pesanan Diterima', tanggal: transaksi.tanggalTransaksi, selesai: true },
        { status: 'Dibatalkan', tanggal: transaksi.tanggalTransaksi, selesai: true }
      ]
    };

    const info = trackingInfo[transaksi.status] || [];
    const trackingText = info.map(item => 
      `${item.selesai ? '✓' : '○'} ${item.status} ${item.tanggal ? `(${formatDate(item.tanggal)})` : ''}`
    ).join('\n');

    alert(`Status Tracking Transaksi ${transaksi.id}:\n\n${trackingText}`);
  };

  const riwayatTestDrive = () => {
    const testDriveTransaksi = daftarTransaksi.filter(t => t.jenisTransaksi === 'test-drive');
    setFilteredTransaksi(testDriveTransaksi);
    setStatusHalaman(prev => ({
      ...prev,
      filter: { ...prev.filter, jenisTransaksi: 'test-drive' }
    }));
  };

  const getTransactionIcon = (jenis: string): string => {
    switch (jenis) {
      case 'pembelian': return '🛒';
      case 'test-drive': return '🚗';
      case 'service': return '🔧';
      case 'konsultasi': return '💬';
      default: return '📄';
    }
  };

  const resetFilter = () => {
    const emptyFilter: KriteriaFilter = {
      jenisTransaksi: '',
      status: '',
      tanggalMulai: '',
      tanggalAkhir: '',
      dealer: '',
      hasReview: null
    };
    terapkanFilter(emptyFilter);
  };

  // Load initial data
  useEffect(() => {
    aksesHalamanRiwayat();
  }, []);

  if (statusHalaman.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* List View */}
      {statusHalaman.view === 'list' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
            <p className="text-gray-600">Kelola dan ulas transaksi Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{daftarTransaksi.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daftarTransaksi.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Sudah Diulas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daftarTransaksi.filter(t => t.hasReview).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Pembelian</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      daftarTransaksi
                        .filter(t => t.jenisTransaksi === 'pembelian' && t.totalHarga)
                        .reduce((sum, t) => sum + (t.totalHarga || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusHalaman.filter.jenisTransaksi}
                  onChange={(e) => terapkanFilter({ ...statusHalaman.filter, jenisTransaksi: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jenis</option>
                  <option value="pembelian">Pembelian</option>
                  <option value="test-drive">Test Drive</option>
                  <option value="service">Service</option>
                  <option value="konsultasi">Konsultasi</option>
                </select>
                <select
                  value={statusHalaman.filter.status}
                  onChange={(e) => terapkanFilter({ ...statusHalaman.filter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: true }))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  🔍 Filter Lanjutan
                </button>
                <button
                  onClick={resetFilter}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransaksi.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="text-6xl">📋</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-4">Tidak ada transaksi</h3>
                <p className="text-gray-600 mt-2">Belum ada transaksi yang sesuai dengan filter Anda</p>
              </div>
            ) : (
              filteredTransaksi.map((transaksi) => (
                <div key={transaksi.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      {/* Left Section */}
                      <div className="flex items-start space-x-4 mb-4 md:mb-0">
                        <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={`/images/${transaksi.mobil.foto[0]}`}
                            alt={`${transaksi.mobil.merk} ${transaksi.mobil.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getTransactionIcon(transaksi.jenisTransaksi)}</span>
                            <h3 className="font-semibold text-gray-900">
                              {transaksi.mobil.merk} {transaksi.mobil.model} {transaksi.mobil.tahun}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaksi.status)}`}>
                              {transaksi.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>ID: {transaksi.id}</p>
                            <p>Tanggal: {formatDate(transaksi.tanggalTransaksi)}</p>
                            <p>Dealer: {transaksi.dealer.nama} - {transaksi.dealer.lokasi}</p>
                            {transaksi.totalHarga && (
                              <p className="font-semibold text-blue-600">
                                Total: {formatCurrency(transaksi.totalHarga)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col space-y-2 md:items-end">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => pilihTransaksiTertentu(transaksi.id)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                          >
                            Detail
                          </button>
                          
                          {transaksi.status === 'completed' && !transaksi.hasReview && (
                            <button
                              onClick={() => pilihMobilUntukDiulas(transaksi.mobilId)}
                              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              ⭐ Ulas
                            </button>
                          )}
                          
                          {transaksi.hasReview && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                              ✓ Sudah Diulas
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Jenis: {transaksi.jenisTransaksi}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Form */}
      {statusHalaman.view === 'review-form' && statusHalaman.selectedTransaksi && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={lihatDaftarRiwayat}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Riwayat
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Tulis Ulasan</h1>
            <p className="text-gray-600">
              Bagikan pengalaman Anda dengan {statusHalaman.selectedTransaksi.mobil.merk} {statusHalaman.selectedTransaksi.mobil.model}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Car Info */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={`/images/${statusHalaman.selectedTransaksi.mobil.foto[0]}`}
                  alt={`${statusHalaman.selectedTransaksi.mobil.merk} ${statusHalaman.selectedTransaksi.mobil.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {statusHalaman.selectedTransaksi.mobil.merk} {statusHalaman.selectedTransaksi.mobil.model} {statusHalaman.selectedTransaksi.mobil.tahun}
                </h3>
                <p className="text-sm text-gray-600">
                  Transaksi: {statusHalaman.selectedTransaksi.id} • {formatDate(statusHalaman.selectedTransaksi.tanggalTransaksi)}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const rating = Number(formData.get('rating'));
              const komentar = formData.get('komentar') as string;
              
              inputRatingDanUlasan(rating, komentar);
              
              setTimeout(() => {
                kirimUlasan();
              }, 100);
            }} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating Keseluruhan *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        required
                        className="sr-only"
                        onChange={(e) => inputRatingDanUlasan(Number(e.target.value), statusHalaman.reviewData.komentar || '')}
                      />
                      <span className={`text-3xl ${
                        (statusHalaman.reviewData.rating || 0) >= star 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}>
                        ⭐
                      </span>
                    </label>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {statusHalaman.reviewData.rating ? `${statusHalaman.reviewData.rating}/5` : 'Pilih rating'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulasan Anda *
                </label>
                <textarea
                  name="komentar"
                  required
                  rows={5}
                  placeholder="Ceritakan pengalaman Anda dengan mobil ini..."
                  value={statusHalaman.reviewData.komentar || ''}
                  onChange={(e) => inputRatingDanUlasan(statusHalaman.reviewData.rating || 0, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 10 karakter ({(statusHalaman.reviewData.komentar || '').length}/10)
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambahkan Foto (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        putuskanTambahFoto(true);
                        unggahFoto(files);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-4xl text-gray-400">📷</span>
                    <p className="mt-2 text-sm text-gray-600">
                      Klik untuk mengunggah foto
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG hingga 5MB (maksimal 5 foto)
                    </p>
                  </label>
                </div>
                
                {/* Uploaded Photos Preview */}
                {statusHalaman.uploadedPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Foto yang diunggah ({statusHalaman.uploadedPhotos.length})
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {statusHalaman.uploadedPhotos.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = statusHalaman.uploadedPhotos.filter((_, i) => i !== index);
                              setStatusHalaman(prev => ({ ...prev, uploadedPhotos: newPhotos }));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Panduan Menulis Ulasan:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Berikan ulasan yang jujur dan konstruktif</li>
                  <li>• Ceritakan pengalaman spesifik Anda</li>
                  <li>• Hindari kata-kata kasar atau menyinggung</li>
                  <li>• Foto yang diunggah akan dimoderasi terlebih dahulu</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={lihatDaftarRiwayat}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusHalaman.loading || !statusHalaman.reviewData.rating || (statusHalaman.reviewData.komentar || '').length < 10}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusHalaman.loading ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Success */}
      {statusHalaman.view === 'review-success' && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl">🎉</span>
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Ulasan Berhasil Dikirim!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Terima kasih atas ulasan Anda. Ulasan akan ditampilkan setelah dimoderasi.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Detail Ulasan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="flex">
                    {Array.from({ length: statusHalaman.reviewData.rating || 0 }, (_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Foto:</span>
                  <span>{statusHalaman.uploadedPhotos.length} foto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Menunggu Moderasi
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={lihatDaftarRiwayat}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Kembali ke Riwayat
                </button>
                <button
                  onClick={() => {/* Navigate to reviews page */}}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Lihat Ulasan Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail */}
      {statusHalaman.view === 'detail' && statusHalaman.selectedTransaksi && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={lihatDaftarRiwayat}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Riwayat
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Detail Transaksi</h1>
            <p className="text-gray-600">ID: {statusHalaman.selectedTransaksi.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Car Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Mobil</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`/images/${statusHalaman.selectedTransaksi.mobil.foto[0]}`}
                      alt={`${statusHalaman.selectedTransaksi.mobil.merk} ${statusHalaman.selectedTransaksi.mobil.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {statusHalaman.selectedTransaksi.mobil.merk} {statusHalaman.selectedTransaksi.mobil.model} {statusHalaman.selectedTransaksi.mobil.tahun}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Warna: {statusHalaman.selectedTransaksi.mobil.warna}</p>
                      {statusHalaman.selectedTransaksi.totalHarga && (
                        <p className="font-semibold text-blue-600">
                          Harga: {formatCurrency(statusHalaman.selectedTransaksi.totalHarga)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transaksi:</span>
                      <span className="font-mono">{statusHalaman.selectedTransaksi.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis:</span>
                      <span className="capitalize">{statusHalaman.selectedTransaksi.jenisTransaksi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(statusHalaman.selectedTransaksi.status)}`}>
                        {statusHalaman.selectedTransaksi.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span>{formatDate(statusHalaman.selectedTransaksi.tanggalTransaksi)}</span>
                    </div>
                    {statusHalaman.selectedTransaksi.metodePembayaran && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pembayaran:</span>
                        <span>{statusHalaman.selectedTransaksi.metodePembayaran}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ulasan:</span>
                      <span className={statusHalaman.selectedTransaksi.hasReview ? 'text-green-600' : 'text-gray-400'}>
                        {statusHalaman.selectedTransaksi.hasReview ? '✓ Sudah' : '✗ Belum'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {statusHalaman.selectedTransaksi.catatan && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Catatan:</p>
                    <p className="text-sm">{statusHalaman.selectedTransaksi.catatan}</p>
                  </div>
                )}
              </div>

              {/* Dealer Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dealer</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🏢</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{statusHalaman.selectedTransaksi.dealer.nama}</h4>
                    <p className="text-sm text-gray-600">{statusHalaman.selectedTransaksi.dealer.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aksi</h3>
                  <div className="space-y-3">
                    {statusHalaman.selectedTransaksi.status === 'completed' && !statusHalaman.selectedTransaksi.hasReview && (
                      <button
                        onClick={() => pilihAksi('review')}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
                      >
                        ⭐ Tulis Ulasan
                      </button>
                    )}
                    
                    <button
                      onClick={() => pilihAksi('repeat-order')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      🔄 Pesan Lagi
                    </button>
                    
                    <button
                      onClick={() => pilihAksi('contact-dealer')}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                    >
                      💬 Hubungi Dealer
                    </button>
                    
                    {statusHalaman.selectedTransaksi.jenisTransaksi === 'pembelian' && (
                      <button
                        onClick={() => pilihAksi('download-invoice')}
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                      >
                        📄 Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {statusHalaman.showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Filter Lanjutan</h3>
              <button
                onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: false }))}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              const filter: KriteriaFilter = {
                jenisTransaksi: formData.get('jenisTransaksi') as string,
                status: formData.get('status') as string,
                tanggalMulai: formData.get('tanggalMulai') as string,
                tanggalAkhir: formData.get('tanggalAkhir') as string,
                dealer: formData.get('dealer') as string,
                hasReview: formData.get('hasReview') === 'true' ? true : formData.get('hasReview') === 'false' ? false : null
              };
              
              terapkanFilter(filter);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggalMulai"
                  defaultValue={statusHalaman.filter.tanggalMulai}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  name="tanggalAkhir"
                  defaultValue={statusHalaman.filter.tanggalAkhir}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dealer
                </label>
                <select
                  name="dealer"
                  defaultValue={statusHalaman.filter.dealer}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Dealer</option>
                  {daftarDealer.map((dealer) => (
                    <option key={dealer} value={dealer}>{dealer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Ulasan
                </label>
                <select
                  name="hasReview"
                  defaultValue={statusHalaman.filter.hasReview === null ? '' : statusHalaman.filter.hasReview.toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua</option>
                  <option value="true">Sudah Diulas</option>
                  <option value="false">Belum Diulas</option>
                </select>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: false }))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Terapkan Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {statusHalaman.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{statusHalaman.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanRiwayat;