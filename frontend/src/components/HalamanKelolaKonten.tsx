import React, { useState, useEffect } from 'react';
import './HalamanKelolaKonten.css';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { FileText, Plus, Edit, Trash2, X, Tag } from 'lucide-react';

// Interface untuk data konten
interface DataKonten {
  id: string;
  judul: string;
  kategori: 'artikel' | 'berita' | 'promosi' | 'panduan';
  konten: string;
  gambar: string;
  status: 'draft' | 'published' | 'archived';
  tanggalBuat: string;
  tanggalUpdate: string;
  penulis: string;
  tampilan: number;
  suka: number;
  tags: string[];
}

// Interface untuk form konten
interface FormKonten {
  judul: string;
  kategori: 'artikel' | 'berita' | 'promosi' | 'panduan';
  konten: string;
  gambar: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Interface untuk filter
interface FilterKonten {
  kategori: string;
  status: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  penulis: string;
}

const HalamanKelolaKonten: React.FC = () => {
  // State management
  const [daftarKonten, setDaftarKonten] = useState<DataKonten[]>([]);
  const [filteredKonten, setFilteredKonten] = useState<DataKonten[]>([]);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  const [showFormKonten, setShowFormKonten] = useState(false);
  const [editingKonten, setEditingKonten] = useState<DataKonten | null>(null);
  const [formData, setFormData] = useState<FormKonten>({
    judul: '',
    kategori: 'artikel',
    konten: '',
    gambar: '',
    status: 'draft',
    tags: []
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kontenToDelete, setKontenToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterKonten>({
    kategori: '',
    status: '',
    tanggalMulai: '',
    tanggalAkhir: '',
    penulis: ''
  });
  const [currentTag, setCurrentTag] = useState('');

  // Method: aksesHalamanKelolaKonten
  const aksesHalamanKelolaKonten = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi loading data konten
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data tiruan konten
      const mockKonten: DataKonten[] = [
        {
          id: 'konten-001',
          judul: 'Tips Memilih Mobil Bekas Berkualitas',
          kategori: 'panduan',
          konten: 'Panduan lengkap untuk memilih mobil bekas yang berkualitas dan sesuai kebutuhan...',
          gambar: '/images/tips-mobil-bekas.jpg',
          status: 'published',
          tanggalBuat: '2024-01-15',
          tanggalUpdate: '2024-01-20',
          penulis: 'Admin Mobilindo',
          tampilan: 1250,
          suka: 89,
          tags: ['tips', 'mobil bekas', 'panduan']
        },
        {
          id: 'konten-002',
          judul: 'Promo Spesial Akhir Tahun 2024',
          kategori: 'promosi',
          konten: 'Dapatkan diskon hingga 50 juta untuk pembelian mobil baru di akhir tahun...',
          gambar: '/images/promo-akhir-tahun.jpg',
          status: 'published',
          tanggalBuat: '2024-12-01',
          tanggalUpdate: '2024-12-05',
          penulis: 'Marketing Team',
          tampilan: 2100,
          suka: 156,
          tags: ['promo', 'diskon', 'akhir tahun']
        },
        {
          id: 'konten-003',
          judul: 'Peluncuran Model Terbaru Toyota 2025',
          kategori: 'berita',
          konten: 'Toyota meluncurkan model terbaru dengan teknologi hybrid terdepan...',
          gambar: '/images/toyota-2025.jpg',
          status: 'draft',
          tanggalBuat: '2024-12-10',
          tanggalUpdate: '2024-12-10',
          penulis: 'Content Writer',
          tampilan: 0,
          suka: 0,
          tags: ['toyota', 'model baru', 'hybrid']
        },
        {
          id: 'konten-004',
          judul: 'Cara Merawat Mesin Mobil Agar Awet',
          kategori: 'artikel',
          konten: 'Tips dan trik merawat mesin mobil agar tetap prima dan tahan lama...',
          gambar: '/images/perawatan-mesin.jpg',
          status: 'published',
          tanggalBuat: '2024-11-20',
          tanggalUpdate: '2024-11-25',
          penulis: 'Teknisi Ahli',
          tampilan: 890,
          suka: 67,
          tags: ['perawatan', 'mesin', 'tips']
        },
        {
          id: 'konten-005',
          judul: 'Event Test Drive Gratis Bulan Ini',
          kategori: 'promosi',
          konten: 'Ikuti event test drive gratis dan dapatkan voucher menarik...',
          gambar: '/images/test-drive-event.jpg',
          status: 'archived',
          tanggalBuat: '2024-10-15',
          tanggalUpdate: '2024-11-01',
          penulis: 'Event Coordinator',
          tampilan: 1500,
          suka: 120,
          tags: ['test drive', 'event', 'voucher']
        }
      ];

      setDaftarKonten(mockKonten);
      setFilteredKonten(mockKonten);
      setStatusHalaman({ loading: false, error: null, success: 'Data konten berhasil dimuat' });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat data konten', 
        success: null 
      });
    }
  };

  // Method: buatKontenBaru
  const buatKontenBaru = () => {
    setEditingKonten(null);
    setFormData({
      judul: '',
      kategori: 'artikel',
      konten: '',
      gambar: '',
      status: 'draft',
      tags: []
    });
    setShowFormKonten(true);
  };

  // Method: isiFormKonten
  const isiFormKonten = (dataKonten: Partial<FormKonten>) => {
    setFormData(prev => ({
      ...prev,
      ...dataKonten
    }));
  };

  // Method: pilihKontenUntukEdit
  const pilihKontenUntukEdit = (idKonten: string) => {
    const konten = daftarKonten.find(k => k.id === idKonten);
    if (konten) {
      setEditingKonten(konten);
      setFormData({
        judul: konten.judul,
        kategori: konten.kategori,
        konten: konten.konten,
        gambar: konten.gambar,
        status: konten.status,
        tags: konten.tags
      });
      setShowFormKonten(true);
    }
  };

  // Method: ubahDataKonten
  const ubahDataKonten = async (dataKontenBaru: FormKonten) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingKonten) {
        // Update konten yang sudah ada
        const updatedKonten: DataKonten = {
          ...editingKonten,
          ...dataKontenBaru,
          tanggalUpdate: new Date().toISOString().split('T')[0]
        };
        
        setDaftarKonten(prev => 
          prev.map(k => k.id === editingKonten.id ? updatedKonten : k)
        );
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Konten berhasil diperbarui' 
        });
      } else {
        // Buat konten baru
        const newKonten: DataKonten = {
          id: `konten-${Date.now()}`,
          ...dataKontenBaru,
          tanggalBuat: new Date().toISOString().split('T')[0],
          tanggalUpdate: new Date().toISOString().split('T')[0],
          penulis: 'Current User',
          tampilan: 0,
          suka: 0
        };
        
        setDaftarKonten(prev => [newKonten, ...prev]);
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Konten baru berhasil dibuat' 
        });
      }
      
      setShowFormKonten(false);
      setEditingKonten(null);
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyimpan konten', 
        success: null 
      });
    }
  };

  // Method: pilihKontenUntukHapus
  const pilihKontenUntukHapus = (idKonten: string) => {
    setKontenToDelete(idKonten);
    setShowDeleteModal(true);
  };

  // Method: konfirmasiPenghapusan
  const konfirmasiPenghapusan = async (idKonten: string) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDaftarKonten(prev => prev.filter(k => k.id !== idKonten));
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Konten berhasil dihapus' 
      });
      setShowDeleteModal(false);
      setKontenToDelete(null);
      applyFilters();
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menghapus konten', 
        success: null 
      });
    }
  };

  // Helper functions
  const applyFilters = () => {
    let filtered = daftarKonten;

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter(konten =>
        konten.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        konten.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        konten.penulis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan kategori
    if (filter.kategori) {
      filtered = filtered.filter(konten => konten.kategori === filter.kategori);
    }

    // Filter berdasarkan status
    if (filter.status) {
      filtered = filtered.filter(konten => konten.status === filter.status);
    }

    // Filter berdasarkan penulis
    if (filter.penulis) {
      filtered = filtered.filter(konten =>
        konten.penulis.toLowerCase().includes(filter.penulis.toLowerCase())
      );
    }

    // Filter berdasarkan tanggal
    if (filter.tanggalMulai) {
      filtered = filtered.filter(konten => konten.tanggalBuat >= filter.tanggalMulai);
    }
    if (filter.tanggalAkhir) {
      filtered = filtered.filter(konten => konten.tanggalBuat <= filter.tanggalAkhir);
    }

    setFilteredKonten(filtered);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    ubahDataKonten(formData);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#28a745';
      case 'draft': return '#ffc107';
      case 'archived': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case 'artikel': return '#007bff';
      case 'berita': return '#28a745';
      case 'promosi': return '#dc3545';
      case 'panduan': return '#17a2b8';
      default: return '#6c757d';
    }
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
    aksesHalamanKelolaKonten();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filter, daftarKonten]);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="halaman-kelola-konten">
      <div className="header-section">
        <div className="header-content">
          <h1>Kelola Konten</h1>
          <p>Kelola artikel, berita, promosi, dan panduan untuk website</p>
        </div>
        <Button 
          onClick={buatKontenBaru}
          disabled={statusHalaman.loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Konten Baru
        </Button>
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
            placeholder="Cari konten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filter.kategori}
            onChange={(e) => setFilter(prev => ({ ...prev, kategori: e.target.value }))}
          >
            <option value="">Semua Kategori</option>
            <option value="artikel">Artikel</option>
            <option value="berita">Berita</option>
            <option value="promosi">Promosi</option>
            <option value="panduan">Panduan</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          
          <input
            type="text"
            placeholder="Filter penulis..."
            value={filter.penulis}
            onChange={(e) => setFilter(prev => ({ ...prev, penulis: e.target.value }))}
          />
        </div>
      </div>

      {/* Statistik */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarKonten.length)}</h3>
            <p>Total Konten</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon published">
            <i className="fas fa-eye"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarKonten.filter(k => k.status === 'published').length)}</h3>
            <p>Published</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon draft">
            <i className="fas fa-edit"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarKonten.filter(k => k.status === 'draft').length)}</h3>
            <p>Draft</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon archived">
            <i className="fas fa-archive"></i>
          </div>
          <div className="stat-content">
            <h3>{formatNumber(daftarKonten.filter(k => k.status === 'archived').length)}</h3>
            <p>Archived</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat data konten...</p>
        </div>
      )}

      {/* Daftar Konten */}
      {!statusHalaman.loading && (
        <div className="konten-grid">
          {filteredKonten.map(konten => (
            <div key={konten.id} className="konten-card">
              <div className="konten-image">
                <img src={konten.gambar} alt={konten.judul} />
                <div className="konten-badges">
                  <span 
                    className="badge kategori"
                    style={{ backgroundColor: getKategoriColor(konten.kategori) }}
                  >
                    {konten.kategori}
                  </span>
                  <span 
                    className="badge status"
                    style={{ backgroundColor: getStatusColor(konten.status) }}
                  >
                    {konten.status}
                  </span>
                </div>
              </div>
              
              <div className="konten-content">
                <h3>{konten.judul}</h3>
                <p className="konten-excerpt">
                  {konten.konten.substring(0, 100)}...
                </p>
                
                <div className="konten-meta">
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    <span>{konten.penulis}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(konten.tanggalUpdate)}</span>
                  </div>
                </div>
                
                <div className="konten-stats">
                  <div className="stat-item">
                    <i className="fas fa-eye"></i>
                    <span>{formatNumber(konten.tampilan)}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-heart"></i>
                    <span>{formatNumber(konten.suka)}</span>
                  </div>
                </div>
                
                <div className="konten-tags">
                  {konten.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                
                <div className="konten-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => pilihKontenUntukEdit(konten.id)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => pilihKontenUntukHapus(konten.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!statusHalaman.loading && filteredKonten.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-file-alt"></i>
          <h3>Tidak ada konten ditemukan</h3>
          <p>Belum ada konten yang sesuai dengan filter yang dipilih</p>
          <button className="btn-primary" onClick={buatKontenBaru}>
            Buat Konten Pertama
          </button>
        </div>
      )}

      {/* Modal Form Konten */}
      {showFormKonten && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingKonten ? 'Edit Konten' : 'Buat Konten Baru'}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowFormKonten(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="konten-form">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Informasi Konten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="judul">Judul Konten *</Label>
                      <Input
                        id="judul"
                        type="text"
                        value={formData.judul}
                        onChange={(e) => isiFormKonten({ judul: e.target.value })}
                        required
                        placeholder="Masukkan judul konten"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori *</Label>
                      <Select
                        value={formData.kategori}
                        onValueChange={(value) => isiFormKonten({ kategori: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="artikel">Artikel</SelectItem>
                          <SelectItem value="berita">Berita</SelectItem>
                          <SelectItem value="promosi">Promosi</SelectItem>
                          <SelectItem value="panduan">Panduan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gambar">URL Gambar</Label>
                    <Input
                      id="gambar"
                      type="url"
                      value={formData.gambar}
                      onChange={(e) => isiFormKonten({ gambar: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="konten">Konten *</Label>
                    <Textarea
                      id="konten"
                      value={formData.konten}
                      onChange={(e) => isiFormKonten({ konten: e.target.value })}
                      required
                      rows={10}
                      placeholder="Tulis konten di sini..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => isiFormKonten({ status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Tambah tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Tambah
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFormKonten(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={statusHalaman.loading}
                >
                  {statusHalaman.loading ? 'Menyimpan...' : (editingKonten ? 'Update Konten' : 'Simpan Konten')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Konfirmasi Penghapusan</h2>
            </div>
            
            <div className="modal-body">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p>Apakah Anda yakin ingin menghapus konten ini?</p>
              <p className="warning-text">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            
            <div className="modal-actions">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </Button>
              <Button 
                variant="destructive"
                onClick={() => kontenToDelete && konfirmasiPenghapusan(kontenToDelete)}
                disabled={statusHalaman.loading}
              >
                {statusHalaman.loading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKelolaKonten;