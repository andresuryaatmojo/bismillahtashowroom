import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Calendar, 
  CreditCard, 
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface DataIklan {
  id: string;
  judul: string;
  deskripsi: string;
  gambar: string[];
  kategori: 'mobil' | 'motor' | 'truk' | 'bus';
  harga: number;
  lokasi: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  status: 'aktif' | 'tidak-aktif' | 'pending' | 'expired';
  views: number;
  clicks: number;
  leads: number;
  biayaIklan: number;
  durasi: number; // dalam hari
  pemilik: {
    nama: string;
    email: string;
    telepon: string;
  };
}

interface StatistikIklan {
  totalViews: number;
  totalClicks: number;
  totalLeads: number;
  ctr: number; // Click Through Rate
  cpl: number; // Cost Per Lead
  roi: number; // Return on Investment
  performanceHarian: {
    tanggal: string;
    views: number;
    clicks: number;
    leads: number;
  }[];
}

interface StatusHalaman {
  view: 'list' | 'edit' | 'statistics' | 'extend' | 'payment';
  loading: boolean;
  error: string | null;
  selectedIklan: DataIklan | null;
  showDeleteModal: boolean;
  showExtendModal: boolean;
  searchQuery: string;
  filter: {
    status: string;
    kategori: string;
    tanggalMulai: string;
    tanggalAkhir: string;
  };
  editForm: Partial<DataIklan>;
  statistik: StatistikIklan | null;
  durasiPerpanjangan: number;
  biayaPerpanjangan: number;
}

const HalamanKelolaIklan: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    view: 'list',
    loading: true,
    error: null,
    selectedIklan: null,
    showDeleteModal: false,
    showExtendModal: false,
    searchQuery: '',
    filter: {
      status: '',
      kategori: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    },
    editForm: {},
    statistik: null,
    durasiPerpanjangan: 30,
    biayaPerpanjangan: 0
  });

  const [daftarIklan, setDaftarIklan] = useState<DataIklan[]>([]);
  const [filteredIklan, setFilteredIklan] = useState<DataIklan[]>([]);

  // Methods implementation
  const aksesMenuKelolaIklan = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'list' }));
    
    // Simulate API call to load advertisements
    setTimeout(() => {
      const mockIklan: DataIklan[] = [
        {
          id: 'IKL001',
          judul: 'Toyota Camry 2023 - Kondisi Prima',
          deskripsi: 'Mobil sedan mewah dengan kondisi sangat baik, kilometer rendah',
          gambar: ['/images/camry1.jpg', '/images/camry2.jpg'],
          kategori: 'mobil',
          harga: 450000000,
          lokasi: 'Jakarta Selatan',
          tanggalMulai: '2024-01-01',
          tanggalBerakhir: '2024-02-01',
          status: 'aktif',
          views: 1250,
          clicks: 89,
          leads: 12,
          biayaIklan: 500000,
          durasi: 31,
          pemilik: {
            nama: 'Ahmad Wijaya',
            email: 'ahmad@email.com',
            telepon: '081234567890'
          }
        },
        {
          id: 'IKL002',
          judul: 'Honda Civic Type R - Limited Edition',
          deskripsi: 'Mobil sport dengan performa tinggi, edisi terbatas',
          gambar: ['/images/civic1.jpg'],
          kategori: 'mobil',
          harga: 850000000,
          lokasi: 'Bandung',
          tanggalMulai: '2024-01-15',
          tanggalBerakhir: '2024-01-20',
          status: 'expired',
          views: 890,
          clicks: 45,
          leads: 8,
          biayaIklan: 750000,
          durasi: 5,
          pemilik: {
            nama: 'Sari Indah',
            email: 'sari@email.com',
            telepon: '081987654321'
          }
        },
        {
          id: 'IKL003',
          judul: 'Yamaha NMAX 2023 - Matic Terbaru',
          deskripsi: 'Motor matic dengan teknologi terdepan dan desain modern',
          gambar: ['/images/nmax1.jpg', '/images/nmax2.jpg', '/images/nmax3.jpg'],
          kategori: 'motor',
          harga: 35000000,
          lokasi: 'Surabaya',
          tanggalMulai: '2024-01-10',
          tanggalBerakhir: '2024-02-10',
          status: 'aktif',
          views: 2100,
          clicks: 156,
          leads: 23,
          biayaIklan: 300000,
          durasi: 31,
          pemilik: {
            nama: 'Budi Santoso',
            email: 'budi@email.com',
            telepon: '081555666777'
          }
        }
      ];

      setDaftarIklan(mockIklan);
      setFilteredIklan(mockIklan);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const pilihIklanYangAkanDikelola = (idIklan: string) => {
    const iklan = daftarIklan.find(i => i.id === idIklan);
    if (iklan) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedIklan: iklan,
        editForm: { ...iklan }
      }));
    }
  };

  const editDataIklan = (dataBaruIklan: Partial<DataIklan>) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call to update advertisement
    setTimeout(() => {
      setDaftarIklan(prev => 
        prev.map(iklan => 
          iklan.id === statusHalaman.selectedIklan?.id 
            ? { ...iklan, ...dataBaruIklan }
            : iklan
        )
      );
      
      setStatusHalaman(prev => ({ 
        ...prev, 
        loading: false, 
        view: 'list',
        selectedIklan: null,
        editForm: {}
      }));
    }, 1500);
  };

  const lihatStatistikIklan = (idIklan: string) => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'statistics' }));
    
    // Simulate API call to get advertisement statistics
    setTimeout(() => {
      const mockStatistik: StatistikIklan = {
        totalViews: 1250,
        totalClicks: 89,
        totalLeads: 12,
        ctr: 7.12,
        cpl: 41667,
        roi: 15.5,
        performanceHarian: [
          { tanggal: '2024-01-01', views: 45, clicks: 3, leads: 1 },
          { tanggal: '2024-01-02', views: 67, clicks: 5, leads: 0 },
          { tanggal: '2024-01-03', views: 89, clicks: 8, leads: 2 },
          { tanggal: '2024-01-04', views: 123, clicks: 12, leads: 3 },
          { tanggal: '2024-01-05', views: 98, clicks: 7, leads: 1 }
        ]
      };

      setStatusHalaman(prev => ({
        ...prev,
        loading: false,
        statistik: mockStatistik
      }));
    }, 1000);
  };

  const hapusIklan = (idIklan: string) => {
    const iklan = daftarIklan.find(i => i.id === idIklan);
    if (iklan) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedIklan: iklan,
        showDeleteModal: true
      }));
    }
  };

  const konfirmasiHapusIklan = (konfirmasi: boolean) => {
    if (konfirmasi && statusHalaman.selectedIklan) {
      setStatusHalaman(prev => ({ ...prev, loading: true }));
      
      // Simulate API call to delete advertisement
      setTimeout(() => {
        setDaftarIklan(prev => 
          prev.filter(iklan => iklan.id !== statusHalaman.selectedIklan?.id)
        );
        
        setStatusHalaman(prev => ({
          ...prev,
          loading: false,
          showDeleteModal: false,
          selectedIklan: null
        }));
      }, 1000);
    } else {
      setStatusHalaman(prev => ({
        ...prev,
        showDeleteModal: false,
        selectedIklan: null
      }));
    }
  };

  const perpanjangMasaAktif = (idIklan: string) => {
    const iklan = daftarIklan.find(i => i.id === idIklan);
    if (iklan) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedIklan: iklan,
        showExtendModal: true,
        durasiPerpanjangan: 30,
        biayaPerpanjangan: 500000
      }));
    }
  };

  const pilihDurasiPerpanjangan = (durasi: number) => {
    const biayaPerHari = 16667; // Rp 16,667 per hari
    const biaya = durasi * biayaPerHari;
    
    setStatusHalaman(prev => ({
      ...prev,
      durasiPerpanjangan: durasi,
      biayaPerpanjangan: biaya
    }));
  };

  const lakukanPembayaran = (biayaPerpanjangan: number) => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'payment' }));
    
    // Simulate payment process
    setTimeout(() => {
      if (statusHalaman.selectedIklan) {
        const tanggalBerakhirBaru = new Date(statusHalaman.selectedIklan.tanggalBerakhir);
        tanggalBerakhirBaru.setDate(tanggalBerakhirBaru.getDate() + statusHalaman.durasiPerpanjangan);
        
        setDaftarIklan(prev =>
          prev.map(iklan =>
            iklan.id === statusHalaman.selectedIklan?.id
              ? {
                  ...iklan,
                  tanggalBerakhir: tanggalBerakhirBaru.toISOString().split('T')[0],
                  status: 'aktif' as const,
                  durasi: iklan.durasi + statusHalaman.durasiPerpanjangan,
                  biayaIklan: iklan.biayaIklan + biayaPerpanjangan
                }
              : iklan
          )
        );
      }
      
      setStatusHalaman(prev => ({
        ...prev,
        loading: false,
        view: 'list',
        showExtendModal: false,
        selectedIklan: null
      }));
    }, 2000);
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
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'tidak-aktif': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const applyFilters = () => {
    let filtered = daftarIklan;

    if (statusHalaman.searchQuery) {
      filtered = filtered.filter(iklan =>
        iklan.judul.toLowerCase().includes(statusHalaman.searchQuery.toLowerCase()) ||
        iklan.deskripsi.toLowerCase().includes(statusHalaman.searchQuery.toLowerCase()) ||
        iklan.lokasi.toLowerCase().includes(statusHalaman.searchQuery.toLowerCase())
      );
    }

    if (statusHalaman.filter.status) {
      filtered = filtered.filter(iklan => iklan.status === statusHalaman.filter.status);
    }

    if (statusHalaman.filter.kategori) {
      filtered = filtered.filter(iklan => iklan.kategori === statusHalaman.filter.kategori);
    }

    setFilteredIklan(filtered);
  };

  // Effects
  useEffect(() => {
    aksesMenuKelolaIklan();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusHalaman.searchQuery, statusHalaman.filter, daftarIklan]);

  // Render methods
  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Iklan</h1>
        <button
          onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'edit', editForm: {} }))}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Iklan
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari iklan..."
                value={statusHalaman.searchQuery}
                onChange={(e) => setStatusHalaman(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusHalaman.filter.status}
              onChange={(e) => setStatusHalaman(prev => ({
                ...prev,
                filter: { ...prev.filter, status: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="tidak-aktif">Tidak Aktif</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={statusHalaman.filter.kategori}
              onChange={(e) => setStatusHalaman(prev => ({
                ...prev,
                filter: { ...prev.filter, kategori: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="mobil">Mobil</option>
              <option value="motor">Motor</option>
              <option value="truk">Truk</option>
              <option value="bus">Bus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Iklan</p>
              <p className="text-2xl font-bold text-gray-900">{daftarIklan.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Iklan Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {daftarIklan.filter(i => i.status === 'aktif').length}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-600">
                {daftarIklan.reduce((sum, iklan) => sum + iklan.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-orange-600">
                {daftarIklan.reduce((sum, iklan) => sum + iklan.leads, 0)}
              </p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advertisements List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iklan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Berakhir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIklan.map((iklan) => (
                <tr key={iklan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs">IMG</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {iklan.judul}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(iklan.harga)} • {iklan.lokasi}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {iklan.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(iklan.status)} capitalize`}>
                      {iklan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>{iklan.views.toLocaleString()} views</div>
                      <div>{iklan.clicks} clicks</div>
                      <div>{iklan.leads} leads</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(iklan.tanggalBerakhir)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => lihatStatistikIklan(iklan.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Statistik"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          pilihIklanYangAkanDikelola(iklan.id);
                          setStatusHalaman(prev => ({ ...prev, view: 'edit' }));
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => perpanjangMasaAktif(iklan.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Perpanjang"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => hapusIklan(iklan.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEditView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {statusHalaman.selectedIklan ? 'Edit Iklan' : 'Tambah Iklan Baru'}
        </h1>
        <button
          onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list' }))}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          editDataIklan(statusHalaman.editForm);
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Iklan
              </label>
              <input
                type="text"
                value={statusHalaman.editForm.judul || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, judul: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={statusHalaman.editForm.kategori || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, kategori: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="mobil">Mobil</option>
                <option value="motor">Motor</option>
                <option value="truk">Truk</option>
                <option value="bus">Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga
              </label>
              <input
                type="number"
                value={statusHalaman.editForm.harga || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, harga: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi
              </label>
              <input
                type="text"
                value={statusHalaman.editForm.lokasi || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, lokasi: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={statusHalaman.editForm.tanggalMulai || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, tanggalMulai: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                value={statusHalaman.editForm.tanggalBerakhir || ''}
                onChange={(e) => setStatusHalaman(prev => ({
                  ...prev,
                  editForm: { ...prev.editForm, tanggalBerakhir: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={statusHalaman.editForm.deskripsi || ''}
              onChange={(e) => setStatusHalaman(prev => ({
                ...prev,
                editForm: { ...prev.editForm, deskripsi: e.target.value }
              }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list' }))}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={statusHalaman.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {statusHalaman.loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderStatisticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statistik Iklan</h1>
        <button
          onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list' }))}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Kembali
        </button>
      </div>

      {statusHalaman.statistik && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Click Through Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statusHalaman.statistik.ctr.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Per Lead</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(statusHalaman.statistik.cpl)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Return on Investment</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statusHalaman.statistik.roi.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">
                {statusHalaman.statistik.totalViews.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">
                {statusHalaman.statistik.totalClicks}
              </p>
              <p className="text-sm text-gray-600">Total Clicks</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900">
                {statusHalaman.statistik.totalLeads}
              </p>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
          </div>

          {/* Daily Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Harian</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tanggal</th>
                    <th className="text-left py-2">Views</th>
                    <th className="text-left py-2">Clicks</th>
                    <th className="text-left py-2">Leads</th>
                    <th className="text-left py-2">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {statusHalaman.statistik.performanceHarian.map((data, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{formatDate(data.tanggal)}</td>
                      <td className="py-2">{data.views}</td>
                      <td className="py-2">{data.clicks}</td>
                      <td className="py-2">{data.leads}</td>
                      <td className="py-2">
                        {data.views > 0 ? ((data.clicks / data.views) * 100).toFixed(2) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {statusHalaman.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading...</span>
              </div>
            </div>
          </div>
        )}

        {statusHalaman.view === 'list' && renderListView()}
        {statusHalaman.view === 'edit' && renderEditView()}
        {statusHalaman.view === 'statistics' && renderStatisticsView()}

        {/* Delete Confirmation Modal */}
        {statusHalaman.showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold">Konfirmasi Hapus</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus iklan "{statusHalaman.selectedIklan?.judul}"? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => konfirmasiHapusIklan(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => konfirmasiHapusIklan(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extend Modal */}
        {statusHalaman.showExtendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Perpanjang Masa Aktif</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Perpanjangan (hari)
                  </label>
                  <select
                    value={statusHalaman.durasiPerpanjangan}
                    onChange={(e) => pilihDurasiPerpanjangan(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7 hari</option>
                    <option value={14}>14 hari</option>
                    <option value={30}>30 hari</option>
                    <option value={60}>60 hari</option>
                    <option value={90}>90 hari</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Biaya Perpanjangan:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(statusHalaman.biayaPerpanjangan)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, showExtendModal: false }))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => lakukanPembayaran(statusHalaman.biayaPerpanjangan)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {statusHalaman.error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
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
    </div>
  );
};

export default HalamanKelolaIklan;