import React, { useState, useEffect } from 'react';
import './HalamanStrategis.css';

// Interfaces
interface PerencanaanBisnis {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: 'jangka-pendek' | 'jangka-menengah' | 'jangka-panjang';
  status: 'draft' | 'review' | 'approved' | 'active' | 'completed';
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  targetDate: string;
  progress: number;
  pic: string;
  budget: number;
  roi: number;
  risiko: string[];
  milestone: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  nama: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
}

interface Kebijakan {
  id: string;
  nama: string;
  kategori: 'operasional' | 'keuangan' | 'sdm' | 'marketing' | 'teknologi';
  deskripsi: string;
  status: 'draft' | 'review' | 'approved' | 'active' | 'archived';
  versi: string;
  tanggalBerlaku: string;
  tanggalExpired: string;
  dokumen: string;
  approver: string;
  dampak: 'rendah' | 'sedang' | 'tinggi';
  compliance: number;
  createdAt: string;
  updatedAt: string;
}

interface AnalisisStrategis {
  id: string;
  judul: string;
  tipe: 'swot' | 'pestel' | 'porter' | 'bcg' | 'ansoff';
  deskripsi: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  hasil: any;
  rekomendasi: string[];
  tanggalAnalisis: string;
  analyst: string;
  validUntil: string;
  confidence: number;
  createdAt: string;
}

interface StandarKualitas {
  id: string;
  nama: string;
  kategori: 'produk' | 'layanan' | 'proses' | 'sistem';
  standar: string;
  deskripsi: string;
  status: 'draft' | 'active' | 'review' | 'archived';
  compliance: number;
  lastAudit: string;
  nextAudit: string;
  sertifikasi: string[];
  pic: string;
  dokumen: string[];
  createdAt: string;
  updatedAt: string;
}

interface StatusHalaman {
  currentView: 'menu' | 'perencanaan' | 'kebijakan' | 'analisis' | 'kualitas';
  loading: boolean;
  error: string | null;
  success: string | null;
}

const HalamanStrategis: React.FC = () => {
  // State Management
  const [status, setStatus] = useState<StatusHalaman>({
    currentView: 'menu',
    loading: false,
    error: null,
    success: null
  });

  const [perencanaanData, setPerencanaanData] = useState<PerencanaanBisnis[]>([]);
  const [kebijakanData, setKebijakanData] = useState<Kebijakan[]>([]);
  const [analisisData, setAnalisisData] = useState<AnalisisStrategis[]>([]);
  const [kualitasData, setKualitasData] = useState<StandarKualitas[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'detail' | 'form' | 'confirm'>('detail');

  // Methods Implementation
  const aksesHalamanManajemenStrategis = async (): Promise<void> => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockPerencanaan = generateMockPerencanaan();
      const mockKebijakan = generateMockKebijakan();
      const mockAnalisis = generateMockAnalisis();
      const mockKualitas = generateMockKualitas();
      
      setPerencanaanData(mockPerencanaan);
      setKebijakanData(mockKebijakan);
      setAnalisisData(mockAnalisis);
      setKualitasData(mockKualitas);
      
      setStatus(prev => ({ 
        ...prev, 
        loading: false, 
        currentView: 'menu',
        success: 'Data manajemen strategis berhasil dimuat'
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);
      
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Gagal memuat data manajemen strategis'
      }));
    }
  };

  const pilihPerencanaanBisnis = (): void => {
    setStatus(prev => ({ ...prev, currentView: 'perencanaan' }));
  };

  const pilihKelolaKebijakan = (): void => {
    setStatus(prev => ({ ...prev, currentView: 'kebijakan' }));
  };

  const pilihAnalisisStrategis = (): void => {
    setStatus(prev => ({ ...prev, currentView: 'analisis' }));
  };

  const pilihStandarKualitas = (): void => {
    setStatus(prev => ({ ...prev, currentView: 'kualitas' }));
  };

  // Helper Functions
  const generateMockPerencanaan = (): PerencanaanBisnis[] => {
    return [
      {
        id: '1',
        judul: 'Ekspansi Pasar Regional',
        deskripsi: 'Rencana ekspansi ke 5 kota besar di Indonesia',
        kategori: 'jangka-menengah',
        status: 'active',
        prioritas: 'tinggi',
        targetDate: '2024-12-31',
        progress: 65,
        pic: 'John Doe',
        budget: 5000000000,
        roi: 25.5,
        risiko: ['Kompetisi ketat', 'Regulasi daerah', 'Modal kerja'],
        milestone: [
          { id: '1', nama: 'Riset Pasar', targetDate: '2024-03-31', status: 'completed', progress: 100 },
          { id: '2', nama: 'Setup Cabang', targetDate: '2024-06-30', status: 'in-progress', progress: 70 },
          { id: '3', nama: 'Launch Marketing', targetDate: '2024-09-30', status: 'pending', progress: 0 }
        ],
        createdAt: '2024-01-15',
        updatedAt: '2024-02-20'
      },
      {
        id: '2',
        judul: 'Digital Transformation',
        deskripsi: 'Implementasi sistem digital terintegrasi',
        kategori: 'jangka-panjang',
        status: 'review',
        prioritas: 'kritis',
        targetDate: '2025-06-30',
        progress: 30,
        pic: 'Jane Smith',
        budget: 8000000000,
        roi: 35.2,
        risiko: ['Resistensi perubahan', 'Kompleksitas teknis', 'Budget overrun'],
        milestone: [
          { id: '1', nama: 'Assessment Current State', targetDate: '2024-04-30', status: 'completed', progress: 100 },
          { id: '2', nama: 'System Design', targetDate: '2024-07-31', status: 'in-progress', progress: 45 },
          { id: '3', nama: 'Implementation Phase 1', targetDate: '2024-12-31', status: 'pending', progress: 0 }
        ],
        createdAt: '2024-01-10',
        updatedAt: '2024-02-18'
      },
      {
        id: '3',
        judul: 'Optimasi Supply Chain',
        deskripsi: 'Peningkatan efisiensi rantai pasok',
        kategori: 'jangka-pendek',
        status: 'approved',
        prioritas: 'sedang',
        targetDate: '2024-08-31',
        progress: 85,
        pic: 'Bob Wilson',
        budget: 2500000000,
        roi: 18.7,
        risiko: ['Gangguan supplier', 'Fluktuasi harga', 'Logistik'],
        milestone: [
          { id: '1', nama: 'Vendor Assessment', targetDate: '2024-03-15', status: 'completed', progress: 100 },
          { id: '2', nama: 'Process Optimization', targetDate: '2024-06-15', status: 'completed', progress: 100 },
          { id: '3', nama: 'System Integration', targetDate: '2024-08-31', status: 'in-progress', progress: 60 }
        ],
        createdAt: '2024-01-05',
        updatedAt: '2024-02-22'
      }
    ];
  };

  const generateMockKebijakan = (): Kebijakan[] => {
    return [
      {
        id: '1',
        nama: 'Kebijakan Keselamatan Kerja',
        kategori: 'operasional',
        deskripsi: 'Standar keselamatan dan kesehatan kerja di seluruh unit',
        status: 'active',
        versi: '2.1',
        tanggalBerlaku: '2024-01-01',
        tanggalExpired: '2025-12-31',
        dokumen: 'K3-Policy-v2.1.pdf',
        approver: 'CEO',
        dampak: 'tinggi',
        compliance: 95,
        createdAt: '2023-12-15',
        updatedAt: '2024-01-01'
      },
      {
        id: '2',
        nama: 'Kebijakan Pengelolaan Keuangan',
        kategori: 'keuangan',
        deskripsi: 'Aturan pengelolaan dan pelaporan keuangan perusahaan',
        status: 'review',
        versi: '3.0',
        tanggalBerlaku: '2024-04-01',
        tanggalExpired: '2026-03-31',
        dokumen: 'Finance-Policy-v3.0.pdf',
        approver: 'CFO',
        dampak: 'tinggi',
        compliance: 88,
        createdAt: '2024-01-20',
        updatedAt: '2024-02-15'
      },
      {
        id: '3',
        nama: 'Kebijakan Pengembangan SDM',
        kategori: 'sdm',
        deskripsi: 'Panduan pengembangan dan pelatihan karyawan',
        status: 'active',
        versi: '1.5',
        tanggalBerlaku: '2024-02-01',
        tanggalExpired: '2025-01-31',
        dokumen: 'HR-Development-v1.5.pdf',
        approver: 'CHRO',
        dampak: 'sedang',
        compliance: 92,
        createdAt: '2024-01-10',
        updatedAt: '2024-02-01'
      }
    ];
  };

  const generateMockAnalisis = (): AnalisisStrategis[] => {
    return [
      {
        id: '1',
        judul: 'SWOT Analysis Q1 2024',
        tipe: 'swot',
        deskripsi: 'Analisis kekuatan, kelemahan, peluang, dan ancaman',
        status: 'completed',
        hasil: {
          strengths: ['Brand recognition', 'Strong distribution', 'Quality products'],
          weaknesses: ['High operational cost', 'Limited digital presence'],
          opportunities: ['Market expansion', 'Digital transformation', 'New segments'],
          threats: ['Economic uncertainty', 'New competitors', 'Regulatory changes']
        },
        rekomendasi: [
          'Fokus pada digitalisasi untuk mengurangi biaya operasional',
          'Manfaatkan brand recognition untuk ekspansi pasar',
          'Investasi dalam teknologi untuk meningkatkan efisiensi'
        ],
        tanggalAnalisis: '2024-02-15',
        analyst: 'Strategic Planning Team',
        validUntil: '2024-05-15',
        confidence: 85,
        createdAt: '2024-02-10'
      },
      {
        id: '2',
        judul: 'Porter Five Forces Analysis',
        tipe: 'porter',
        deskripsi: 'Analisis daya saing industri otomotif',
        status: 'in-progress',
        hasil: {
          buyerPower: 'Medium',
          supplierPower: 'High',
          threatOfSubstitutes: 'Low',
          threatOfNewEntrants: 'Medium',
          competitiveRivalry: 'High'
        },
        rekomendasi: [
          'Diversifikasi supplier untuk mengurangi ketergantungan',
          'Strengthening customer loyalty programs',
          'Innovation in product differentiation'
        ],
        tanggalAnalisis: '2024-02-20',
        analyst: 'Market Research Team',
        validUntil: '2024-08-20',
        confidence: 78,
        createdAt: '2024-02-18'
      },
      {
        id: '3',
        judul: 'PESTEL Analysis 2024',
        tipe: 'pestel',
        deskripsi: 'Analisis faktor eksternal makro',
        status: 'completed',
        hasil: {
          political: 'Stable government policies',
          economic: 'Moderate growth expected',
          social: 'Changing consumer preferences',
          technological: 'Rapid digital adoption',
          environmental: 'Increasing sustainability focus',
          legal: 'New regulations on emissions'
        },
        rekomendasi: [
          'Investasi dalam teknologi ramah lingkungan',
          'Adaptasi produk sesuai tren konsumen',
          'Compliance dengan regulasi baru'
        ],
        tanggalAnalisis: '2024-01-30',
        analyst: 'External Affairs Team',
        validUntil: '2024-07-30',
        confidence: 90,
        createdAt: '2024-01-25'
      }
    ];
  };

  const generateMockKualitas = (): StandarKualitas[] => {
    return [
      {
        id: '1',
        nama: 'ISO 9001:2015',
        kategori: 'sistem',
        standar: 'ISO 9001:2015',
        deskripsi: 'Sistem manajemen kualitas',
        status: 'active',
        compliance: 96,
        lastAudit: '2024-01-15',
        nextAudit: '2024-07-15',
        sertifikasi: ['ISO 9001:2015 Certificate'],
        pic: 'Quality Manager',
        dokumen: ['QMS-Manual.pdf', 'Process-Procedures.pdf'],
        createdAt: '2023-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        nama: 'ISO 14001:2015',
        kategori: 'sistem',
        standar: 'ISO 14001:2015',
        deskripsi: 'Sistem manajemen lingkungan',
        status: 'active',
        compliance: 92,
        lastAudit: '2024-02-01',
        nextAudit: '2024-08-01',
        sertifikasi: ['ISO 14001:2015 Certificate'],
        pic: 'Environmental Manager',
        dokumen: ['EMS-Manual.pdf', 'Environmental-Procedures.pdf'],
        createdAt: '2023-02-01',
        updatedAt: '2024-02-01'
      },
      {
        id: '3',
        nama: 'OHSAS 18001',
        kategori: 'sistem',
        standar: 'OHSAS 18001',
        deskripsi: 'Sistem manajemen keselamatan dan kesehatan kerja',
        status: 'review',
        compliance: 88,
        lastAudit: '2023-12-15',
        nextAudit: '2024-06-15',
        sertifikasi: ['OHSAS 18001 Certificate'],
        pic: 'Safety Manager',
        dokumen: ['OHSMS-Manual.pdf', 'Safety-Procedures.pdf'],
        createdAt: '2023-01-01',
        updatedAt: '2023-12-15'
      }
    ];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    const colors: { [key: string]: string } = {
      'draft': '#6c757d',
      'review': '#ffc107',
      'approved': '#28a745',
      'active': '#007bff',
      'completed': '#28a745',
      'archived': '#6c757d',
      'pending': '#ffc107',
      'in-progress': '#17a2b8',
      'delayed': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'rendah': '#28a745',
      'sedang': '#ffc107',
      'tinggi': '#fd7e14',
      'kritis': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const getDampakColor = (dampak: string): string => {
    const colors: { [key: string]: string } = {
      'rendah': '#28a745',
      'sedang': '#ffc107',
      'tinggi': '#dc3545'
    };
    return colors[dampak] || '#6c757d';
  };

  const getKategoriIcon = (kategori: string): string => {
    const icons: { [key: string]: string } = {
      'jangka-pendek': '⚡',
      'jangka-menengah': '📈',
      'jangka-panjang': '🎯',
      'operasional': '⚙️',
      'keuangan': '💰',
      'sdm': '👥',
      'marketing': '📢',
      'teknologi': '💻',
      'swot': '🔍',
      'pestel': '🌍',
      'porter': '⚔️',
      'bcg': '📊',
      'ansoff': '📈',
      'produk': '📦',
      'layanan': '🛎️',
      'proses': '🔄',
      'sistem': '🏗️'
    };
    return icons[kategori] || '📋';
  };

  // Initialize component
  useEffect(() => {
    aksesHalamanManajemenStrategis();
  }, []);

  // Render Methods
  const renderMenu = () => (
    <div className="strategic-menu">
      <div className="menu-grid">
        <div className="menu-card" onClick={pilihPerencanaanBisnis}>
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="card-content">
            <h3>Perencanaan Bisnis</h3>
            <p>Kelola rencana strategis jangka pendek, menengah, dan panjang</p>
            <ul>
              <li>Rencana strategis</li>
              <li>Milestone tracking</li>
              <li>Budget planning</li>
              <li>Risk assessment</li>
            </ul>
          </div>
        </div>

        <div className="menu-card" onClick={pilihKelolaKebijakan}>
          <div className="card-icon">
            <i className="fas fa-file-contract"></i>
          </div>
          <div className="card-content">
            <h3>Kelola Kebijakan</h3>
            <p>Manajemen kebijakan dan prosedur perusahaan</p>
            <ul>
              <li>Policy management</li>
              <li>Compliance tracking</li>
              <li>Document control</li>
              <li>Approval workflow</li>
            </ul>
          </div>
        </div>

        <div className="menu-card" onClick={pilihAnalisisStrategis}>
          <div className="card-icon">
            <i className="fas fa-search-plus"></i>
          </div>
          <div className="card-content">
            <h3>Analisis Strategis</h3>
            <p>Berbagai metode analisis untuk pengambilan keputusan</p>
            <ul>
              <li>SWOT Analysis</li>
              <li>PESTEL Analysis</li>
              <li>Porter Five Forces</li>
              <li>BCG Matrix</li>
            </ul>
          </div>
        </div>

        <div className="menu-card" onClick={pilihStandarKualitas}>
          <div className="card-icon">
            <i className="fas fa-award"></i>
          </div>
          <div className="card-content">
            <h3>Standar Kualitas</h3>
            <p>Manajemen standar kualitas dan sertifikasi</p>
            <ul>
              <li>ISO Standards</li>
              <li>Quality metrics</li>
              <li>Audit management</li>
              <li>Certification tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerencanaan = () => (
    <div className="perencanaan-content">
      <div className="content-header">
        <div className="header-info">
          <h2>Perencanaan Bisnis</h2>
          <p>Kelola dan monitor rencana strategis perusahaan</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => {
            setModalType('form');
            setSelectedItem(null);
            setShowModal(true);
          }}>
            <i className="fas fa-plus"></i>
            Tambah Rencana
          </button>
          <button className="btn-back" onClick={() => setStatus(prev => ({ ...prev, currentView: 'menu' }))}>
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>

      <div className="perencanaan-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-content">
            <h3>{perencanaanData.length}</h3>
            <p>Total Rencana</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)' }}>
            <i className="fas fa-play"></i>
          </div>
          <div className="stat-content">
            <h3>{perencanaanData.filter(p => p.status === 'active').length}</h3>
            <p>Sedang Berjalan</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #e0a800)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{Math.round(perencanaanData.reduce((acc, p) => acc + p.progress, 0) / perencanaanData.length)}%</h3>
            <p>Rata-rata Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <h3>{perencanaanData.filter(p => p.prioritas === 'kritis').length}</h3>
            <p>Prioritas Kritis</p>
          </div>
        </div>
      </div>

      <div className="perencanaan-list">
        {perencanaanData.map(rencana => (
          <div key={rencana.id} className="rencana-card">
            <div className="card-header">
              <div className="card-title">
                <span className="kategori-icon">{getKategoriIcon(rencana.kategori)}</span>
                <div>
                  <h4>{rencana.judul}</h4>
                  <p>{rencana.deskripsi}</p>
                </div>
              </div>
              <div className="card-badges">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(rencana.status) }}>
                  {rencana.status}
                </span>
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(rencana.prioritas) }}>
                  {rencana.prioritas}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="rencana-info">
                <div className="info-item">
                  <span>PIC:</span>
                  <strong>{rencana.pic}</strong>
                </div>
                <div className="info-item">
                  <span>Target:</span>
                  <strong>{formatDate(rencana.targetDate)}</strong>
                </div>
                <div className="info-item">
                  <span>Budget:</span>
                  <strong>{formatCurrency(rencana.budget)}</strong>
                </div>
                <div className="info-item">
                  <span>ROI:</span>
                  <strong>{rencana.roi}%</strong>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <strong>{rencana.progress}%</strong>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${rencana.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="milestone-preview">
                <h5>Milestone ({rencana.milestone.length})</h5>
                <div className="milestone-list">
                  {rencana.milestone.slice(0, 3).map(milestone => (
                    <div key={milestone.id} className="milestone-item">
                      <span className="milestone-status" style={{ backgroundColor: getStatusColor(milestone.status) }}></span>
                      <span>{milestone.nama}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-detail"
                onClick={() => {
                  setSelectedItem(rencana);
                  setModalType('detail');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-eye"></i>
                Detail
              </button>
              <button 
                className="btn-edit"
                onClick={() => {
                  setSelectedItem(rencana);
                  setModalType('form');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKebijakan = () => (
    <div className="kebijakan-content">
      <div className="content-header">
        <div className="header-info">
          <h2>Kelola Kebijakan</h2>
          <p>Manajemen kebijakan dan prosedur perusahaan</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => {
            setModalType('form');
            setSelectedItem(null);
            setShowModal(true);
          }}>
            <i className="fas fa-plus"></i>
            Tambah Kebijakan
          </button>
          <button className="btn-back" onClick={() => setStatus(prev => ({ ...prev, currentView: 'menu' }))}>
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>

      <div className="kebijakan-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{kebijakanData.length}</h3>
            <p>Total Kebijakan</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{kebijakanData.filter(k => k.status === 'active').length}</h3>
            <p>Aktif</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #e0a800)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{kebijakanData.filter(k => k.status === 'review').length}</h3>
            <p>Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
            <i className="fas fa-percentage"></i>
          </div>
          <div className="stat-content">
            <h3>{Math.round(kebijakanData.reduce((acc, k) => acc + k.compliance, 0) / kebijakanData.length)}%</h3>
            <p>Avg Compliance</p>
          </div>
        </div>
      </div>

      <div className="kebijakan-list">
        {kebijakanData.map(kebijakan => (
          <div key={kebijakan.id} className="kebijakan-card">
            <div className="card-header">
              <div className="card-title">
                <span className="kategori-icon">{getKategoriIcon(kebijakan.kategori)}</span>
                <div>
                  <h4>{kebijakan.nama}</h4>
                  <p>{kebijakan.deskripsi}</p>
                </div>
              </div>
              <div className="card-badges">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(kebijakan.status) }}>
                  {kebijakan.status}
                </span>
                <span className="dampak-badge" style={{ backgroundColor: getDampakColor(kebijakan.dampak) }}>
                  {kebijakan.dampak}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="kebijakan-info">
                <div className="info-item">
                  <span>Kategori:</span>
                  <strong>{kebijakan.kategori}</strong>
                </div>
                <div className="info-item">
                  <span>Versi:</span>
                  <strong>{kebijakan.versi}</strong>
                </div>
                <div className="info-item">
                  <span>Berlaku:</span>
                  <strong>{formatDate(kebijakan.tanggalBerlaku)}</strong>
                </div>
                <div className="info-item">
                  <span>Expired:</span>
                  <strong>{formatDate(kebijakan.tanggalExpired)}</strong>
                </div>
              </div>

              <div className="compliance-section">
                <div className="compliance-header">
                  <span>Compliance</span>
                  <strong>{kebijakan.compliance}%</strong>
                </div>
                <div className="compliance-bar">
                  <div 
                    className="compliance-fill" 
                    style={{ width: `${kebijakan.compliance}%` }}
                  ></div>
                </div>
              </div>

              <div className="approver-info">
                <span>Approver: <strong>{kebijakan.approver}</strong></span>
                <span>Dokumen: <strong>{kebijakan.dokumen}</strong></span>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-detail"
                onClick={() => {
                  setSelectedItem(kebijakan);
                  setModalType('detail');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-eye"></i>
                Detail
              </button>
              <button 
                className="btn-edit"
                onClick={() => {
                  setSelectedItem(kebijakan);
                  setModalType('form');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalisis = () => (
    <div className="analisis-content">
      <div className="content-header">
        <div className="header-info">
          <h2>Analisis Strategis</h2>
          <p>Berbagai metode analisis untuk pengambilan keputusan strategis</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => {
            setModalType('form');
            setSelectedItem(null);
            setShowModal(true);
          }}>
            <i className="fas fa-plus"></i>
            Buat Analisis
          </button>
          <button className="btn-back" onClick={() => setStatus(prev => ({ ...prev, currentView: 'menu' }))}>
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>

      <div className="analisis-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <i className="fas fa-search"></i>
          </div>
          <div className="stat-content">
            <h3>{analisisData.length}</h3>
            <p>Total Analisis</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{analisisData.filter(a => a.status === 'completed').length}</h3>
            <p>Selesai</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #e0a800)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{analisisData.filter(a => a.status === 'in-progress').length}</h3>
            <p>Dalam Proses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-content">
            <h3>{Math.round(analisisData.reduce((acc, a) => acc + a.confidence, 0) / analisisData.length)}%</h3>
            <p>Avg Confidence</p>
          </div>
        </div>
      </div>

      <div className="analisis-list">
        {analisisData.map(analisis => (
          <div key={analisis.id} className="analisis-card">
            <div className="card-header">
              <div className="card-title">
                <span className="kategori-icon">{getKategoriIcon(analisis.tipe)}</span>
                <div>
                  <h4>{analisis.judul}</h4>
                  <p>{analisis.deskripsi}</p>
                </div>
              </div>
              <div className="card-badges">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(analisis.status) }}>
                  {analisis.status}
                </span>
                <span className="tipe-badge">
                  {analisis.tipe.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="analisis-info">
                <div className="info-item">
                  <span>Analyst:</span>
                  <strong>{analisis.analyst}</strong>
                </div>
                <div className="info-item">
                  <span>Tanggal:</span>
                  <strong>{formatDate(analisis.tanggalAnalisis)}</strong>
                </div>
                <div className="info-item">
                  <span>Valid Until:</span>
                  <strong>{formatDate(analisis.validUntil)}</strong>
                </div>
                <div className="info-item">
                  <span>Confidence:</span>
                  <strong>{analisis.confidence}%</strong>
                </div>
              </div>

              <div className="confidence-section">
                <div className="confidence-header">
                  <span>Confidence Level</span>
                  <strong>{analisis.confidence}%</strong>
                </div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${analisis.confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="rekomendasi-preview">
                <h5>Rekomendasi ({analisis.rekomendasi.length})</h5>
                <div className="rekomendasi-list">
                  {analisis.rekomendasi.slice(0, 2).map((rekomendasi, index) => (
                    <div key={index} className="rekomendasi-item">
                      <i className="fas fa-lightbulb"></i>
                      <span>{rekomendasi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-detail"
                onClick={() => {
                  setSelectedItem(analisis);
                  setModalType('detail');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-eye"></i>
                Detail
              </button>
              <button 
                className="btn-edit"
                onClick={() => {
                  setSelectedItem(analisis);
                  setModalType('form');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKualitas = () => (
    <div className="kualitas-content">
      <div className="content-header">
        <div className="header-info">
          <h2>Standar Kualitas</h2>
          <p>Manajemen standar kualitas dan sertifikasi perusahaan</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => {
            setModalType('form');
            setSelectedItem(null);
            setShowModal(true);
          }}>
            <i className="fas fa-plus"></i>
            Tambah Standar
          </button>
          <button className="btn-back" onClick={() => setStatus(prev => ({ ...prev, currentView: 'menu' }))}>
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>

      <div className="kualitas-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <i className="fas fa-award"></i>
          </div>
          <div className="stat-content">
            <h3>{kualitasData.length}</h3>
            <p>Total Standar</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{kualitasData.filter(k => k.status === 'active').length}</h3>
            <p>Aktif</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #e0a800)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{kualitasData.filter(k => k.status === 'review').length}</h3>
            <p>Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
            <i className="fas fa-percentage"></i>
          </div>
          <div className="stat-content">
            <h3>{Math.round(kualitasData.reduce((acc, k) => acc + k.compliance, 0) / kualitasData.length)}%</h3>
            <p>Avg Compliance</p>
          </div>
        </div>
      </div>

      <div className="kualitas-list">
        {kualitasData.map(kualitas => (
          <div key={kualitas.id} className="kualitas-card">
            <div className="card-header">
              <div className="card-title">
                <span className="kategori-icon">{getKategoriIcon(kualitas.kategori)}</span>
                <div>
                  <h4>{kualitas.nama}</h4>
                  <p>{kualitas.deskripsi}</p>
                </div>
              </div>
              <div className="card-badges">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(kualitas.status) }}>
                  {kualitas.status}
                </span>
                <span className="standar-badge">
                  {kualitas.standar}
                </span>
              </div>
            </div>

            <div className="card-content">
              <div className="kualitas-info">
                <div className="info-item">
                  <span>PIC:</span>
                  <strong>{kualitas.pic}</strong>
                </div>
                <div className="info-item">
                  <span>Last Audit:</span>
                  <strong>{formatDate(kualitas.lastAudit)}</strong>
                </div>
                <div className="info-item">
                  <span>Next Audit:</span>
                  <strong>{formatDate(kualitas.nextAudit)}</strong>
                </div>
                <div className="info-item">
                  <span>Sertifikasi:</span>
                  <strong>{kualitas.sertifikasi.length} item</strong>
                </div>
              </div>

              <div className="compliance-section">
                <div className="compliance-header">
                  <span>Compliance</span>
                  <strong>{kualitas.compliance}%</strong>
                </div>
                <div className="compliance-bar">
                  <div 
                    className="compliance-fill" 
                    style={{ width: `${kualitas.compliance}%` }}
                  ></div>
                </div>
              </div>

              <div className="dokumen-preview">
                <h5>Dokumen ({kualitas.dokumen.length})</h5>
                <div className="dokumen-list">
                  {kualitas.dokumen.slice(0, 2).map((dokumen, index) => (
                    <div key={index} className="dokumen-item">
                      <i className="fas fa-file-pdf"></i>
                      <span>{dokumen}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-detail"
                onClick={() => {
                  setSelectedItem(kualitas);
                  setModalType('detail');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-eye"></i>
                Detail
              </button>
              <button 
                className="btn-edit"
                onClick={() => {
                  setSelectedItem(kualitas);
                  setModalType('form');
                  setShowModal(true);
                }}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {modalType === 'detail' ? 'Detail' : 'Form'} {
                status.currentView === 'perencanaan' ? 'Perencanaan' :
                status.currentView === 'kebijakan' ? 'Kebijakan' :
                status.currentView === 'analisis' ? 'Analisis' :
                'Standar Kualitas'
              }
            </h2>
            <button className="btn-close" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {modalType === 'detail' && selectedItem && (
              <div className="detail-content">
                <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            )}
            {modalType === 'form' && (
              <div className="form-content">
                <p>Form untuk {status.currentView} akan diimplementasikan di sini.</p>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  if (status.loading) {
    return (
      <div className="halaman-strategis">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat data manajemen strategis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman-strategis">
      <div className="header-section">
        <div className="header-content">
          <h1>Manajemen Strategis</h1>
          <p>Kelola perencanaan, kebijakan, analisis, dan standar kualitas perusahaan</p>
        </div>
      </div>

      {status.success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {status.success}
        </div>
      )}

      {status.error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {status.error}
        </div>
      )}

      {status.currentView === 'menu' && renderMenu()}
      {status.currentView === 'perencanaan' && renderPerencanaan()}
      {status.currentView === 'kebijakan' && renderKebijakan()}
      {status.currentView === 'analisis' && renderAnalisis()}
      {status.currentView === 'kualitas' && renderKualitas()}

      {renderModal()}
    </div>
  );
};

export default HalamanStrategis;