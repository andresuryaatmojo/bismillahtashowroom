import React, { useState, useEffect } from 'react';
import './HalamanKnowledge.css';

// Interface untuk data knowledge
interface DataKnowledge {
  id: string;
  kategori: string;
  pertanyaan: string;
  jawaban: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  confidence: number;
  hitCount: number;
  lastUsed?: string;
  relatedQuestions: string[];
}

// Interface untuk form knowledge
interface FormKnowledge {
  kategori: string;
  pertanyaan: string;
  jawaban: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  relatedQuestions: string[];
}

// Interface untuk pertanyaan tidak terjawab
interface PertanyaanTidakTerjawab {
  id: string;
  pertanyaan: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  context: string;
  frequency: number;
  status: 'pending' | 'processed' | 'ignored';
}

// Interface untuk hasil test chatbot
interface HasilTestChatbot {
  id: string;
  testQuestion: string;
  expectedAnswer: string;
  actualAnswer: string;
  confidence: number;
  isCorrect: boolean;
  timestamp: string;
  responseTime: number;
  knowledgeUsed: string[];
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const HalamanKnowledge: React.FC = () => {
  // State management
  const [dataKnowledge, setDataKnowledge] = useState<DataKnowledge[]>([]);
  const [pertanyaanTidakTerjawab, setPertanyaanTidakTerjawab] = useState<PertanyaanTidakTerjawab[]>([]);
  const [hasilTestChatbot, setHasilTestChatbot] = useState<HasilTestChatbot[]>([]);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  
  const [activeTab, setActiveTab] = useState<'knowledge' | 'unanswered' | 'test'>('knowledge');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<DataKnowledge | null>(null);
  const [formData, setFormData] = useState<FormKnowledge>({
    kategori: '',
    pertanyaan: '',
    jawaban: '',
    tags: [],
    status: 'active',
    prioritas: 'sedang',
    relatedQuestions: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newTag, setNewTag] = useState('');
  const [testQuestion, setTestQuestion] = useState('');

  // Kategori knowledge yang tersedia
  const kategoriOptions = [
    'Produk Mobil', 'Produk Motor', 'Harga & Promo', 'Kredit & Pembiayaan',
    'Layanan Purna Jual', 'Sparepart', 'Asuransi', 'Trade-in', 'Test Drive',
    'Lokasi Dealer', 'Jam Operasional', 'Kontak', 'Umum'
  ];

  // Method: aksesHalamanKelolaKnowledge
  const aksesHalamanKelolaKnowledge = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data knowledge
      const mockKnowledge: DataKnowledge[] = generateMockKnowledge();
      const mockUnanswered: PertanyaanTidakTerjawab[] = generateMockUnanswered();
      
      setDataKnowledge(mockKnowledge);
      setPertanyaanTidakTerjawab(mockUnanswered);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Halaman knowledge berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat data knowledge', 
        success: null 
      });
    }
  };

  // Method: tambahKnowledgeBaru
  const tambahKnowledgeBaru = () => {
    setEditingKnowledge(null);
    setFormData({
      kategori: '',
      pertanyaan: '',
      jawaban: '',
      tags: [],
      status: 'active',
      prioritas: 'sedang',
      relatedQuestions: []
    });
    setShowFormModal(true);
  };

  // Method: inputDataKnowledge
  const inputDataKnowledge = async (dataKnowledge: FormKnowledge) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingKnowledge) {
        // Update existing knowledge
        const updatedKnowledge: DataKnowledge = {
          ...editingKnowledge,
          ...dataKnowledge,
          updatedAt: new Date().toISOString()
        };
        
        setDataKnowledge(prev => 
          prev.map(item => item.id === editingKnowledge.id ? updatedKnowledge : item)
        );
        
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Knowledge berhasil diperbarui' 
        });
      } else {
        // Create new knowledge
        const newKnowledge: DataKnowledge = {
          id: `knowledge-${Date.now()}`,
          ...dataKnowledge,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Admin',
          confidence: 0.95,
          hitCount: 0
        };
        
        setDataKnowledge(prev => [newKnowledge, ...prev]);
        
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Knowledge baru berhasil ditambahkan' 
        });
      }
      
      setShowFormModal(false);
      setEditingKnowledge(null);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyimpan knowledge', 
        success: null 
      });
    }
  };

  // Method: editKnowledgeExisting
  const editKnowledgeExisting = (idKnowledge: string) => {
    const knowledge = dataKnowledge.find(item => item.id === idKnowledge);
    if (knowledge) {
      setEditingKnowledge(knowledge);
      setFormData({
        kategori: knowledge.kategori,
        pertanyaan: knowledge.pertanyaan,
        jawaban: knowledge.jawaban,
        tags: knowledge.tags,
        status: knowledge.status,
        prioritas: knowledge.prioritas,
        relatedQuestions: knowledge.relatedQuestions
      });
      setShowFormModal(true);
    }
  };

  // Method: hapusKnowledge
  const hapusKnowledge = async (idKnowledge: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus knowledge ini?')) {
      return;
    }
    
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDataKnowledge(prev => prev.filter(item => item.id !== idKnowledge));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Knowledge berhasil dihapus' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menghapus knowledge', 
        success: null 
      });
    }
  };

  // Method: lihatHasilUpdate
  const lihatHasilUpdate = () => {
    const recentUpdates = dataKnowledge
      .filter(item => {
        const updateTime = new Date(item.updatedAt).getTime();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return updateTime > oneDayAgo;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    alert(`Ditemukan ${recentUpdates.length} knowledge yang diperbarui dalam 24 jam terakhir`);
  };

  // Method: lihatPertanyaanTidakTerjawab
  const lihatPertanyaanTidakTerjawab = () => {
    setActiveTab('unanswered');
  };

  // Method: testChatbotDenganKnowledgeBaru
  const testChatbotDenganKnowledgeBaru = () => {
    setShowTestModal(true);
  };

  // Method: lihatHasilTest
  const lihatHasilTest = () => {
    setActiveTab('test');
  };

  // Method: lanjutKelolaKnowledge
  const lanjutKelolaKnowledge = () => {
    if (window.confirm('Apakah Anda ingin melanjutkan mengelola knowledge?')) {
      setActiveTab('knowledge');
      setShowFormModal(false);
      setShowTestModal(false);
    }
  };

  // Method: keluarDariHalaman
  const keluarDariHalaman = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari halaman ini?')) {
      // Simulasi navigasi keluar
      window.history.back();
    }
  };

  // Helper function untuk generate mock data
  const generateMockKnowledge = (): DataKnowledge[] => {
    const mockData: DataKnowledge[] = [];
    const sampleQuestions = [
      { kategori: 'Produk Mobil', pertanyaan: 'Apa saja varian Toyota Avanza terbaru?', jawaban: 'Toyota Avanza terbaru tersedia dalam 3 varian: 1.3 E MT, 1.3 G MT, dan 1.3 G AT dengan berbagai fitur unggulan.' },
      { kategori: 'Harga & Promo', pertanyaan: 'Berapa harga Honda Brio?', jawaban: 'Honda Brio tersedia mulai dari Rp 165 juta untuk varian Satya E MT hingga Rp 220 juta untuk varian RS CVT.' },
      { kategori: 'Kredit & Pembiayaan', pertanyaan: 'Bagaimana cara mengajukan kredit mobil?', jawaban: 'Untuk mengajukan kredit mobil, Anda perlu menyiapkan KTP, KK, slip gaji, dan rekening koran 3 bulan terakhir.' },
      { kategori: 'Layanan Purna Jual', pertanyaan: 'Berapa lama garansi mobil baru?', jawaban: 'Garansi mobil baru umumnya 3 tahun atau 100.000 km, tergantung mana yang tercapai lebih dulu.' },
      { kategori: 'Test Drive', pertanyaan: 'Bagaimana cara booking test drive?', jawaban: 'Test drive dapat dibooking melalui website, telepon, atau datang langsung ke showroom dengan membawa SIM yang masih berlaku.' }
    ];
    
    sampleQuestions.forEach((item, index) => {
      mockData.push({
        id: `knowledge-${index + 1}`,
        kategori: item.kategori,
        pertanyaan: item.pertanyaan,
        jawaban: item.jawaban,
        tags: ['mobil', 'informasi', 'customer'],
        status: ['active', 'inactive', 'draft'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'draft',
        prioritas: ['tinggi', 'sedang', 'rendah'][Math.floor(Math.random() * 3)] as 'tinggi' | 'sedang' | 'rendah',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: ['Admin', 'Manager', 'Staff'][Math.floor(Math.random() * 3)],
        confidence: 0.8 + Math.random() * 0.2,
        hitCount: Math.floor(Math.random() * 100),
        lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        relatedQuestions: ['Pertanyaan terkait 1', 'Pertanyaan terkait 2']
      });
    });
    
    return mockData;
  };

  const generateMockUnanswered = (): PertanyaanTidakTerjawab[] => {
    const mockUnanswered: PertanyaanTidakTerjawab[] = [];
    const sampleUnanswered = [
      'Apakah ada diskon untuk pembelian cash?',
      'Bagaimana cara tukar tambah motor lama?',
      'Berapa biaya perawatan rutin per tahun?',
      'Apakah tersedia warna khusus untuk model tertentu?'
    ];
    
    sampleUnanswered.forEach((pertanyaan, index) => {
      mockUnanswered.push({
        id: `unanswered-${index + 1}`,
        pertanyaan,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        sessionId: `session-${Math.floor(Math.random() * 10000)}`,
        context: 'Chat dengan customer',
        frequency: Math.floor(Math.random() * 10) + 1,
        status: ['pending', 'processed', 'ignored'][Math.floor(Math.random() * 3)] as 'pending' | 'processed' | 'ignored'
      });
    });
    
    return mockUnanswered;
  };

  // Handler functions
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputDataKnowledge(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTestChatbot = async () => {
    if (!testQuestion.trim()) return;
    
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi test chatbot
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const testResult: HasilTestChatbot = {
        id: `test-${Date.now()}`,
        testQuestion: testQuestion,
        expectedAnswer: 'Jawaban yang diharapkan',
        actualAnswer: 'Jawaban dari chatbot berdasarkan knowledge base',
        confidence: 0.85 + Math.random() * 0.15,
        isCorrect: Math.random() > 0.2,
        timestamp: new Date().toISOString(),
        responseTime: Math.random() * 2000 + 500,
        knowledgeUsed: ['knowledge-1', 'knowledge-2']
      };
      
      setHasilTestChatbot(prev => [testResult, ...prev]);
      setTestQuestion('');
      setShowTestModal(false);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Test chatbot berhasil dilakukan' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal melakukan test chatbot', 
        success: null 
      });
    }
  };

  // Helper functions
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
      case 'active': return '#28a745';
      case 'inactive': return '#6c757d';
      case 'draft': return '#ffc107';
      case 'pending': return '#17a2b8';
      case 'processed': return '#28a745';
      case 'ignored': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPrioritasColor = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi': return '#dc3545';
      case 'sedang': return '#ffc107';
      case 'rendah': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Filter data
  const filteredKnowledge = dataKnowledge.filter(item => {
    const matchSearch = item.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.jawaban.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchKategori = !filterKategori || item.kategori === filterKategori;
    const matchStatus = !filterStatus || item.status === filterStatus;
    
    return matchSearch && matchKategori && matchStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKnowledge.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKnowledge.length / itemsPerPage);

  // Effects
  useEffect(() => {
    aksesHalamanKelolaKnowledge();
  }, []);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="halaman-knowledge">
      <div className="header-section">
        <div className="header-content">
          <h1>Kelola Knowledge Base</h1>
          <p>Manajemen pengetahuan untuk chatbot customer service</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={lihatHasilUpdate}>
            <i className="fas fa-history"></i>
            Lihat Update
          </button>
          <button className="btn-primary" onClick={tambahKnowledgeBaru}>
            <i className="fas fa-plus"></i>
            Tambah Knowledge
          </button>
          <button className="btn-test" onClick={testChatbotDenganKnowledgeBaru}>
            <i className="fas fa-robot"></i>
            Test Chatbot
          </button>
          <button className="btn-exit" onClick={keluarDariHalaman}>
            <i className="fas fa-sign-out-alt"></i>
            Keluar
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
          className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <i className="fas fa-brain"></i>
          Knowledge Base ({dataKnowledge.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unanswered' ? 'active' : ''}`}
          onClick={() => lihatPertanyaanTidakTerjawab()}
        >
          <i className="fas fa-question-circle"></i>
          Pertanyaan Tidak Terjawab ({pertanyaanTidakTerjawab.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => lihatHasilTest()}
        >
          <i className="fas fa-flask"></i>
          Hasil Test ({hasilTestChatbot.length})
        </button>
      </div>

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memproses data knowledge...</p>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && !statusHalaman.loading && (
        <div className="knowledge-content">
          {/* Filter Section */}
          <div className="filter-section">
            <div className="search-group">
              <div className="search-input">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Cari pertanyaan, jawaban, atau tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-controls">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {kategoriOptions.map(kategori => (
                  <option key={kategori} value={kategori}>{kategori}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div className="stat-content">
                <h3>{dataKnowledge.length}</h3>
                <p>Total Knowledge</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{dataKnowledge.filter(k => k.status === 'active').length}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{pertanyaanTidakTerjawab.filter(p => p.status === 'pending').length}</h3>
                <p>Pending Questions</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3>{Math.round(dataKnowledge.reduce((acc, k) => acc + k.confidence, 0) / dataKnowledge.length * 100)}%</h3>
                <p>Avg Confidence</p>
              </div>
            </div>
          </div>

          {/* Knowledge List */}
          <div className="knowledge-list">
            {currentItems.map(knowledge => (
              <div key={knowledge.id} className="knowledge-card">
                <div className="card-header">
                  <div className="knowledge-info">
                    <div className="knowledge-category">
                      <span className="category-badge">{knowledge.kategori}</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(knowledge.status) }}
                      >
                        {knowledge.status}
                      </span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPrioritasColor(knowledge.prioritas) }}
                      >
                        {knowledge.prioritas}
                      </span>
                    </div>
                    <div className="knowledge-stats">
                      <span className="confidence">
                        <i className="fas fa-percentage"></i>
                        {Math.round(knowledge.confidence * 100)}%
                      </span>
                      <span className="hit-count">
                        <i className="fas fa-eye"></i>
                        {knowledge.hitCount}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => editKnowledgeExisting(knowledge.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => hapusKnowledge(knowledge.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="question-section">
                    <h4>Pertanyaan:</h4>
                    <p>{knowledge.pertanyaan}</p>
                  </div>
                  
                  <div className="answer-section">
                    <h4>Jawaban:</h4>
                    <p>{knowledge.jawaban}</p>
                  </div>
                  
                  <div className="tags-section">
                    <h4>Tags:</h4>
                    <div className="tags-list">
                      {knowledge.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="meta-info">
                    <div className="meta-item">
                      <span>Dibuat:</span>
                      <strong>{formatDate(knowledge.createdAt)} oleh {knowledge.createdBy}</strong>
                    </div>
                    <div className="meta-item">
                      <span>Diperbarui:</span>
                      <strong>{formatDate(knowledge.updatedAt)}</strong>
                    </div>
                    {knowledge.lastUsed && (
                      <div className="meta-item">
                        <span>Terakhir digunakan:</span>
                        <strong>{formatDate(knowledge.lastUsed)}</strong>
                      </div>
                    )}
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="btn-page"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unanswered Questions Tab */}
      {activeTab === 'unanswered' && !statusHalaman.loading && (
        <div className="unanswered-content">
          <div className="unanswered-header">
            <h2>Pertanyaan Tidak Terjawab</h2>
            <p>Daftar pertanyaan dari customer yang belum memiliki jawaban di knowledge base</p>
          </div>
          
          <div className="unanswered-list">
            {pertanyaanTidakTerjawab.map(item => (
              <div key={item.id} className="unanswered-card">
                <div className="card-header">
                  <div className="question-info">
                    <h4>{item.pertanyaan}</h4>
                    <div className="question-meta">
                      <span>Frequency: {item.frequency}x</span>
                      <span>User: {item.userId}</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                </div>
                
                <div className="card-content">
                  <p><strong>Context:</strong> {item.context}</p>
                  <p><strong>Session ID:</strong> {item.sessionId}</p>
                </div>
                
                <div className="card-actions">
                  <button className="btn-primary" onClick={tambahKnowledgeBaru}>
                    <i className="fas fa-plus"></i>
                    Buat Knowledge
                  </button>
                  <button className="btn-secondary">
                    <i className="fas fa-check"></i>
                    Mark Processed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results Tab */}
      {activeTab === 'test' && !statusHalaman.loading && (
        <div className="test-content">
          <div className="test-header">
            <h2>Hasil Test Chatbot</h2>
            <p>Riwayat pengujian chatbot dengan knowledge base terbaru</p>
          </div>
          
          <div className="test-list">
            {hasilTestChatbot.map(test => (
              <div key={test.id} className="test-card">
                <div className="card-header">
                  <div className="test-info">
                    <h4>Test Question: {test.testQuestion}</h4>
                    <div className="test-meta">
                      <span className={`result-badge ${test.isCorrect ? 'correct' : 'incorrect'}`}>
                        {test.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span>Confidence: {Math.round(test.confidence * 100)}%</span>
                      <span>Response Time: {Math.round(test.responseTime)}ms</span>
                    </div>
                  </div>
                  <span className="test-date">{formatDate(test.timestamp)}</span>
                </div>
                
                <div className="card-content">
                  <div className="answer-comparison">
                    <div className="expected-answer">
                      <h5>Expected Answer:</h5>
                      <p>{test.expectedAnswer}</p>
                    </div>
                    <div className="actual-answer">
                      <h5>Actual Answer:</h5>
                      <p>{test.actualAnswer}</p>
                    </div>
                  </div>
                  
                  <div className="knowledge-used">
                    <h5>Knowledge Used:</h5>
                    <div className="knowledge-tags">
                      {test.knowledgeUsed.map(knowledgeId => (
                        <span key={knowledgeId} className="knowledge-tag">{knowledgeId}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingKnowledge ? 'Edit Knowledge' : 'Tambah Knowledge Baru'}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowFormModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriOptions.map(kategori => (
                      <option key={kategori} value={kategori}>{kategori}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'draft' }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Prioritas</label>
                  <select
                    value={formData.prioritas}
                    onChange={(e) => setFormData(prev => ({ ...prev, prioritas: e.target.value as 'tinggi' | 'sedang' | 'rendah' }))}
                  >
                    <option value="tinggi">Tinggi</option>
                    <option value="sedang">Sedang</option>
                    <option value="rendah">Rendah</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Pertanyaan *</label>
                <textarea
                  value={formData.pertanyaan}
                  onChange={(e) => setFormData(prev => ({ ...prev, pertanyaan: e.target.value }))}
                  placeholder="Masukkan pertanyaan yang sering ditanyakan customer..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Jawaban *</label>
                <textarea
                  value={formData.jawaban}
                  onChange={(e) => setFormData(prev => ({ ...prev, jawaban: e.target.value }))}
                  placeholder="Masukkan jawaban yang akurat dan informatif..."
                  rows={5}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <div className="current-tags">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="add-tag">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Tambah tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" onClick={handleAddTag}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="modal-actions">
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
                onClick={handleFormSubmit}
                disabled={statusHalaman.loading}
              >
                <i className="fas fa-save"></i>
                {editingKnowledge ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Test Chatbot</h2>
              <button 
                className="btn-close"
                onClick={() => setShowTestModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Pertanyaan Test</label>
                <textarea
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Masukkan pertanyaan untuk menguji chatbot..."
                  rows={4}
                />
              </div>
              
              <p className="test-info">
                <i className="fas fa-info-circle"></i>
                Chatbot akan mencari jawaban berdasarkan knowledge base yang tersedia dan memberikan confidence score.
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowTestModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-primary"
                onClick={handleTestChatbot}
                disabled={!testQuestion.trim() || statusHalaman.loading}
              >
                <i className="fas fa-play"></i>
                Jalankan Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKnowledge;