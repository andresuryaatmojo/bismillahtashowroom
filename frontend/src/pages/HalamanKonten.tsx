import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Save, 
  Upload, 
  Image, 
  Video, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  ThumbsUp,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface KontenData {
  id?: string;
  judul: string;
  kategori: 'Artikel' | 'Video' | 'Infografis' | 'Berita';
  konten: string;
  excerpt: string;
  thumbnail?: string;
  media?: MediaFile[];
  tags: string[];
  status: 'Draft' | 'Review' | 'Published' | 'Archived';
  tanggalDibuat: string;
  tanggalPublikasi?: string;
  penulis: string;
  views: number;
  likes: number;
  shares: number;
  komentar: KomentarData[];
}

interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
}

interface KomentarData {
  id: string;
  nama: string;
  email: string;
  konten: string;
  tanggal: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  balasan?: KomentarData[];
}

interface StatistikKonten {
  totalKonten: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalKomentar: number;
  kontenTerpopuler: KontenData[];
  trendViews: { tanggal: string; views: number }[];
}

interface KontenState {
  currentView: 'kelola' | 'tambah' | 'edit' | 'preview' | 'statistik' | 'moderasi';
  daftarKonten: KontenData[];
  selectedKonten: KontenData | null;
  kontenForm: KontenData;
  searchQuery: string;
  filterKategori: string;
  filterStatus: string;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  showDeleteConfirm: boolean;
  kontenToDelete: string | null;
  statistik: StatistikKonten;
  komentarPending: KomentarData[];
  previewMode: 'desktop' | 'mobile';
}

const HalamanKonten: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<KontenState>({
    currentView: 'kelola',
    daftarKonten: [
      {
        id: '1',
        judul: 'Tips Memilih Mobil Bekas Berkualitas',
        kategori: 'Artikel',
        konten: 'Membeli mobil bekas memerlukan ketelitian...',
        excerpt: 'Panduan lengkap untuk memilih mobil bekas yang berkualitas dan sesuai budget.',
        thumbnail: '/images/tips-mobil-bekas.jpg',
        tags: ['tips', 'mobil bekas', 'panduan'],
        status: 'Published',
        tanggalDibuat: '2024-01-15',
        tanggalPublikasi: '2024-01-16',
        penulis: 'Admin',
        views: 1250,
        likes: 89,
        shares: 23,
        komentar: []
      },
      {
        id: '2',
        judul: 'Tren Mobil Listrik di Indonesia 2024',
        kategori: 'Berita',
        konten: 'Perkembangan mobil listrik di Indonesia...',
        excerpt: 'Analisis tren dan perkembangan mobil listrik di pasar otomotif Indonesia.',
        tags: ['mobil listrik', 'tren', '2024'],
        status: 'Draft',
        tanggalDibuat: '2024-01-20',
        penulis: 'Admin',
        views: 0,
        likes: 0,
        shares: 0,
        komentar: []
      }
    ],
    selectedKonten: null,
    kontenForm: {
      judul: '',
      kategori: 'Artikel',
      konten: '',
      excerpt: '',
      tags: [],
      status: 'Draft',
      tanggalDibuat: new Date().toISOString().split('T')[0],
      penulis: 'Admin',
      views: 0,
      likes: 0,
      shares: 0,
      komentar: []
    },
    searchQuery: '',
    filterKategori: '',
    filterStatus: '',
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    showDeleteConfirm: false,
    kontenToDelete: null,
    statistik: {
      totalKonten: 25,
      totalViews: 15420,
      totalLikes: 892,
      totalShares: 234,
      totalKomentar: 156,
      kontenTerpopuler: [],
      trendViews: []
    },
    komentarPending: [
      {
        id: '1',
        nama: 'John Doe',
        email: 'john@example.com',
        konten: 'Artikel yang sangat membantu!',
        tanggal: '2024-01-21',
        status: 'Pending'
      }
    ],
    previewMode: 'desktop'
  });

  // Methods Implementation
  const tampilkanKelolaKonten = () => {
    setState(prev => ({ ...prev, currentView: 'kelola' }));
  };

  const tampilkanFormTambahKonten = () => {
    setState(prev => ({
      ...prev,
      currentView: 'tambah',
      kontenForm: {
        judul: '',
        kategori: 'Artikel',
        konten: '',
        excerpt: '',
        tags: [],
        status: 'Draft',
        tanggalDibuat: new Date().toISOString().split('T')[0],
        penulis: 'Admin',
        views: 0,
        likes: 0,
        shares: 0,
        komentar: []
      }
    }));
  };

  const tampilkanFormEditKonten = (konten: KontenData) => {
    setState(prev => ({
      ...prev,
      currentView: 'edit',
      selectedKonten: konten,
      kontenForm: { ...konten }
    }));
  };

  const tampilkanPreviewKonten = (konten: KontenData) => {
    setState(prev => ({
      ...prev,
      currentView: 'preview',
      selectedKonten: konten
    }));
  };

  const konfirmasiPublikasi = async (kontenId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        daftarKonten: prev.daftarKonten.map(konten =>
          konten.id === kontenId
            ? {
                ...konten,
                status: 'Published' as const,
                tanggalPublikasi: new Date().toISOString().split('T')[0]
              }
            : konten
        ),
        isLoading: false
      }));
      
      alert('Konten berhasil dipublikasikan!');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal mempublikasikan konten');
    }
  };

  const tampilkanStatistikKonten = () => {
    setState(prev => ({ ...prev, currentView: 'statistik' }));
  };

  const moderasiKomentar = () => {
    setState(prev => ({ ...prev, currentView: 'moderasi' }));
  };

  const simpanKonten = async () => {
    if (!state.kontenForm.judul || !state.kontenForm.konten) {
      alert('Judul dan konten harus diisi');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newKonten: KontenData = {
        ...state.kontenForm,
        id: state.selectedKonten?.id || Date.now().toString(),
        tanggalDibuat: state.selectedKonten?.tanggalDibuat || new Date().toISOString().split('T')[0]
      };

      if (state.selectedKonten) {
        // Update existing
        setState(prev => ({
          ...prev,
          daftarKonten: prev.daftarKonten.map(konten =>
            konten.id === state.selectedKonten!.id ? newKonten : konten
          ),
          currentView: 'kelola',
          isLoading: false
        }));
      } else {
        // Add new
        setState(prev => ({
          ...prev,
          daftarKonten: [newKonten, ...prev.daftarKonten],
          currentView: 'kelola',
          isLoading: false
        }));
      }

      alert('Konten berhasil disimpan!');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal menyimpan konten');
    }
  };

  const hapusKonten = async () => {
    if (!state.kontenToDelete) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        daftarKonten: prev.daftarKonten.filter(konten => konten.id !== state.kontenToDelete),
        showDeleteConfirm: false,
        kontenToDelete: null,
        isLoading: false
      }));

      alert('Konten berhasil dihapus!');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal menghapus konten');
    }
  };

  // Additional Content Management Methods
  const aksesMenuKonten = () => {
    setState(prev => ({ ...prev, currentView: 'kelola' }));
  };

  const buatKontenBaru = () => {
    setState(prev => ({
      ...prev,
      currentView: 'tambah',
      kontenForm: {
        judul: '',
        kategori: 'Artikel',
        konten: '',
        excerpt: '',
        tags: [],
        status: 'Draft',
        tanggalDibuat: new Date().toISOString().split('T')[0],
        penulis: 'Admin',
        views: 0,
        likes: 0,
        shares: 0,
        komentar: []
      }
    }));
  };

  const editKonten = (konten: KontenData) => {
    setState(prev => ({
      ...prev,
      currentView: 'edit',
      selectedKonten: konten,
      kontenForm: { ...konten }
    }));
  };

  const publikasiKonten = async (kontenId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        daftarKonten: prev.daftarKonten.map(konten =>
          konten.id === kontenId
            ? {
                ...konten,
                status: 'Published' as const,
                tanggalPublikasi: new Date().toISOString().split('T')[0]
              }
            : konten
        ),
        isLoading: false
      }));
      
      alert('Konten berhasil dipublikasikan!');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal mempublikasikan konten');
    }
  };

  const jadwalkanKonten = async (kontenId: string, tanggalPublikasi: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        daftarKonten: prev.daftarKonten.map(konten =>
          konten.id === kontenId
            ? {
                ...konten,
                status: 'Review' as const,
                tanggalPublikasi: tanggalPublikasi
              }
            : konten
        ),
        isLoading: false
      }));
      
      alert(`Konten berhasil dijadwalkan untuk publikasi pada ${tanggalPublikasi}!`);
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal menjadwalkan konten');
    }
  };

  const lihatAnalitikKonten = () => {
    // Load analytics data
    const analyticsData = {
      totalKonten: state.daftarKonten.length,
      totalViews: state.daftarKonten.reduce((sum, konten) => sum + konten.views, 0),
      totalLikes: state.daftarKonten.reduce((sum, konten) => sum + konten.likes, 0),
      totalShares: state.daftarKonten.reduce((sum, konten) => sum + konten.shares, 0),
      totalKomentar: state.daftarKonten.reduce((sum, konten) => sum + konten.komentar.length, 0),
      kontenTerpopuler: state.daftarKonten
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
      trendViews: [
        { tanggal: '2024-01-15', views: 1250 },
        { tanggal: '2024-01-16', views: 1380 },
        { tanggal: '2024-01-17', views: 1420 },
        { tanggal: '2024-01-18', views: 1650 },
        { tanggal: '2024-01-19', views: 1890 },
        { tanggal: '2024-01-20', views: 2100 },
        { tanggal: '2024-01-21', views: 2350 }
      ]
    };

    setState(prev => ({
      ...prev,
      currentView: 'statistik',
      statistik: analyticsData
    }));
  };

  const aturKategori = (kategori: string[]) => {
    // Simulate category management
    console.log('Mengatur kategori:', kategori);
    alert('Kategori berhasil diatur!');
  };

  const kelolaTags = (tags: string[]) => {
    // Update tags in current form
    setState(prev => ({
      ...prev,
      kontenForm: {
        ...prev.kontenForm,
        tags: tags
      }
    }));
  };

  const uploadMedia = async (files: File[]) => {
    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setState(prev => ({ ...prev, uploadProgress: progress }));
        }

        const mediaFile: MediaFile = {
          id: Date.now().toString() + i,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };

        setState(prev => ({
          ...prev,
          kontenForm: {
            ...prev.kontenForm,
            media: [...(prev.kontenForm.media || []), mediaFile]
          }
        }));
      }

      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
    } catch (error) {
      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));
      alert('Gagal mengupload media');
    }
  };

  const approveKomentar = (komentarId: string) => {
    setState(prev => ({
      ...prev,
      komentarPending: prev.komentarPending.map(komentar =>
        komentar.id === komentarId
          ? { ...komentar, status: 'Approved' as const }
          : komentar
      )
    }));
  };

  const rejectKomentar = (komentarId: string) => {
    setState(prev => ({
      ...prev,
      komentarPending: prev.komentarPending.map(komentar =>
        komentar.id === komentarId
          ? { ...komentar, status: 'Rejected' as const }
          : komentar
      )
    }));
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredKonten = state.daftarKonten.filter(konten => {
    const matchesSearch = konten.judul.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         konten.konten.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesKategori = !state.filterKategori || konten.kategori === state.filterKategori;
    const matchesStatus = !state.filterStatus || konten.status === state.filterStatus;
    
    return matchesSearch && matchesKategori && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Konten</h1>
              <p className="mt-1 text-sm text-gray-600">
                Kelola artikel, berita, dan konten lainnya
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={tampilkanStatistikKonten}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  state.currentView === 'statistik'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistik</span>
              </button>
              
              <button
                onClick={moderasiKomentar}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 relative ${
                  state.currentView === 'moderasi'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Moderasi</span>
                {state.komentarPending.filter(k => k.status === 'Pending').length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.komentarPending.filter(k => k.status === 'Pending').length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Tambah/Edit Konten */}
        {(state.currentView === 'tambah' || state.currentView === 'edit') && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {state.currentView === 'tambah' ? 'Tambah Konten Baru' : 'Edit Konten'}
                </h3>
                <button
                  onClick={tampilkanKelolaKonten}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Kembali
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul *</label>
                    <input
                      type="text"
                      value={state.kontenForm.judul}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        kontenForm: { ...prev.kontenForm, judul: e.target.value }
                      }))}
                      placeholder="Masukkan judul konten"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                    <textarea
                      value={state.kontenForm.excerpt}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        kontenForm: { ...prev.kontenForm, excerpt: e.target.value }
                      }))}
                      placeholder="Ringkasan singkat konten (maksimal 160 karakter)"
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {state.kontenForm.excerpt.length}/160 karakter
                    </p>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konten *</label>
                    <div className="border border-gray-300 rounded-lg">
                      {/* Toolbar */}
                      <div className="border-b border-gray-200 p-3 flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          <strong>B</strong>
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          <em>I</em>
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          <u>U</u>
                        </button>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded flex items-center space-x-1"
                        >
                          <Image className="w-4 h-4" />
                          <span className="text-sm">Gambar</span>
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Video</span>
                        </button>
                      </div>
                      
                      {/* Editor */}
                      <textarea
                        value={state.kontenForm.konten}
                        onChange={(e) => setState(prev => ({
                          ...prev,
                          kontenForm: { ...prev.kontenForm, konten: e.target.value }
                        }))}
                        placeholder="Tulis konten di sini..."
                        rows={15}
                        className="w-full p-4 border-0 focus:ring-0 resize-none"
                      />
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Klik untuk upload gambar atau video</p>
                      <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, MP4. Maksimal 10MB</p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          uploadMedia(files);
                        }
                      }}
                      className="hidden"
                    />

                    {/* Upload Progress */}
                    {state.isUploading && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Mengupload media...</span>
                          <span className="text-sm text-gray-600">{state.uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${state.uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Media Grid */}
                    {state.kontenForm.media && state.kontenForm.media.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {state.kontenForm.media.map((media) => (
                          <div key={media.id} className="relative group">
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={media.name}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  kontenForm: {
                                    ...prev.kontenForm,
                                    media: prev.kontenForm.media?.filter(m => m.id !== media.id)
                                  }
                                }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Publish Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Pengaturan Publikasi</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={state.kontenForm.status}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            kontenForm: { ...prev.kontenForm, status: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Review">Review</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <select
                          value={state.kontenForm.kategori}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            kontenForm: { ...prev.kontenForm, kategori: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Artikel">Artikel</option>
                          <option value="Video">Video</option>
                          <option value="Infografis">Infografis</option>
                          <option value="Berita">Berita</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Publikasi</label>
                        <input
                          type="date"
                          value={state.kontenForm.tanggalPublikasi || ''}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            kontenForm: { ...prev.kontenForm, tanggalPublikasi: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Tags</h4>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Tambah tag (tekan Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value && !state.kontenForm.tags.includes(value)) {
                              setState(prev => ({
                                ...prev,
                                kontenForm: {
                                  ...prev.kontenForm,
                                  tags: [...prev.kontenForm.tags, value]
                                }
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      
                      <div className="flex flex-wrap gap-2">
                        {state.kontenForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  kontenForm: {
                                    ...prev.kontenForm,
                                    tags: prev.kontenForm.tags.filter((_, i) => i !== index)
                                  }
                                }));
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Thumbnail</h4>
                    
                    {state.kontenForm.thumbnail ? (
                      <div className="relative">
                        <img
                          src={state.kontenForm.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setState(prev => ({
                            ...prev,
                            kontenForm: { ...prev.kontenForm, thumbnail: undefined }
                          }))}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload thumbnail</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={simpanKonten}
                      disabled={state.isLoading || !state.kontenForm.judul || !state.kontenForm.konten}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{state.isLoading ? 'Menyimpan...' : 'Simpan Konten'}</span>
                    </button>
                    
                    {state.kontenForm.status === 'Draft' && (
                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            kontenForm: { ...prev.kontenForm, status: 'Published' }
                          }));
                          simpanKonten();
                        }}
                        disabled={state.isLoading || !state.kontenForm.judul || !state.kontenForm.konten}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Simpan & Publikasikan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Konten */}
        {state.currentView === 'preview' && state.selectedKonten && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preview Konten</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setState(prev => ({ ...prev, previewMode: 'desktop' }))}
                      className={`px-3 py-1 rounded text-sm ${
                        state.previewMode === 'desktop'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setState(prev => ({ ...prev, previewMode: 'mobile' }))}
                      className={`px-3 py-1 rounded text-sm ${
                        state.previewMode === 'mobile'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                  <button
                    onClick={tampilkanKelolaKonten}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className={`mx-auto bg-white ${
                state.previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
              }`}>
                {/* Article Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {state.selectedKonten.kategori}
                    </span>
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(state.selectedKonten.status)}`}>
                      {state.selectedKonten.status}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {state.selectedKonten.judul}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    <span>Oleh {state.selectedKonten.penulis}</span>
                    <span>•</span>
                    <span>{formatDate(state.selectedKonten.tanggalDibuat)}</span>
                    <span>•</span>
                    <span>{state.selectedKonten.views.toLocaleString()} views</span>
                  </div>
                  
                  {state.selectedKonten.thumbnail && (
                    <img
                      src={state.selectedKonten.thumbnail}
                      alt={state.selectedKonten.judul}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {state.selectedKonten.excerpt}
                  </p>
                </div>

                {/* Article Content */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {state.selectedKonten.konten}
                  </div>
                </div>

                {/* Tags */}
                {state.selectedKonten.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.selectedKonten.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                        <ThumbsUp className="w-5 h-5" />
                        <span>{state.selectedKonten.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                        <Share2 className="w-5 h-5" />
                        <span>{state.selectedKonten.shares}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                        <MessageSquare className="w-5 h-5" />
                        <span>{state.selectedKonten.komentar.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistik Konten */}
        {state.currentView === 'statistik' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Konten</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalKonten}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ThumbsUp className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalLikes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Share2 className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Shares</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalShares}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Komentar</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalKomentar}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views Trend Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Views (7 Hari Terakhir)</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[120, 150, 180, 200, 170, 220, 250].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(value / 250) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">
                        {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Content */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Konten Terpopuler</h3>
                <div className="space-y-4">
                  {state.daftarKonten
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((konten, index) => (
                      <div key={konten.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{konten.judul}</p>
                          <p className="text-sm text-gray-500">{konten.views.toLocaleString()} views</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Content Performance by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performa per Kategori</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Artikel', 'Video', 'Infografis', 'Berita'].map((kategori) => {
                  const kontenKategori = state.daftarKonten.filter(k => k.kategori === kategori);
                  const totalViews = kontenKategori.reduce((sum, k) => sum + k.views, 0);
                  const avgViews = kontenKategori.length > 0 ? Math.round(totalViews / kontenKategori.length) : 0;
                  
                  return (
                    <div key={kategori} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{kategori}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Jumlah:</span>
                          <span className="font-medium">{kontenKategori.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Views:</span>
                          <span className="font-medium">{totalViews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rata-rata:</span>
                          <span className="font-medium">{avgViews.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Moderasi Komentar */}
        {state.currentView === 'moderasi' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Moderasi Komentar</h3>
              <p className="text-sm text-gray-600 mt-1">
                Kelola komentar yang memerlukan persetujuan
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {state.komentarPending.map((komentar) => (
                <div key={komentar.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{komentar.nama}</h4>
                        <span className="text-sm text-gray-500">{komentar.email}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          komentar.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          komentar.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {komentar.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{komentar.konten}</p>
                      
                      <p className="text-sm text-gray-500">
                        {formatDate(komentar.tanggal)}
                      </p>
                    </div>
                    
                    {komentar.status === 'Pending' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => approveKomentar(komentar.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => rejectKomentar(komentar.id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {state.komentarPending.length === 0 && (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada komentar yang perlu dimoderasi</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {state.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus konten ini?</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                Konten akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: false, kontenToDelete: null }))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={state.isLoading}
              >
                Batal
              </button>
              <button
                onClick={hapusKonten}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-900">Memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKonten;