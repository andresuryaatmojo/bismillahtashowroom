import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { carService } from '../services/carService';

// Interfaces
interface DataMobil {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  transmisi: 'manual' | 'automatic';
  bahanBakar: 'bensin' | 'diesel' | 'hybrid' | 'listrik';
  harga: number;
  kilometer: number;
  lokasi: string;
  foto: string[];
  deskripsi: string;
  kondisi: 'baru' | 'bekas';
  nomorPolisi?: string;
  pajak?: string;
  stnk?: string;
  status: 'tersedia' | 'terjual' | 'reserved';
}

interface DataPembelian {
  namaLengkap: string;
  email: string;
  telepon: string;
  alamat: string;
  ktp: string;
  pekerjaan: string;
  penghasilan: number;
  jenisKredit?: 'cash' | 'kredit';
  lamaTenor?: number;
  uangMuka?: number;
  catatanTambahan?: string;
}

interface MetodePembayaran {
  id: string;
  nama: string;
  jenis: 'cash' | 'kredit' | 'leasing';
  deskripsi: string;
  bunga?: number;
  tenor?: number[];
  syarat: string[];
  icon: string;
}

interface DataPesanan {
  id: string;
  mobilId: string;
  dataPembelian: DataPembelian;
  metodePembayaran: MetodePembayaran;
  totalHarga: number;
  uangMuka: number;
  sisaPembayaran: number;
  cicilanPerBulan?: number;
  tanggalPesan: string;
  statusPesanan: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
}

interface DataInvoice {
  id: string;
  nomorInvoice: string;
  pesananId: string;
  totalPembayaran: number;
  metodePembayaran: string;
  statusPembayaran: 'pending' | 'paid' | 'failed' | 'expired';
  tanggalJatuhTempo: string;
  linkPembayaran?: string;
  qrCode?: string;
}

interface StatusHalaman {
  step: 'pilih-mobil' | 'data-pembelian' | 'metode-pembayaran' | 'konfirmasi' | 'pembayaran' | 'selesai';
  loading: boolean;
  error: string | null;
  selectedMobil: DataMobil | null;
  dataPembelian: Partial<DataPembelian>;
  selectedMetode: MetodePembayaran | null;
  pesanan: DataPesanan | null;
  invoice: DataInvoice | null;
}

const HalamanPembelian: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    step: 'pilih-mobil',
    loading: false,
    error: null,
    selectedMobil: null,
    dataPembelian: {},
    selectedMetode: null,
    pesanan: null,
    invoice: null
  });

  const [daftarMobil, setDaftarMobil] = useState<DataMobil[]>([]);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHarga, setFilterHarga] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [filterMerk, setFilterMerk] = useState<string>('all');
  const location = useLocation();

  // Fungsi pemetaan hasil service ke DataMobil lokal halaman ini
  const mapCarToDataMobil = (c: any): DataMobil => ({
    id: c.id,
    merk: c?.car_brands?.name || 'Tidak diketahui',
    model: c?.car_models?.name || c?.title || 'Tidak diketahui',
    tahun: c?.year || new Date().getFullYear(),
    warna: c?.color || 'Tidak diketahui',
    transmisi: c?.transmission === 'manual' ? 'manual' : 'automatic',
    bahanBakar: c?.fuel_type === 'diesel' ? 'diesel'
               : c?.fuel_type === 'electric' ? 'listrik'
               : (c?.fuel_type === 'hybrid' || c?.fuel_type === 'phev') ? 'hybrid'
               : 'bensin',
    harga: c?.price || 0,
    kilometer: c?.mileage || 0,
    lokasi: c?.location_city || 'Tidak diketahui',
    // Jika URL gambar penuh, placeholder akan tampil via onError handler yang sudah ada
    foto: (c?.car_images && c.car_images.length > 0) ? [c.car_images[0].image_url] : [''],
    deskripsi: c?.description || '',
    kondisi: c?.condition === 'new' ? 'baru' : 'bekas',
    status: c?.status === 'available' ? 'tersedia' : c?.status === 'sold' ? 'terjual' : 'reserved',
    nomorPolisi: undefined,
    pajak: undefined,
    stnk: undefined,
  });

  // Methods implementation
  const pilihMobilDanKlikBeli = (idMobil: string) => {
    const mobil = daftarMobil.find(m => m.id === idMobil);
    if (mobil && mobil.status === 'tersedia') {
      setStatusHalaman(prev => ({
        ...prev,
        selectedMobil: mobil,
        step: 'data-pembelian'
      }));
    }
  };

  const isiDataPembelian = (dataPembelian: DataPembelian) => {
    setStatusHalaman(prev => ({
      ...prev,
      dataPembelian,
      step: 'metode-pembayaran'
    }));
  };

  const pilihMetodePembayaran = (metodePembayaran: MetodePembayaran) => {
    setStatusHalaman(prev => ({
      ...prev,
      selectedMetode: metodePembayaran,
      step: 'konfirmasi'
    }));
  };

  const konfirmasiPesanan = (dataPesanan: Partial<DataPesanan>) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const pesananBaru: DataPesanan = {
        id: Date.now().toString(),
        mobilId: statusHalaman.selectedMobil?.id || '',
        dataPembelian: statusHalaman.dataPembelian as DataPembelian,
        metodePembayaran: statusHalaman.selectedMetode!,
        totalHarga: statusHalaman.selectedMobil?.harga || 0,
        uangMuka: dataPesanan.uangMuka || 0,
        sisaPembayaran: (statusHalaman.selectedMobil?.harga || 0) - (dataPesanan.uangMuka || 0),
        cicilanPerBulan: dataPesanan.cicilanPerBulan,
        tanggalPesan: new Date().toISOString(),
        statusPesanan: 'confirmed'
      };
      
      setStatusHalaman(prev => ({
        ...prev,
        pesanan: pesananBaru,
        step: 'pembayaran',
        loading: false
      }));
    }, 2000);
  };

  const lakukanPembayaran = (dataInvoice: DataInvoice) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate payment processing
    setTimeout(() => {
      const invoiceBaru: DataInvoice = {
        ...dataInvoice,
        statusPembayaran: Math.random() > 0.2 ? 'paid' : 'failed' // 80% success rate
      };
      
      setStatusHalaman(prev => ({
        ...prev,
        invoice: invoiceBaru,
        step: invoiceBaru.statusPembayaran === 'paid' ? 'selesai' : 'pembayaran',
        loading: false,
        error: invoiceBaru.statusPembayaran === 'failed' ? 'Pembayaran gagal. Silakan coba lagi.' : null
      }));
      
      // Update car status if payment successful
      if (invoiceBaru.statusPembayaran === 'paid') {
        setDaftarMobil(prev => 
          prev.map(mobil => 
            mobil.id === statusHalaman.selectedMobil?.id 
              ? { ...mobil, status: 'terjual' as const }
              : mobil
          )
        );
      }
    }, 3000);
  };

  const ulangiPembayaran = () => {
    if (statusHalaman.pesanan) {
      const invoiceBaru: DataInvoice = {
        id: Date.now().toString(),
        nomorInvoice: `INV-${Date.now()}`,
        pesananId: statusHalaman.pesanan.id,
        totalPembayaran: statusHalaman.pesanan.uangMuka > 0 ? statusHalaman.pesanan.uangMuka : statusHalaman.pesanan.totalHarga,
        metodePembayaran: statusHalaman.selectedMetode?.nama || '',
        statusPembayaran: 'pending',
        tanggalJatuhTempo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        linkPembayaran: `https://payment.example.com/pay/${Date.now()}`,
        qrCode: `data:image/svg+xml;base64,${btoa('<svg>QR Code</svg>')}`
      };
      
      lakukanPembayaran(invoiceBaru);
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
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const calculateMonthlyPayment = (harga: number, uangMuka: number, tenor: number, bunga: number): number => {
    const pokok = harga - uangMuka;
    const bungaBulanan = bunga / 100 / 12;
    const cicilan = (pokok * bungaBulanan * Math.pow(1 + bungaBulanan, tenor)) / 
                   (Math.pow(1 + bungaBulanan, tenor) - 1);
    return cicilan;
  };

  // Pre-seleksi mobil jika datang dari halaman detail
  useEffect(() => {
    const mobilId = (location.state as any)?.mobilId;
    if (!mobilId) return;

    let cancelled = false;
    (async () => {
      setStatusHalaman(prev => ({ ...prev, loading: true }));
      const c = await carService.getCarById(mobilId);
      if (cancelled) return;

      if (c) {
        const mapped = mapCarToDataMobil(c);
        setDaftarMobil(prev => {
          const exists = prev.some(m => m.id === mapped.id);
          return exists ? prev : [...prev, mapped];
        });
        setStatusHalaman(prev => ({
          ...prev,
          selectedMobil: mapped,
          step: 'data-pembelian',
          loading: false
        }));
      } else {
        setStatusHalaman(prev => ({ ...prev, loading: false, error: 'Mobil tidak ditemukan' }));
      }
    })();

    return () => { cancelled = true; };
  }, [location.state]);

  // Load initial data
  useEffect(() => {
    // Load available cars
    const mockMobil: DataMobil[] = [
      {
        id: '1',
        merk: 'Toyota',
        model: 'Avanza',
        tahun: 2023,
        warna: 'Putih',
        transmisi: 'manual',
        bahanBakar: 'bensin',
        harga: 250000000,
        kilometer: 0,
        lokasi: 'Jakarta',
        foto: ['avanza1.jpg', 'avanza2.jpg'],
        deskripsi: 'Mobil keluarga yang nyaman dan irit',
        kondisi: 'baru',
        status: 'tersedia'
      },
      {
        id: '2',
        merk: 'Honda',
        model: 'Civic',
        tahun: 2022,
        warna: 'Hitam',
        transmisi: 'automatic',
        bahanBakar: 'bensin',
        harga: 450000000,
        kilometer: 15000,
        lokasi: 'Surabaya',
        foto: ['civic1.jpg', 'civic2.jpg'],
        deskripsi: 'Sedan sporty dengan performa tinggi',
        kondisi: 'bekas',
        nomorPolisi: 'B 1234 ABC',
        pajak: '2024-12-31',
        stnk: '2027-05-15',
        status: 'tersedia'
      }
    ];
    
    // Load payment methods
    const mockMetode: MetodePembayaran[] = [
      {
        id: '1',
        nama: 'Cash/Tunai',
        jenis: 'cash',
        deskripsi: 'Pembayaran langsung secara tunai',
        syarat: ['KTP', 'NPWP', 'Slip Gaji'],
        icon: '💰'
      },
      {
        id: '2',
        nama: 'Kredit Bank',
        jenis: 'kredit',
        deskripsi: 'Pembiayaan melalui bank dengan bunga kompetitif',
        bunga: 8.5,
        tenor: [12, 24, 36, 48, 60],
        syarat: ['KTP', 'NPWP', 'Slip Gaji 3 bulan terakhir', 'Rekening Koran'],
        icon: '🏦'
      },
      {
        id: '3',
        nama: 'Leasing',
        jenis: 'leasing',
        deskripsi: 'Pembiayaan melalui perusahaan leasing',
        bunga: 9.2,
        tenor: [12, 24, 36, 48],
        syarat: ['KTP', 'Slip Gaji', 'Rekening Tabungan'],
        icon: '📋'
      }
    ];
    
    setDaftarMobil(mockMobil);
    setMetodePembayaran(mockMetode);
    
    // Set filter range
    const hargaMax = Math.max(...mockMobil.map(m => m.harga));
    setFilterHarga({ min: 0, max: hargaMax });
  }, []);

  // Filter cars
  const filteredMobil = daftarMobil.filter(mobil => {
    const matchesSearch = mobil.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mobil.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHarga = mobil.harga >= filterHarga.min && mobil.harga <= filterHarga.max;
    const matchesMerk = filterMerk === 'all' || mobil.merk.toLowerCase() === filterMerk.toLowerCase();
    const isAvailable = mobil.status === 'tersedia';
    
    return matchesSearch && matchesHarga && matchesMerk && isAvailable;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembelian Mobil</h1>
          <p className="text-gray-600">Proses pembelian mobil yang mudah dan aman</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'pilih-mobil', label: 'Pilih Mobil', icon: '🚗' },
              { key: 'data-pembelian', label: 'Data Pembelian', icon: '📝' },
              { key: 'metode-pembayaran', label: 'Metode Pembayaran', icon: '💳' },
              { key: 'konfirmasi', label: 'Konfirmasi', icon: '✅' },
              { key: 'pembayaran', label: 'Pembayaran', icon: '💰' },
              { key: 'selesai', label: 'Selesai', icon: '🎉' }
            ].map((step, index) => {
              const isActive = statusHalaman.step === step.key;
              const isCompleted = [
                'pilih-mobil', 'data-pembelian', 'metode-pembayaran', 'konfirmasi', 'pembayaran', 'selesai'
              ].indexOf(statusHalaman.step) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-blue-500 bg-blue-500 text-white' :
                    isCompleted ? 'border-green-500 bg-green-500 text-white' :
                    'border-gray-300 bg-white text-gray-500'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < 5 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Pilih Mobil */}
        {statusHalaman.step === 'pilih-mobil' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Mobil
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Merk atau model..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merk
                  </label>
                  <select
                    value={filterMerk}
                    onChange={(e) => setFilterMerk(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Merk</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="suzuki">Suzuki</option>
                    <option value="daihatsu">Daihatsu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Minimum
                  </label>
                  <input
                    type="number"
                    value={filterHarga.min}
                    onChange={(e) => setFilterHarga(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Maksimum
                  </label>
                  <input
                    type="number"
                    value={filterHarga.max}
                    onChange={(e) => setFilterHarga(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Car List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMobil.map((mobil) => (
                <div key={mobil.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={`/images/${mobil.foto[0]}`}
                      alt={`${mobil.merk} ${mobil.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        mobil.kondisi === 'baru' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {mobil.kondisi}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {mobil.merk} {mobil.model} {mobil.tahun}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Warna:</span>
                        <span>{mobil.warna}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transmisi:</span>
                        <span className="capitalize">{mobil.transmisi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bahan Bakar:</span>
                        <span className="capitalize">{mobil.bahanBakar}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kilometer:</span>
                        <span>{mobil.kilometer.toLocaleString('id-ID')} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lokasi:</span>
                        <span>{mobil.lokasi}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(mobil.harga)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => pilihMobilDanKlikBeli(mobil.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredMobil.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Tidak ada mobil yang sesuai dengan kriteria pencarian</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Data Pembelian */}
        {statusHalaman.step === 'data-pembelian' && statusHalaman.selectedMobil && (
          <div className="space-y-6">
            {/* Selected Car Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mobil yang Dipilih</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={`/images/${statusHalaman.selectedMobil.foto[0]}`}
                  alt={`${statusHalaman.selectedMobil.merk} ${statusHalaman.selectedMobil.model}`}
                  className="w-20 h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div>
                  <h4 className="font-semibold">
                    {statusHalaman.selectedMobil.merk} {statusHalaman.selectedMobil.model} {statusHalaman.selectedMobil.tahun}
                  </h4>
                  <p className="text-gray-600">{statusHalaman.selectedMobil.warna} • {statusHalaman.selectedMobil.transmisi}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(statusHalaman.selectedMobil.harga)}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Data Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Data Pembelian</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: DataPembelian = {
                  namaLengkap: formData.get('namaLengkap') as string,
                  email: formData.get('email') as string,
                  telepon: formData.get('telepon') as string,
                  alamat: formData.get('alamat') as string,
                  ktp: formData.get('ktp') as string,
                  pekerjaan: formData.get('pekerjaan') as string,
                  penghasilan: Number(formData.get('penghasilan')),
                  jenisKredit: formData.get('jenisKredit') as 'cash' | 'kredit',
                  catatanTambahan: formData.get('catatanTambahan') as string
                };
                isiDataPembelian(data);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="namaLengkap"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      name="telepon"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor KTP *
                    </label>
                    <input
                      type="text"
                      name="ktp"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pekerjaan *
                    </label>
                    <input
                      type="text"
                      name="pekerjaan"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penghasilan per Bulan *
                    </label>
                    <input
                      type="number"
                      name="penghasilan"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    name="alamat"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Pembelian *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="jenisKredit"
                        value="cash"
                        className="mr-2"
                        defaultChecked
                      />
                      <span>Cash/Tunai</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="jenisKredit"
                        value="kredit"
                        className="mr-2"
                      />
                      <span>Kredit</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Tambahan
                  </label>
                  <textarea
                    name="catatanTambahan"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan khusus atau permintaan..."
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStatusHalaman(prev => ({ ...prev, step: 'pilih-mobil' }))}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Lanjutkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Metode Pembayaran */}
        {statusHalaman.step === 'metode-pembayaran' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Pilih Metode Pembayaran</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metodePembayaran.map((metode) => (
                  <div
                    key={metode.id}
                    onClick={() => pilihMetodePembayaran(metode)}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      statusHalaman.selectedMetode?.id === metode.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <span className="text-4xl">{metode.icon}</span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-center mb-2">{metode.nama}</h4>
                    <p className="text-gray-600 text-sm text-center mb-4">{metode.deskripsi}</p>
                    
                    {metode.bunga && (
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Bunga: <span className="font-semibold">{metode.bunga}%</span></p>
                        {metode.tenor && (
                          <p className="text-sm text-gray-600">
                            Tenor: {metode.tenor.join(', ')} bulan
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Syarat:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {metode.syarat.map((syarat, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            <span>{syarat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, step: 'data-pembelian' }))}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={() => statusHalaman.selectedMetode && setStatusHalaman(prev => ({ ...prev, step: 'konfirmasi' }))}
                  disabled={!statusHalaman.selectedMetode}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Konfirmasi */}
        {statusHalaman.step === 'konfirmasi' && statusHalaman.selectedMobil && statusHalaman.selectedMetode && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Konfirmasi Pesanan</h3>
              
              {/* Order Summary */}
              <div className="space-y-6">
                {/* Car Details */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Detail Mobil</h4>
                  <div className="flex items-center space-x-4">
                    <img
                      src={`/images/${statusHalaman.selectedMobil.foto[0]}`}
                      alt={`${statusHalaman.selectedMobil.merk} ${statusHalaman.selectedMobil.model}`}
                      className="w-24 h-20 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <div>
                      <h5 className="font-semibold">
                        {statusHalaman.selectedMobil.merk} {statusHalaman.selectedMobil.model} {statusHalaman.selectedMobil.tahun}
                      </h5>
                      <p className="text-gray-600">{statusHalaman.selectedMobil.warna} • {statusHalaman.selectedMobil.transmisi}</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(statusHalaman.selectedMobil.harga)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Metode Pembayaran</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{statusHalaman.selectedMetode.icon}</span>
                    <div>
                      <p className="font-medium">{statusHalaman.selectedMetode.nama}</p>
                      <p className="text-gray-600 text-sm">{statusHalaman.selectedMetode.deskripsi}</p>
                      {statusHalaman.selectedMetode.bunga && (
                        <p className="text-sm text-blue-600">Bunga: {statusHalaman.selectedMetode.bunga}%</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Payment Calculation */}
                {statusHalaman.selectedMetode.jenis === 'kredit' && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Simulasi Kredit</h4>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const uangMuka = Number(formData.get('uangMuka'));
                      const tenor = Number(formData.get('tenor'));
                      
                      const cicilanPerBulan = calculateMonthlyPayment(
                        statusHalaman.selectedMobil!.harga,
                        uangMuka,
                        tenor,
                        statusHalaman.selectedMetode!.bunga || 0
                      );
                      
                      konfirmasiPesanan({
                        uangMuka,
                        cicilanPerBulan
                      });
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Uang Muka (IDR)
                          </label>
                          <input
                            type="number"
                            name="uangMuka"
                            min={statusHalaman.selectedMobil.harga * 0.2}
                            max={statusHalaman.selectedMobil.harga * 0.8}
                            defaultValue={statusHalaman.selectedMobil.harga * 0.3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum 20% dari harga mobil
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tenor (Bulan)
                          </label>
                          <select
                            name="tenor"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            {statusHalaman.selectedMetode.tenor?.map((t) => (
                              <option key={t} value={t}>{t} bulan</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-8">
                        <button
                          type="button"
                          onClick={() => setStatusHalaman(prev => ({ ...prev, step: 'metode-pembayaran' }))}
                          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          disabled={statusHalaman.loading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {statusHalaman.loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Cash Payment */}
                {statusHalaman.selectedMetode.jenis === 'cash' && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Pembayaran Tunai</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Pembayaran:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(statusHalaman.selectedMobil.harga)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={() => setStatusHalaman(prev => ({ ...prev, step: 'metode-pembayaran' }))}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Kembali
                      </button>
                      <button
                        onClick={() => konfirmasiPesanan({ uangMuka: statusHalaman.selectedMobil!.harga })}
                        disabled={statusHalaman.loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {statusHalaman.loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Pembayaran */}
        {statusHalaman.step === 'pembayaran' && statusHalaman.pesanan && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Pembayaran</h3>
              
              {/* Order Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Detail Pesanan</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ID Pesanan:</span>
                    <span className="font-mono">{statusHalaman.pesanan.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal Pesanan:</span>
                    <span>{formatDate(statusHalaman.pesanan.tanggalPesan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {statusHalaman.pesanan.statusPesanan}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment Amount */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">
                    {statusHalaman.pesanan.metodePembayaran.jenis === 'cash' ? 'Total Pembayaran:' : 'Uang Muka:'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(statusHalaman.pesanan.uangMuka)}
                  </span>
                </div>
                
                {statusHalaman.pesanan.cicilanPerBulan && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between text-sm">
                      <span>Cicilan per bulan:</span>
                      <span className="font-semibold">
                        {formatCurrency(statusHalaman.pesanan.cicilanPerBulan)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Pilih Metode Pembayaran</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const invoice: DataInvoice = {
                        id: Date.now().toString(),
                        nomorInvoice: `INV-${Date.now()}`,
                        pesananId: statusHalaman.pesanan!.id,
                        totalPembayaran: statusHalaman.pesanan!.uangMuka,
                        metodePembayaran: 'Transfer Bank',
                        statusPembayaran: 'pending',
                        tanggalJatuhTempo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        linkPembayaran: `https://payment.example.com/pay/${Date.now()}`
                      };
                      lakukanPembayaran(invoice);
                    }}
                    className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-3xl">🏦</span>
                      <p className="font-medium mt-2">Transfer Bank</p>
                      <p className="text-sm text-gray-600">BCA, Mandiri, BNI, BRI</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      const invoice: DataInvoice = {
                        id: Date.now().toString(),
                        nomorInvoice: `INV-${Date.now()}`,
                        pesananId: statusHalaman.pesanan!.id,
                        totalPembayaran: statusHalaman.pesanan!.uangMuka,
                        metodePembayaran: 'E-Wallet',
                        statusPembayaran: 'pending',
                        tanggalJatuhTempo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        qrCode: `data:image/svg+xml;base64,${btoa('<svg>QR Code</svg>')}`
                      };
                      lakukanPembayaran(invoice);
                    }}
                    className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-3xl">📱</span>
                      <p className="font-medium mt-2">E-Wallet</p>
                      <p className="text-sm text-gray-600">GoPay, OVO, DANA</p>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, step: 'konfirmasi' }))}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
                {statusHalaman.error && (
                  <button
                    onClick={ulangiPembayaran}
                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Ulangi Pembayaran
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Selesai */}
        {statusHalaman.step === 'selesai' && statusHalaman.invoice && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mb-6">
                <span className="text-6xl">🎉</span>
              </div>
              
              <h3 className="text-2xl font-bold text-green-600 mb-4">
                Pembayaran Berhasil!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Terima kasih atas pembelian Anda. Pesanan Anda sedang diproses.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Detail Pembayaran</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nomor Invoice:</span>
                    <span className="font-mono">{statusHalaman.invoice.nomorInvoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode Pembayaran:</span>
                    <span>{statusHalaman.invoice.metodePembayaran}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Dibayar:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(statusHalaman.invoice.totalPembayaran)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {statusHalaman.invoice.statusPembayaran}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Tim kami akan menghubungi Anda dalam 1x24 jam untuk proses selanjutnya.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Beli Lagi
                  </button>
                  <button
                    onClick={() => {/* Navigate to order history */}}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Lihat Pesanan
                  </button>
                </div>
              </div>
            </div>
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
        {statusHalaman.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {statusHalaman.step === 'konfirmasi' ? 'Memproses pesanan...' :
                   statusHalaman.step === 'pembayaran' ? 'Memproses pembayaran...' :
                   'Memuat...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanPembelian;