import React, { useState, useEffect } from 'react';

// Interfaces
interface DataKemitraan {
  id: string;
  namaPerusahaan: string;
  jenisKemitraan: 'dealer' | 'supplier' | 'finansial' | 'teknologi' | 'logistik';
  kontakPerson: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  status: 'aktif' | 'nonaktif' | 'pending' | 'expired';
  nilaiKontrak: number;
  deskripsi: string;
  dokumenKontrak: string[];
}

interface PerformaKemitraan {
  id: string;
  periode: string;
  targetPenjualan: number;
  realisasiPenjualan: number;
  tingkatKepuasan: number;
  jumlahTransaksi: number;
  nilaiTransaksi: number;
  rating: number;
  catatan: string;
}

interface KontrakKemitraan {
  id: string;
  nomorKontrak: string;
  jenisKontrak: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  nilaiKontrak: number;
  statusKontrak: 'draft' | 'aktif' | 'expired' | 'terminated';
  klausul: string[];
  dokumen: string[];
}

interface StatusHalaman {
  view: 'kelola' | 'tambah' | 'edit' | 'evaluasi' | 'kontrak';
  loading: boolean;
  error: string | null;
  selectedKemitraan: string | null;
  selectedKontrak: string | null;
}

const HalamanKemitraan: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    view: 'kelola',
    loading: false,
    error: null,
    selectedKemitraan: null,
    selectedKontrak: null
  });

  const [daftarKemitraan, setDaftarKemitraan] = useState<DataKemitraan[]>([]);
  const [performaKemitraan, setPerformaKemitraan] = useState<PerformaKemitraan[]>([]);
  const [kontrakKemitraan, setKontrakKemitraan] = useState<KontrakKemitraan[]>([]);
  const [formData, setFormData] = useState<Partial<DataKemitraan>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  // Methods implementation
  const aksesHalamanKelolaKemitraan = () => {
    setStatusHalaman(prev => ({ ...prev, view: 'kelola', loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const mockData: DataKemitraan[] = [
        {
          id: '1',
          namaPerusahaan: 'PT Astra International',
          jenisKemitraan: 'dealer',
          kontakPerson: 'John Doe',
          email: 'john@astra.com',
          telepon: '021-12345678',
          alamat: 'Jakarta Pusat',
          tanggalMulai: '2024-01-01',
          tanggalBerakhir: '2024-12-31',
          status: 'aktif',
          nilaiKontrak: 5000000000,
          deskripsi: 'Kemitraan dealer resmi',
          dokumenKontrak: ['kontrak.pdf', 'mou.pdf']
        },
        {
          id: '2',
          namaPerusahaan: 'Bank Mandiri',
          jenisKemitraan: 'finansial',
          kontakPerson: 'Jane Smith',
          email: 'jane@mandiri.com',
          telepon: '021-87654321',
          alamat: 'Jakarta Selatan',
          tanggalMulai: '2024-02-01',
          tanggalBerakhir: '2025-01-31',
          status: 'aktif',
          nilaiKontrak: 2000000000,
          deskripsi: 'Kemitraan pembiayaan kendaraan',
          dokumenKontrak: ['agreement.pdf']
        }
      ];
      
      setDaftarKemitraan(mockData);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const tambahKemitraan = (dataKemitraanBaru: Partial<DataKemitraan>) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const newKemitraan: DataKemitraan = {
        id: Date.now().toString(),
        namaPerusahaan: dataKemitraanBaru.namaPerusahaan || '',
        jenisKemitraan: dataKemitraanBaru.jenisKemitraan || 'dealer',
        kontakPerson: dataKemitraanBaru.kontakPerson || '',
        email: dataKemitraanBaru.email || '',
        telepon: dataKemitraanBaru.telepon || '',
        alamat: dataKemitraanBaru.alamat || '',
        tanggalMulai: dataKemitraanBaru.tanggalMulai || '',
        tanggalBerakhir: dataKemitraanBaru.tanggalBerakhir || '',
        status: 'pending',
        nilaiKontrak: dataKemitraanBaru.nilaiKontrak || 0,
        deskripsi: dataKemitraanBaru.deskripsi || '',
        dokumenKontrak: dataKemitraanBaru.dokumenKontrak || []
      };
      
      setDaftarKemitraan(prev => [...prev, newKemitraan]);
      setStatusHalaman(prev => ({ ...prev, loading: false, view: 'kelola' }));
      setFormData({});
    }, 1500);
  };

  const kelolaKemitraanEksisting = (idKemitraan: string) => {
    const kemitraan = daftarKemitraan.find(k => k.id === idKemitraan);
    if (kemitraan) {
      setFormData(kemitraan);
      setStatusHalaman(prev => ({ 
        ...prev, 
        view: 'edit', 
        selectedKemitraan: idKemitraan 
      }));
    }
  };

  const evaluasiPerformaKemitraan = (idKemitraan: string) => {
    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'evaluasi', 
      selectedKemitraan: idKemitraan,
      loading: true 
    }));
    
    // Simulate API call for performance data
    setTimeout(() => {
      const mockPerforma: PerformaKemitraan[] = [
        {
          id: '1',
          periode: '2024-Q1',
          targetPenjualan: 100,
          realisasiPenjualan: 85,
          tingkatKepuasan: 4.2,
          jumlahTransaksi: 45,
          nilaiTransaksi: 2500000000,
          rating: 4.0,
          catatan: 'Performa baik, sedikit di bawah target'
        },
        {
          id: '2',
          periode: '2024-Q2',
          targetPenjualan: 120,
          realisasiPenjualan: 135,
          tingkatKepuasan: 4.5,
          jumlahTransaksi: 67,
          nilaiTransaksi: 3200000000,
          rating: 4.5,
          catatan: 'Performa sangat baik, melebihi target'
        }
      ];
      
      setPerformaKemitraan(mockPerforma);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const kelolaKontrakKemitraan = (idKontrak: string) => {
    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'kontrak', 
      selectedKontrak: idKontrak,
      loading: true 
    }));
    
    // Simulate API call for contract data
    setTimeout(() => {
      const mockKontrak: KontrakKemitraan[] = [
        {
          id: '1',
          nomorKontrak: 'KTR-2024-001',
          jenisKontrak: 'Dealer Partnership',
          tanggalMulai: '2024-01-01',
          tanggalBerakhir: '2024-12-31',
          nilaiKontrak: 5000000000,
          statusKontrak: 'aktif',
          klausul: [
            'Target penjualan minimum 100 unit per bulan',
            'Komisi 5% dari setiap penjualan',
            'Dukungan marketing dan promosi'
          ],
          dokumen: ['kontrak-signed.pdf', 'addendum-1.pdf']
        }
      ];
      
      setKontrakKemitraan(mockKontrak);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const pilihAksiLain = () => {
    // Reset to main view
    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'kelola',
      selectedKemitraan: null,
      selectedKontrak: null 
    }));
    setFormData({});
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
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'nonaktif': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJenisIcon = (jenis: string): string => {
    switch (jenis) {
      case 'dealer': return '🏢';
      case 'supplier': return '📦';
      case 'finansial': return '💰';
      case 'teknologi': return '💻';
      case 'logistik': return '🚚';
      default: return '🤝';
    }
  };

  // Filter data
  const filteredKemitraan = daftarKemitraan.filter(kemitraan => {
    const matchesSearch = kemitraan.namaPerusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kemitraan.kontakPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || kemitraan.status === filterStatus;
    const matchesJenis = filterJenis === 'all' || kemitraan.jenisKemitraan === filterJenis;
    
    return matchesSearch && matchesStatus && matchesJenis;
  });

  // Load initial data
  useEffect(() => {
    aksesHalamanKelolaKemitraan();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Kemitraan</h1>
          <p className="text-gray-600">Manajemen partner dan kemitraan bisnis</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'kelola' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  statusHalaman.view === 'kelola'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daftar Kemitraan
              </button>
              <button
                onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'tambah' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  statusHalaman.view === 'tambah'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tambah Kemitraan
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        {statusHalaman.view === 'kelola' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Kemitraan
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nama perusahaan atau kontak..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-aktif</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kemitraan
                  </label>
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="dealer">Dealer</option>
                    <option value="supplier">Supplier</option>
                    <option value="finansial">Finansial</option>
                    <option value="teknologi">Teknologi</option>
                    <option value="logistik">Logistik</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterJenis('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Partnership List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Daftar Kemitraan ({filteredKemitraan.length})
                </h3>
              </div>
              
              {statusHalaman.loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Memuat data kemitraan...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perusahaan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nilai Kontrak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKemitraan.map((kemitraan) => (
                        <tr key={kemitraan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {kemitraan.namaPerusahaan}
                              </div>
                              <div className="text-sm text-gray-500">
                                {kemitraan.alamat}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{getJenisIcon(kemitraan.jenisKemitraan)}</span>
                              <span className="text-sm text-gray-900 capitalize">
                                {kemitraan.jenisKemitraan}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{kemitraan.kontakPerson}</div>
                              <div className="text-sm text-gray-500">{kemitraan.email}</div>
                              <div className="text-sm text-gray-500">{kemitraan.telepon}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(kemitraan.tanggalMulai)} - {formatDate(kemitraan.tanggalBerakhir)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(kemitraan.nilaiKontrak)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kemitraan.status)}`}>
                              {kemitraan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => kelolaKemitraanEksisting(kemitraan.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => evaluasiPerformaKemitraan(kemitraan.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Evaluasi
                              </button>
                              <button
                                onClick={() => kelolaKontrakKemitraan(kemitraan.id)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Kontrak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredKemitraan.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">Tidak ada data kemitraan yang ditemukan</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Partnership Form */}
        {statusHalaman.view === 'tambah' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Tambah Kemitraan Baru</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              tambahKemitraan(formData);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaPerusahaan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, namaPerusahaan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kemitraan *
                  </label>
                  <select
                    required
                    value={formData.jenisKemitraan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, jenisKemitraan: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="dealer">Dealer</option>
                    <option value="supplier">Supplier</option>
                    <option value="finansial">Finansial</option>
                    <option value="teknologi">Teknologi</option>
                    <option value="logistik">Logistik</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kontak Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kontakPerson || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, kontakPerson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai Kontrak (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.nilaiKontrak || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nilaiKontrak: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalMulai || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalMulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalBerakhir || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalBerakhir: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  value={formData.deskripsi || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi kemitraan..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={pilihAksiLain}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusHalaman.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {statusHalaman.loading ? 'Menyimpan...' : 'Simpan Kemitraan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Partnership Form */}
        {statusHalaman.view === 'edit' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit Kemitraan</h3>
              <button
                onClick={pilihAksiLain}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Update existing partnership
              setDaftarKemitraan(prev => 
                prev.map(k => k.id === statusHalaman.selectedKemitraan ? { ...k, ...formData } : k)
              );
              pilihAksiLain();
            }} className="space-y-6">
              {/* Same form fields as add form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaPerusahaan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, namaPerusahaan: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-aktif</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={pilihAksiLain}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Kemitraan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Performance Evaluation */}
        {statusHalaman.view === 'evaluasi' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Evaluasi Performa Kemitraan</h3>
              <button
                onClick={pilihAksiLain}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Kembali
              </button>
            </div>
            
            {statusHalaman.loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data performa...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {performaKemitraan.map((performa) => (
                  <div key={performa.id} className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Periode {performa.periode}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Penjualan:</span>
                        <span className="font-medium">{performa.targetPenjualan} unit</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Realisasi:</span>
                        <span className={`font-medium ${
                          performa.realisasiPenjualan >= performa.targetPenjualan 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {performa.realisasiPenjualan} unit
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pencapaian:</span>
                        <span className={`font-medium ${
                          (performa.realisasiPenjualan / performa.targetPenjualan * 100) >= 100 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {((performa.realisasiPenjualan / performa.targetPenjualan) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tingkat Kepuasan:</span>
                        <span className="font-medium">{performa.tingkatKepuasan}/5.0</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah Transaksi:</span>
                        <span className="font-medium">{performa.jumlahTransaksi}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nilai Transaksi:</span>
                        <span className="font-medium">{formatCurrency(performa.nilaiTransaksi)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{performa.rating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= performa.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {performa.catatan && (
                        <div className="pt-4 border-t">
                          <span className="text-gray-600 text-sm">Catatan:</span>
                          <p className="text-gray-800 text-sm mt-1">{performa.catatan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contract Management */}
        {statusHalaman.view === 'kontrak' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Kelola Kontrak Kemitraan</h3>
              <button
                onClick={pilihAksiLain}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Kembali
              </button>
            </div>
            
            {statusHalaman.loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data kontrak...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {kontrakKemitraan.map((kontrak) => (
                  <div key={kontrak.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {kontrak.nomorKontrak}
                        </h4>
                        <p className="text-gray-600">{kontrak.jenisKontrak}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        kontrak.statusKontrak === 'aktif' ? 'bg-green-100 text-green-800' :
                        kontrak.statusKontrak === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        kontrak.statusKontrak === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {kontrak.statusKontrak}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Informasi Kontrak</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Periode:</span>
                            <span>{formatDate(kontrak.tanggalMulai)} - {formatDate(kontrak.tanggalBerakhir)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nilai Kontrak:</span>
                            <span className="font-medium">{formatCurrency(kontrak.nilaiKontrak)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Dokumen</h5>
                        <div className="space-y-1">
                          {kontrak.dokumen.map((doc, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <span className="text-blue-600 mr-2">📄</span>
                              <span className="text-blue-600 hover:underline cursor-pointer">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Klausul Kontrak</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {kontrak.klausul.map((klausul, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>{klausul}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Edit Kontrak
                      </button>
                      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Perpanjang
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                        Terminasi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {statusHalaman.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{statusHalaman.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {statusHalaman.loading && statusHalaman.view === 'tambah' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Menyimpan kemitraan baru...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanKemitraan;