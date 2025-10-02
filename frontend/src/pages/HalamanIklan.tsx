import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, Camera, MapPin, Calendar, CreditCard, Eye, Edit, Trash2, Plus, Filter, Search, Star, Clock, DollarSign, Package, Image as ImageIcon, FileText, AlertCircle, CheckCircle, Target, Users, BarChart3, Play, Pause, Settings } from 'lucide-react';

// Interfaces
interface DataMobil {
  id?: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  transmisi: 'Manual' | 'Automatic' | 'CVT';
  bahanBakar: 'Bensin' | 'Diesel' | 'Hybrid' | 'Electric';
  kilometer: number;
  harga: number;
  deskripsi: string;
  kondisi: 'Baru' | 'Bekas';
  lokasi: string;
  nomorPolisi?: string;
  nomorMesin?: string;
  nomorRangka?: string;
  pajak: string;
  stnk: string;
  fiturTambahan: string[];
}

interface FotoMobil {
  id: string;
  url: string;
  file: File;
  isMain: boolean;
  caption?: string;
}

interface PaketIklan {
  id: string;
  nama: string;
  durasi: number;
  harga: number;
  fitur: string[];
  prioritas: 'basic' | 'premium' | 'vip';
  maxFoto: number;
  highlight: boolean;
  topPosition: boolean;
  socialMediaBoost: boolean;
}

interface TargetAudiens {
  id: string;
  nama: string;
  usia: { min: number; max: number };
  gender: 'pria' | 'wanita' | 'semua';
  lokasi: string[];
  minat: string[];
  budgetRange: { min: number; max: number };
  estimasiReach: number;
}

interface Platform {
  id: string;
  nama: string;
  icon: string;
  biaya: number;
  reach: number;
  engagement: number;
  isActive: boolean;
}

interface DataIklan {
  id?: string;
  dataMobil: DataMobil;
  fotoMobil: FotoMobil[];
  paketIklan: PaketIklan;
  targetAudiens: TargetAudiens;
  platforms: Platform[];
  anggaran: number;
  jadwal: {
    mulai: string;
    selesai: string;
    waktuTayang: string[];
  };
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  performa: {
    views: number;
    clicks: number;
    contacts: number;
    ctr: number;
    cost: number;
  };
  tanggalDibuat: string;
  tanggalExpired: string;
  userId: string;
}

interface StateHalaman {
  loading: boolean;
  error: string | null;
  currentView: 'menu' | 'create' | 'edit' | 'performance' | 'audience' | 'platform' | 'budget' | 'schedule';
  currentStep: 'data_mobil' | 'upload_foto' | 'pilih_paket' | 'target_audiens' | 'platform' | 'anggaran' | 'jadwal' | 'konfirmasi';
  dataMobil: DataMobil;
  fotoMobil: FotoMobil[];
  paketTerpilih: PaketIklan | null;
  targetAudiensSelected: TargetAudiens | null;
  platformsSelected: Platform[];
  anggaran: number;
  jadwal: {
    mulai: string;
    selesai: string;
    waktuTayang: string[];
  };
  daftarPaket: PaketIklan[];
  daftarTargetAudiens: TargetAudiens[];
  daftarPlatform: Platform[];
  iklanList: DataIklan[];
  iklanTerpilih: DataIklan | null;
  uploadProgress: number;
  isUploading: boolean;
  showPreview: boolean;
  filterStatus: string;
  searchQuery: string;
  showConfirmation: boolean;
  performanceData: any;
}

const HalamanIklan: React.FC = () => {
  const [state, setState] = useState<StateHalaman>({
    loading: false,
    error: null,
    currentView: 'menu',
    currentStep: 'data_mobil',
    dataMobil: {
      merk: '',
      model: '',
      tahun: new Date().getFullYear(),
      warna: '',
      transmisi: 'Manual',
      bahanBakar: 'Bensin',
      kilometer: 0,
      harga: 0,
      deskripsi: '',
      kondisi: 'Bekas',
      lokasi: '',
      pajak: '',
      stnk: '',
      fiturTambahan: []
    },
    fotoMobil: [],
    paketTerpilih: null,
    targetAudiensSelected: null,
    platformsSelected: [],
    anggaran: 0,
    jadwal: {
      mulai: '',
      selesai: '',
      waktuTayang: []
    },
    daftarPaket: [],
    daftarTargetAudiens: [],
    daftarPlatform: [],
    iklanList: [],
    iklanTerpilih: null,
    uploadProgress: 0,
    isUploading: false,
    showPreview: false,
    filterStatus: 'all',
    searchQuery: '',
    showConfirmation: false,
    performanceData: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Method: aksesMenuIklan
  const aksesMenuIklan = () => {
    setState(prev => ({
      ...prev,
      currentView: 'menu',
      error: null
    }));
    
    loadIklanList();
    loadInitialData();
  };

  // Method: buatIklanBaru
  const buatIklanBaru = () => {
    setState(prev => ({
      ...prev,
      currentView: 'create',
      currentStep: 'data_mobil',
      dataMobil: {
        merk: '',
        model: '',
        tahun: new Date().getFullYear(),
        warna: '',
        transmisi: 'Manual',
        bahanBakar: 'Bensin',
        kilometer: 0,
        harga: 0,
        deskripsi: '',
        kondisi: 'Bekas',
        lokasi: '',
        pajak: '',
        stnk: '',
        fiturTambahan: []
      },
      fotoMobil: [],
      paketTerpilih: null,
      targetAudiensSelected: null,
      platformsSelected: [],
      anggaran: 0,
      jadwal: {
        mulai: '',
        selesai: '',
        waktuTayang: []
      },
      error: null
    }));
  };

  // Method: editIklan
  const editIklan = (iklan: DataIklan) => {
    setState(prev => ({
      ...prev,
      currentView: 'edit',
      currentStep: 'data_mobil',
      iklanTerpilih: iklan,
      dataMobil: iklan.dataMobil,
      fotoMobil: iklan.fotoMobil,
      paketTerpilih: iklan.paketIklan,
      targetAudiensSelected: iklan.targetAudiens,
      platformsSelected: iklan.platforms,
      anggaran: iklan.anggaran,
      jadwal: iklan.jadwal,
      error: null
    }));
  };

  // Method: hapusIklan
  const hapusIklan = async (iklanId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus iklan ini?')) {
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        iklanList: prev.iklanList.filter(iklan => iklan.id !== iklanId),
        loading: false
      }));

      alert('Iklan berhasil dihapus');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal menghapus iklan',
        loading: false
      }));
    }
  };

  // Method: lihatPerformaIklan
  const lihatPerformaIklan = async (iklan: DataIklan) => {
    setState(prev => ({ ...prev, loading: true, currentView: 'performance', iklanTerpilih: iklan }));

    try {
      // Simulate loading performance data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const performanceData = {
        overview: {
          totalViews: iklan.performa.views,
          totalClicks: iklan.performa.clicks,
          totalContacts: iklan.performa.contacts,
          ctr: iklan.performa.ctr,
          totalSpent: iklan.performa.cost,
          avgCostPerClick: iklan.performa.cost / iklan.performa.clicks || 0
        },
        dailyStats: generateDailyStats(),
        platformBreakdown: generatePlatformBreakdown(iklan.platforms),
        audienceInsights: generateAudienceInsights()
      };

      setState(prev => ({
        ...prev,
        performanceData,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data performa',
        loading: false
      }));
    }
  };

  // Method: aturTargetAudiens
  const aturTargetAudiens = (targetAudiens: TargetAudiens) => {
    setState(prev => ({
      ...prev,
      targetAudiensSelected: targetAudiens,
      currentView: 'audience'
    }));
  };

  // Method: pilihPlatformIklan
  const pilihPlatformIklan = (platforms: Platform[]) => {
    setState(prev => ({
      ...prev,
      platformsSelected: platforms,
      currentView: 'platform'
    }));
  };

  // Method: setAnggaranIklan
  const setAnggaranIklan = (anggaran: number) => {
    setState(prev => ({
      ...prev,
      anggaran,
      currentView: 'budget'
    }));
  };

  // Method: jadwalkanIklan
  const jadwalkanIklan = (jadwal: { mulai: string; selesai: string; waktuTayang: string[] }) => {
    setState(prev => ({
      ...prev,
      jadwal,
      currentView: 'schedule'
    }));
  };

  // Method: pauseIklan
  const pauseIklan = async (iklanId: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        iklanList: prev.iklanList.map(iklan =>
          iklan.id === iklanId
            ? { ...iklan, status: iklan.status === 'active' ? 'paused' : 'active' }
            : iklan
        ),
        loading: false
      }));

      const iklan = state.iklanList.find(i => i.id === iklanId);
      const newStatus = iklan?.status === 'active' ? 'dijeda' : 'diaktifkan';
      alert(`Iklan berhasil ${newStatus}`);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal mengubah status iklan',
        loading: false
      }));
    }
  };

  // Helper functions
  const loadIklanList = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockIklanList: DataIklan[] = [
        {
          id: 'iklan_001',
          dataMobil: {
            merk: 'Toyota',
            model: 'Avanza',
            tahun: 2022,
            warna: 'Putih',
            transmisi: 'Manual',
            bahanBakar: 'Bensin',
            kilometer: 15000,
            harga: 180000000,
            deskripsi: 'Mobil keluarga yang nyaman dan irit',
            kondisi: 'Bekas',
            lokasi: 'Jakarta Selatan',
            pajak: '2024-12-31',
            stnk: '2024-12-31',
            fiturTambahan: ['AC', 'Power Steering', 'Central Lock']
          },
          fotoMobil: [
            {
              id: 'foto_001',
              url: '/images/cars/avanza-1.jpg',
              file: new File([], 'avanza-1.jpg'),
              isMain: true
            }
          ],
          paketIklan: {
            id: 'paket_premium',
            nama: 'Premium',
            durasi: 30,
            harga: 500000,
            fitur: ['Highlight', 'Top Position', 'Social Media Boost'],
            prioritas: 'premium',
            maxFoto: 10,
            highlight: true,
            topPosition: true,
            socialMediaBoost: true
          },
          targetAudiens: {
            id: 'target_001',
            nama: 'Keluarga Muda',
            usia: { min: 25, max: 40 },
            gender: 'semua',
            lokasi: ['Jakarta', 'Bogor', 'Depok'],
            minat: ['Mobil Keluarga', 'MPV'],
            budgetRange: { min: 150000000, max: 200000000 },
            estimasiReach: 50000
          },
          platforms: [
            {
              id: 'facebook',
              nama: 'Facebook',
              icon: '📘',
              biaya: 200000,
              reach: 25000,
              engagement: 1250,
              isActive: true
            },
            {
              id: 'instagram',
              nama: 'Instagram',
              icon: '📷',
              biaya: 150000,
              reach: 20000,
              engagement: 1500,
              isActive: true
            }
          ],
          anggaran: 500000,
          jadwal: {
            mulai: '2024-01-15',
            selesai: '2024-02-14',
            waktuTayang: ['09:00', '12:00', '18:00']
          },
          status: 'active',
          performa: {
            views: 12500,
            clicks: 450,
            contacts: 25,
            ctr: 3.6,
            cost: 350000
          },
          tanggalDibuat: '2024-01-15T10:00:00Z',
          tanggalExpired: '2024-02-14T23:59:59Z',
          userId: 'user_001'
        }
      ];

      setState(prev => ({
        ...prev,
        iklanList: mockIklanList,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat daftar iklan',
        loading: false
      }));
    }
  };

  const loadInitialData = async () => {
    try {
      const mockPaket: PaketIklan[] = [
        {
          id: 'basic',
          nama: 'Basic',
          durasi: 7,
          harga: 100000,
          fitur: ['Listing Standard', '5 Foto'],
          prioritas: 'basic',
          maxFoto: 5,
          highlight: false,
          topPosition: false,
          socialMediaBoost: false
        },
        {
          id: 'premium',
          nama: 'Premium',
          durasi: 30,
          harga: 500000,
          fitur: ['Highlight', 'Top Position', '10 Foto', 'Social Media Boost'],
          prioritas: 'premium',
          maxFoto: 10,
          highlight: true,
          topPosition: true,
          socialMediaBoost: true
        }
      ];

      const mockTargetAudiens: TargetAudiens[] = [
        {
          id: 'keluarga_muda',
          nama: 'Keluarga Muda',
          usia: { min: 25, max: 40 },
          gender: 'semua',
          lokasi: ['Jakarta', 'Bogor', 'Depok'],
          minat: ['Mobil Keluarga', 'MPV'],
          budgetRange: { min: 150000000, max: 300000000 },
          estimasiReach: 50000
        },
        {
          id: 'profesional_muda',
          nama: 'Profesional Muda',
          usia: { min: 22, max: 35 },
          gender: 'semua',
          lokasi: ['Jakarta', 'Tangerang', 'Bekasi'],
          minat: ['Sedan', 'Hatchback'],
          budgetRange: { min: 100000000, max: 250000000 },
          estimasiReach: 35000
        }
      ];

      const mockPlatform: Platform[] = [
        {
          id: 'facebook',
          nama: 'Facebook',
          icon: '📘',
          biaya: 200000,
          reach: 25000,
          engagement: 1250,
          isActive: false
        },
        {
          id: 'instagram',
          nama: 'Instagram',
          icon: '📷',
          biaya: 150000,
          reach: 20000,
          engagement: 1500,
          isActive: false
        },
        {
          id: 'google',
          nama: 'Google Ads',
          icon: '🔍',
          biaya: 300000,
          reach: 40000,
          engagement: 2000,
          isActive: false
        }
      ];

      setState(prev => ({
        ...prev,
        daftarPaket: mockPaket,
        daftarTargetAudiens: mockTargetAudiens,
        daftarPlatform: mockPlatform
      }));
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generateDailyStats = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000) + 500,
        clicks: Math.floor(Math.random() * 50) + 20,
        contacts: Math.floor(Math.random() * 5) + 1,
        cost: Math.floor(Math.random() * 50000) + 25000
      });
    }
    return days;
  };

  const generatePlatformBreakdown = (platforms: Platform[]) => {
    return platforms.map(platform => ({
      ...platform,
      views: Math.floor(Math.random() * 5000) + 2000,
      clicks: Math.floor(Math.random() * 200) + 100,
      contacts: Math.floor(Math.random() * 10) + 5,
      spent: Math.floor(Math.random() * 200000) + 100000
    }));
  };

  const generateAudienceInsights = () => {
    return {
      ageGroups: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 45 },
        { range: '35-44', percentage: 30 },
        { range: '45+', percentage: 10 }
      ],
      gender: [
        { type: 'Pria', percentage: 60 },
        { type: 'Wanita', percentage: 40 }
      ],
      locations: [
        { city: 'Jakarta', percentage: 40 },
        { city: 'Bogor', percentage: 25 },
        { city: 'Depok', percentage: 20 },
        { city: 'Tangerang', percentage: 15 }
      ]
    };
  };

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
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreateIklan = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Validate required fields
      if (!state.dataMobil.merk || !state.dataMobil.model || !state.paketTerpilih) {
        throw new Error('Mohon lengkapi semua data yang diperlukan');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newIklan: DataIklan = {
        id: `iklan_${Date.now()}`,
        dataMobil: state.dataMobil,
        fotoMobil: state.fotoMobil,
        paketIklan: state.paketTerpilih,
        targetAudiens: state.targetAudiensSelected!,
        platforms: state.platformsSelected,
        anggaran: state.anggaran,
        jadwal: state.jadwal,
        status: 'pending',
        performa: {
          views: 0,
          clicks: 0,
          contacts: 0,
          ctr: 0,
          cost: 0
        },
        tanggalDibuat: new Date().toISOString(),
        tanggalExpired: new Date(Date.now() + state.paketTerpilih.durasi * 24 * 60 * 60 * 1000).toISOString(),
        userId: 'user_001'
      };

      setState(prev => ({
        ...prev,
        iklanList: [newIklan, ...prev.iklanList],
        currentView: 'menu',
        loading: false
      }));

      alert('Iklan berhasil dibuat dan sedang dalam proses review');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Gagal membuat iklan',
        loading: false
      }));
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    aksesMenuIklan();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Kelola Iklan</h1>
              {state.currentView !== 'menu' && (
                <button
                  onClick={() => setState(prev => ({ ...prev, currentView: 'menu' }))}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ← Kembali ke Menu
                </button>
              )}
            </div>
            
            {state.currentView === 'menu' && (
              <button
                onClick={buatIklanBaru}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Iklan Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu View */}
        {state.currentView === 'menu' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {state.iklanList.reduce((sum, iklan) => sum + iklan.performa.views, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {state.iklanList.reduce((sum, iklan) => sum + iklan.performa.contacts, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(state.iklanList.reduce((sum, iklan) => sum + iklan.performa.cost, 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(state.iklanList.reduce((sum, iklan) => sum + iklan.performa.ctr, 0) / state.iklanList.length || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari iklan..."
                      value={state.searchQuery}
                      onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={state.filterStatus}
                  onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="paused">Dijeda</option>
                  <option value="completed">Selesai</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Iklan List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Daftar Iklan</h3>
              </div>
              
              {state.loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat data...</p>
                </div>
              ) : state.iklanList.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada iklan yang dibuat</p>
                  <button
                    onClick={buatIklanBaru}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Buat Iklan Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {state.iklanList
                    .filter(iklan => 
                      (state.filterStatus === 'all' || iklan.status === state.filterStatus) &&
                      (state.searchQuery === '' || 
                       iklan.dataMobil.merk.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                       iklan.dataMobil.model.toLowerCase().includes(state.searchQuery.toLowerCase()))
                    )
                    .map(iklan => (
                      <div key={iklan.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={iklan.fotoMobil.find(f => f.isMain)?.url || iklan.fotoMobil[0]?.url}
                              alt="Car"
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/cars/default.jpg';
                              }}
                            />
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {iklan.dataMobil.merk} {iklan.dataMobil.model} {iklan.dataMobil.tahun}
                              </h4>
                              <p className="text-sm text-gray-600">{formatCurrency(iklan.dataMobil.harga)}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(iklan.status)}`}>
                                  {iklan.status.charAt(0).toUpperCase() + iklan.status.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {iklan.paketIklan.nama} • {iklan.paketIklan.durasi} hari
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-right text-sm">
                              <p className="text-gray-900 font-medium">{iklan.performa.views.toLocaleString()} views</p>
                              <p className="text-gray-600">{iklan.performa.contacts} contacts</p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => lihatPerformaIklan(iklan)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Lihat Performa"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => editIklan(iklan)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="Edit Iklan"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => pauseIklan(iklan.id!)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title={iklan.status === 'active' ? 'Jeda Iklan' : 'Aktifkan Iklan'}
                              >
                                {iklan.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              
                              <button
                                onClick={() => hapusIklan(iklan.id!)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                title="Hapus Iklan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit View */}
        {(state.currentView === 'create' || state.currentView === 'edit') && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {state.currentView === 'create' ? 'Buat Iklan Baru' : 'Edit Iklan'}
              </h3>
            </div>
            
            <div className="p-6">
              {/* Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {['data_mobil', 'upload_foto', 'pilih_paket', 'target_audiens', 'platform', 'anggaran', 'jadwal', 'konfirmasi'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === state.currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 7 && <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              {state.currentStep === 'data_mobil' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Data Mobil</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Merk</label>
                      <input
                        type="text"
                        value={state.dataMobil.merk}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          dataMobil: { ...prev.dataMobil, merk: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Toyota"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                      <input
                        type="text"
                        value={state.dataMobil.model}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          dataMobil: { ...prev.dataMobil, model: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Avanza"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                      <input
                        type="number"
                        value={state.dataMobil.tahun}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          dataMobil: { ...prev.dataMobil, tahun: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                      <input
                        type="number"
                        value={state.dataMobil.harga}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          dataMobil: { ...prev.dataMobil, harga: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: 180000000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                      value={state.dataMobil.deskripsi}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, deskripsi: e.target.value }
                      }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Deskripsikan mobil Anda..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentStep: 'upload_foto' }))}
                      disabled={!state.dataMobil.merk || !state.dataMobil.model}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              )}

              {state.currentStep === 'pilih_paket' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Pilih Paket Iklan</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.daftarPaket.map(paket => (
                      <div
                        key={paket.id}
                        onClick={() => setState(prev => ({ ...prev, paketTerpilih: paket }))}
                        className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                          state.paketTerpilih?.id === paket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-lg font-semibold text-gray-900">{paket.nama}</h5>
                          <span className="text-2xl font-bold text-blue-600">{formatCurrency(paket.harga)}</span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{paket.durasi} hari</p>
                        
                        <ul className="space-y-2">
                          {paket.fitur.map((fitur, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              {fitur}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentStep: 'upload_foto' }))}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentStep: 'target_audiens' }))}
                      disabled={!state.paketTerpilih}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              )}

              {state.currentStep === 'konfirmasi' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Konfirmasi Iklan</h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h5 className="font-medium text-gray-900 mb-4">Ringkasan Iklan</h5>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Mobil:</span> {state.dataMobil.merk} {state.dataMobil.model} {state.dataMobil.tahun}</p>
                      <p><span className="font-medium">Harga:</span> {formatCurrency(state.dataMobil.harga)}</p>
                      <p><span className="font-medium">Paket:</span> {state.paketTerpilih?.nama} ({state.paketTerpilih?.durasi} hari)</p>
                      <p><span className="font-medium">Target:</span> {state.targetAudiensSelected?.nama}</p>
                      <p><span className="font-medium">Platform:</span> {state.platformsSelected.map(p => p.nama).join(', ')}</p>
                      <p><span className="font-medium">Anggaran:</span> {formatCurrency(state.anggaran)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentStep: 'jadwal' }))}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleCreateIklan}
                      disabled={state.loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.loading ? 'Memproses...' : 'Buat Iklan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance View */}
        {state.currentView === 'performance' && state.performanceData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Performa Iklan</h3>
              
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{state.performanceData.overview.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{state.performanceData.overview.totalClicks.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{state.performanceData.overview.totalContacts}</p>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                </div>
              </div>

              {/* Daily Stats Chart Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Grafik performa harian akan ditampilkan di sini</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm z-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{state.error}</span>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {state.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Memproses...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanIklan;