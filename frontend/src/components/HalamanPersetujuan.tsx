import React, { useState, useEffect } from 'react';
import './HalamanPersetujuan.css';

// Interfaces
interface ProposalFinansial {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: 'investasi' | 'operasional' | 'marketing' | 'hr' | 'teknologi';
  jumlah: number;
  mata_uang: string;
  tanggal_pengajuan: string;
  tanggal_deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'need_info';
  prioritas: 'low' | 'medium' | 'high' | 'urgent';
  pengaju: {
    nama: string;
    jabatan: string;
    departemen: string;
    email: string;
    avatar?: string;
  };
  approver: {
    nama: string;
    jabatan: string;
    level: number;
  };
  dokumen: {
    nama: string;
    ukuran: string;
    tipe: string;
    url: string;
  }[];
  justifikasi: string;
  dampak_bisnis: string;
  roi_estimasi?: number;
  timeline_implementasi: string;
  risiko: string;
  mitigasi_risiko: string;
  budget_breakdown: {
    kategori: string;
    jumlah: number;
    persentase: number;
  }[];
  approval_history: {
    tanggal: string;
    approver: string;
    aksi: string;
    komentar: string;
  }[];
  komentar_internal: string[];
}

interface FilterOptions {
  status: string;
  kategori: string;
  prioritas: string;
  tanggal_dari: string;
  tanggal_sampai: string;
  jumlah_min: string;
  jumlah_max: string;
}

interface StatusHalaman {
  halaman: 'menu' | 'detail' | 'approval' | 'rejection' | 'info_request';
  proposal_terpilih?: ProposalFinansial;
}

const HalamanPersetujuan: React.FC = () => {
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({ halaman: 'menu' });
  const [proposals, setProposals] = useState<ProposalFinansial[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalFinansial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    kategori: '',
    prioritas: '',
    tanggal_dari: '',
    tanggal_sampai: '',
    jumlah_min: '',
    jumlah_max: ''
  });
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [infoRequest, setInfoRequest] = useState('');

  // Generate mock data
  const generateMockProposals = (): ProposalFinansial[] => {
    const categories = ['investasi', 'operasional', 'marketing', 'hr', 'teknologi'] as const;
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    const statuses = ['pending', 'approved', 'rejected', 'need_info'] as const;
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `PROP-${String(i + 1).padStart(3, '0')}`,
      judul: [
        'Upgrade Sistem IT Perusahaan',
        'Kampanye Marketing Digital Q4',
        'Renovasi Kantor Cabang Jakarta',
        'Pelatihan Karyawan Leadership',
        'Investasi Mesin Produksi Baru',
        'Program CSR Lingkungan',
        'Ekspansi Pasar Regional',
        'Sistem Keamanan Cyber',
        'Pengembangan Aplikasi Mobile',
        'Peningkatan Fasilitas Karyawan',
        'Akuisisi Startup Teknologi',
        'Program Digitalisasi Proses',
        'Investasi R&D Produk Baru',
        'Upgrade Infrastruktur Cloud',
        'Program Sustainability'
      ][i],
      deskripsi: `Proposal untuk ${[
        'meningkatkan efisiensi operasional',
        'memperluas jangkauan pasar',
        'mengoptimalkan proses bisnis',
        'meningkatkan kepuasan karyawan',
        'memperkuat posisi kompetitif'
      ][i % 5]} perusahaan melalui investasi strategis yang terukur.`,
      kategori: categories[i % categories.length],
      jumlah: Math.floor(Math.random() * 5000000000) + 100000000,
      mata_uang: 'IDR',
      tanggal_pengajuan: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tanggal_deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: statuses[i % statuses.length],
      prioritas: priorities[i % priorities.length],
      pengaju: {
        nama: [
          'Ahmad Wijaya', 'Sari Indah', 'Budi Santoso', 'Maya Putri', 'Rizki Pratama',
          'Dewi Sartika', 'Andi Kurniawan', 'Lina Marlina', 'Fajar Nugroho', 'Rina Susanti',
          'Doni Setiawan', 'Mega Wati', 'Hendra Gunawan', 'Tika Sari', 'Yoga Pratama'
        ][i],
        jabatan: [
          'IT Manager', 'Marketing Director', 'Operations Manager', 'HR Director', 'Production Manager',
          'Finance Manager', 'Sales Director', 'R&D Manager', 'Quality Manager', 'Business Development'
        ][i % 10],
        departemen: [
          'Information Technology', 'Marketing', 'Operations', 'Human Resources', 'Production',
          'Finance', 'Sales', 'Research & Development', 'Quality Assurance', 'Business Development'
        ][i % 10],
        email: `${['ahmad.wijaya', 'sari.indah', 'budi.santoso', 'maya.putri', 'rizki.pratama'][i % 5]}@mobilindo.com`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(['Ahmad Wijaya', 'Sari Indah', 'Budi Santoso', 'Maya Putri', 'Rizki Pratama'][i % 5])}&background=667eea&color=fff`
      },
      approver: {
        nama: 'Direktur Keuangan',
        jabatan: 'Chief Financial Officer',
        level: 3
      },
      dokumen: [
        {
          nama: 'Proposal_Detail.pdf',
          ukuran: '2.5 MB',
          tipe: 'PDF',
          url: '#'
        },
        {
          nama: 'Budget_Analysis.xlsx',
          ukuran: '1.2 MB',
          tipe: 'Excel',
          url: '#'
        },
        {
          nama: 'ROI_Calculation.pdf',
          ukuran: '800 KB',
          tipe: 'PDF',
          url: '#'
        }
      ],
      justifikasi: `Investasi ini diperlukan untuk ${[
        'meningkatkan efisiensi operasional sebesar 25%',
        'memperluas market share hingga 15%',
        'mengurangi biaya operasional jangka panjang',
        'meningkatkan produktivitas karyawan',
        'memperkuat competitive advantage'
      ][i % 5]} dan mendukung pertumbuhan bisnis berkelanjutan.`,
      dampak_bisnis: `Diperkirakan akan memberikan dampak positif berupa ${[
        'peningkatan revenue 20% dalam 12 bulan',
        'penghematan biaya operasional 30%',
        'peningkatan customer satisfaction',
        'optimalisasi proses bisnis',
        'strengthening market position'
      ][i % 5]} serta ROI yang menguntungkan dalam jangka menengah.`,
      roi_estimasi: Math.floor(Math.random() * 200) + 50,
      timeline_implementasi: `${Math.floor(Math.random() * 12) + 3} bulan`,
      risiko: 'Risiko implementasi meliputi keterlambatan timeline, budget overrun, dan resistance to change dari stakeholder internal.',
      mitigasi_risiko: 'Mitigasi dilakukan melalui project management yang ketat, regular monitoring, dan comprehensive change management program.',
      budget_breakdown: [
        { kategori: 'Hardware/Software', jumlah: Math.floor(Math.random() * 1000000000), persentase: 40 },
        { kategori: 'Implementation', jumlah: Math.floor(Math.random() * 500000000), persentase: 25 },
        { kategori: 'Training', jumlah: Math.floor(Math.random() * 300000000), persentase: 15 },
        { kategori: 'Maintenance', jumlah: Math.floor(Math.random() * 400000000), persentase: 20 }
      ],
      approval_history: [
        {
          tanggal: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          approver: 'Manager Departemen',
          aksi: 'Approved',
          komentar: 'Proposal sudah sesuai dengan strategic direction departemen.'
        }
      ],
      komentar_internal: [
        'Proposal ini align dengan roadmap teknologi perusahaan',
        'Budget estimation perlu review lebih detail',
        'Timeline implementasi realistic dan achievable'
      ]
    }));
  };

  // Helper functions
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
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545',
      need_info: '#17a2b8'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority as keyof typeof colors] || '#6c757d';
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      investasi: '💰',
      operasional: '⚙️',
      marketing: '📈',
      hr: '👥',
      teknologi: '💻'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getStatusIcon = (status: string): string => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      need_info: '❓'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  // Main methods
  const aksesHalamanPersetujuanFinansial = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProposals = generateMockProposals();
      setProposals(mockProposals);
      setFilteredProposals(mockProposals);
      setStatusHalaman({ halaman: 'menu' });
      
      setSuccess('Data proposal berhasil dimuat');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Gagal memuat data proposal');
    } finally {
      setLoading(false);
    }
  };

  const reviewDetailProposal = (proposal: ProposalFinansial): void => {
    setStatusHalaman({ 
      halaman: 'detail', 
      proposal_terpilih: proposal 
    });
  };

  const approveProposal = async (proposalId: string, comment: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'approved' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Approved',
                  komentar: comment || 'Proposal disetujui'
                }
              ]
            }
          : p
      ));
      
      setFilteredProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'approved' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Approved',
                  komentar: comment || 'Proposal disetujui'
                }
              ]
            }
          : p
      ));
      
      setStatusHalaman({ halaman: 'menu' });
      setApprovalComment('');
      setSuccess('Proposal berhasil disetujui');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Gagal menyetujui proposal');
    } finally {
      setLoading(false);
    }
  };

  const rejectProposal = async (proposalId: string, reason: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'rejected' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Rejected',
                  komentar: reason || 'Proposal ditolak'
                }
              ]
            }
          : p
      ));
      
      setFilteredProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'rejected' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Rejected',
                  komentar: reason || 'Proposal ditolak'
                }
              ]
            }
          : p
      ));
      
      setStatusHalaman({ halaman: 'menu' });
      setRejectionReason('');
      setSuccess('Proposal berhasil ditolak');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Gagal menolak proposal');
    } finally {
      setLoading(false);
    }
  };

  const requestMoreInfo = async (proposalId: string, request: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'need_info' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Request Info',
                  komentar: request || 'Membutuhkan informasi tambahan'
                }
              ]
            }
          : p
      ));
      
      setFilteredProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { 
              ...p, 
              status: 'need_info' as const,
              approval_history: [
                ...p.approval_history,
                {
                  tanggal: new Date().toISOString().split('T')[0],
                  approver: 'Direktur Keuangan',
                  aksi: 'Request Info',
                  komentar: request || 'Membutuhkan informasi tambahan'
                }
              ]
            }
          : p
      ));
      
      setStatusHalaman({ halaman: 'menu' });
      setInfoRequest('');
      setSuccess('Permintaan informasi berhasil dikirim');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Gagal mengirim permintaan informasi');
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  const applyFilters = (): void => {
    let filtered = [...proposals];
    
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.kategori) {
      filtered = filtered.filter(p => p.kategori === filters.kategori);
    }
    
    if (filters.prioritas) {
      filtered = filtered.filter(p => p.prioritas === filters.prioritas);
    }
    
    if (filters.tanggal_dari) {
      filtered = filtered.filter(p => p.tanggal_pengajuan >= filters.tanggal_dari);
    }
    
    if (filters.tanggal_sampai) {
      filtered = filtered.filter(p => p.tanggal_pengajuan <= filters.tanggal_sampai);
    }
    
    if (filters.jumlah_min) {
      filtered = filtered.filter(p => p.jumlah >= parseInt(filters.jumlah_min));
    }
    
    if (filters.jumlah_max) {
      filtered = filtered.filter(p => p.jumlah <= parseInt(filters.jumlah_max));
    }
    
    setFilteredProposals(filtered);
  };

  // Initialize component
  useEffect(() => {
    aksesHalamanPersetujuanFinansial();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, proposals]);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="halaman-persetujuan">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat data proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman-persetujuan">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1>Halaman Persetujuan Finansial</h1>
          <p>Kelola dan review proposal finansial yang membutuhkan persetujuan</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-back"
            onClick={() => setStatusHalaman({ halaman: 'menu' })}
          >
            <i className="fas fa-arrow-left"></i>
            Kembali ke Menu
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Main Content */}
      {statusHalaman.halaman === 'menu' && (
        <div className="approval-content">
          {/* Statistics Overview */}
          <div className="approval-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #e0a800)' }}>
                ⏳
              </div>
              <div className="stat-content">
                <h3>{proposals.filter(p => p.status === 'pending').length}</h3>
                <p>Menunggu Persetujuan</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
                ✅
              </div>
              <div className="stat-content">
                <h3>{proposals.filter(p => p.status === 'approved').length}</h3>
                <p>Disetujui</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                ❌
              </div>
              <div className="stat-content">
                <h3>{proposals.filter(p => p.status === 'rejected').length}</h3>
                <p>Ditolak</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
                ❓
              </div>
              <div className="stat-content">
                <h3>{proposals.filter(p => p.status === 'need_info').length}</h3>
                <p>Butuh Info</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <h3>Filter Proposal</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="need_info">Need Info</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Kategori:</label>
                <select 
                  value={filters.kategori} 
                  onChange={(e) => setFilters(prev => ({ ...prev, kategori: e.target.value }))}
                >
                  <option value="">Semua Kategori</option>
                  <option value="investasi">Investasi</option>
                  <option value="operasional">Operasional</option>
                  <option value="marketing">Marketing</option>
                  <option value="hr">HR</option>
                  <option value="teknologi">Teknologi</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Prioritas:</label>
                <select 
                  value={filters.prioritas} 
                  onChange={(e) => setFilters(prev => ({ ...prev, prioritas: e.target.value }))}
                >
                  <option value="">Semua Prioritas</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Tanggal Dari:</label>
                <input 
                  type="date" 
                  value={filters.tanggal_dari}
                  onChange={(e) => setFilters(prev => ({ ...prev, tanggal_dari: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>Tanggal Sampai:</label>
                <input 
                  type="date" 
                  value={filters.tanggal_sampai}
                  onChange={(e) => setFilters(prev => ({ ...prev, tanggal_sampai: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Proposals List */}
          <div className="proposals-section">
            <div className="section-header">
              <h3>Daftar Proposal ({filteredProposals.length})</h3>
            </div>
            <div className="proposals-list">
              {filteredProposals.map(proposal => (
                <div key={proposal.id} className="proposal-card">
                  <div className="card-header">
                    <div className="proposal-info">
                      <div className="proposal-title">
                        <span className="kategori-icon">{getCategoryIcon(proposal.kategori)}</span>
                        <div>
                          <h4>{proposal.judul}</h4>
                          <p>ID: {proposal.id}</p>
                        </div>
                      </div>
                      <div className="proposal-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(proposal.status) }}
                        >
                          {getStatusIcon(proposal.status)} {proposal.status.toUpperCase()}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(proposal.prioritas) }}
                        >
                          {proposal.prioritas.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="proposal-details">
                      <div className="detail-item">
                        <span>Pengaju:</span>
                        <strong>{proposal.pengaju.nama}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Departemen:</span>
                        <strong>{proposal.pengaju.departemen}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Jumlah:</span>
                        <strong>{formatCurrency(proposal.jumlah)}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Tanggal Pengajuan:</span>
                        <strong>{formatDate(proposal.tanggal_pengajuan)}</strong>
                      </div>
                      <div className="detail-item">
                        <span>Deadline:</span>
                        <strong>{formatDate(proposal.tanggal_deadline)}</strong>
                      </div>
                      <div className="detail-item">
                        <span>ROI Estimasi:</span>
                        <strong>{proposal.roi_estimasi}%</strong>
                      </div>
                    </div>
                    
                    <div className="proposal-description">
                      <p>{proposal.deskripsi}</p>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-detail"
                      onClick={() => reviewDetailProposal(proposal)}
                    >
                      <i className="fas fa-eye"></i>
                      Review Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {statusHalaman.halaman === 'detail' && statusHalaman.proposal_terpilih && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Proposal - {statusHalaman.proposal_terpilih.judul}</h2>
              <button 
                className="btn-close"
                onClick={() => setStatusHalaman({ halaman: 'menu' })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="proposal-detail">
                {/* Basic Info */}
                <div className="detail-section">
                  <h4>Informasi Dasar</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>ID Proposal:</span>
                      <strong>{statusHalaman.proposal_terpilih.id}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Kategori:</span>
                      <strong>{statusHalaman.proposal_terpilih.kategori}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(statusHalaman.proposal_terpilih.status) }}
                      >
                        {statusHalaman.proposal_terpilih.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Prioritas:</span>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(statusHalaman.proposal_terpilih.prioritas) }}
                      >
                        {statusHalaman.proposal_terpilih.prioritas.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="detail-section">
                  <h4>Informasi Finansial</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Total Jumlah:</span>
                      <strong>{formatCurrency(statusHalaman.proposal_terpilih.jumlah)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>ROI Estimasi:</span>
                      <strong>{statusHalaman.proposal_terpilih.roi_estimasi}%</strong>
                    </div>
                    <div className="detail-item">
                      <span>Timeline:</span>
                      <strong>{statusHalaman.proposal_terpilih.timeline_implementasi}</strong>
                    </div>
                  </div>
                  
                  <div className="budget-breakdown">
                    <h5>Breakdown Budget</h5>
                    {statusHalaman.proposal_terpilih.budget_breakdown.map((item, index) => (
                      <div key={index} className="budget-item">
                        <div className="budget-info">
                          <span>{item.kategori}</span>
                          <strong>{formatCurrency(item.jumlah)} ({item.persentase}%)</strong>
                        </div>
                        <div className="budget-bar">
                          <div 
                            className="budget-fill"
                            style={{ width: `${item.persentase}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="detail-section">
                  <h4>Informasi Pengaju</h4>
                  <div className="submitter-info">
                    <div className="submitter-avatar">
                      <img 
                        src={statusHalaman.proposal_terpilih.pengaju.avatar} 
                        alt={statusHalaman.proposal_terpilih.pengaju.nama}
                      />
                    </div>
                    <div className="submitter-details">
                      <h5>{statusHalaman.proposal_terpilih.pengaju.nama}</h5>
                      <p>{statusHalaman.proposal_terpilih.pengaju.jabatan}</p>
                      <p>{statusHalaman.proposal_terpilih.pengaju.departemen}</p>
                      <p>{statusHalaman.proposal_terpilih.pengaju.email}</p>
                    </div>
                  </div>
                </div>

                {/* Business Case */}
                <div className="detail-section">
                  <h4>Business Case</h4>
                  <div className="business-case">
                    <div className="case-item">
                      <h5>Justifikasi</h5>
                      <p>{statusHalaman.proposal_terpilih.justifikasi}</p>
                    </div>
                    <div className="case-item">
                      <h5>Dampak Bisnis</h5>
                      <p>{statusHalaman.proposal_terpilih.dampak_bisnis}</p>
                    </div>
                    <div className="case-item">
                      <h5>Risiko</h5>
                      <p>{statusHalaman.proposal_terpilih.risiko}</p>
                    </div>
                    <div className="case-item">
                      <h5>Mitigasi Risiko</h5>
                      <p>{statusHalaman.proposal_terpilih.mitigasi_risiko}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="detail-section">
                  <h4>Dokumen Pendukung</h4>
                  <div className="documents-list">
                    {statusHalaman.proposal_terpilih.dokumen.map((doc, index) => (
                      <div key={index} className="document-item">
                        <div className="doc-icon">📄</div>
                        <div className="doc-info">
                          <span>{doc.nama}</span>
                          <small>{doc.tipe} - {doc.ukuran}</small>
                        </div>
                        <button className="btn-download">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval History */}
                <div className="detail-section">
                  <h4>Riwayat Persetujuan</h4>
                  <div className="approval-history">
                    {statusHalaman.proposal_terpilih.approval_history.map((history, index) => (
                      <div key={index} className="history-item">
                        <div className="history-date">{formatDate(history.tanggal)}</div>
                        <div className="history-content">
                          <strong>{history.approver}</strong>
                          <span className="history-action">{history.aksi}</span>
                          <p>{history.komentar}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              {statusHalaman.proposal_terpilih.status === 'pending' && (
                <>
                  <button 
                    className="btn-approve"
                    onClick={() => setStatusHalaman({ 
                      halaman: 'approval', 
                      proposal_terpilih: statusHalaman.proposal_terpilih 
                    })}
                  >
                    <i className="fas fa-check"></i>
                    Setujui
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => setStatusHalaman({ 
                      halaman: 'rejection', 
                      proposal_terpilih: statusHalaman.proposal_terpilih 
                    })}
                  >
                    <i className="fas fa-times"></i>
                    Tolak
                  </button>
                  <button 
                    className="btn-info"
                    onClick={() => setStatusHalaman({ 
                      halaman: 'info_request', 
                      proposal_terpilih: statusHalaman.proposal_terpilih 
                    })}
                  >
                    <i className="fas fa-question"></i>
                    Minta Info
                  </button>
                </>
              )}
              <button 
                className="btn-secondary"
                onClick={() => setStatusHalaman({ halaman: 'menu' })}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {statusHalaman.halaman === 'approval' && statusHalaman.proposal_terpilih && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Setujui Proposal</h2>
              <button 
                className="btn-close"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="approval-form">
                <p>Anda akan menyetujui proposal: <strong>{statusHalaman.proposal_terpilih.judul}</strong></p>
                <div className="form-group">
                  <label>Komentar Persetujuan:</label>
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Masukkan komentar persetujuan (opsional)"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-approve"
                onClick={() => approveProposal(statusHalaman.proposal_terpilih!.id, approvalComment)}
                disabled={loading}
              >
                <i className="fas fa-check"></i>
                {loading ? 'Memproses...' : 'Konfirmasi Setujui'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {statusHalaman.halaman === 'rejection' && statusHalaman.proposal_terpilih && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Tolak Proposal</h2>
              <button 
                className="btn-close"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="rejection-form">
                <p>Anda akan menolak proposal: <strong>{statusHalaman.proposal_terpilih.judul}</strong></p>
                <div className="form-group">
                  <label>Alasan Penolakan: <span className="required">*</span></label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-reject"
                onClick={() => rejectProposal(statusHalaman.proposal_terpilih!.id, rejectionReason)}
                disabled={loading || !rejectionReason.trim()}
              >
                <i className="fas fa-times"></i>
                {loading ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Request Modal */}
      {statusHalaman.halaman === 'info_request' && statusHalaman.proposal_terpilih && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Minta Informasi Tambahan</h2>
              <button 
                className="btn-close"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="info-request-form">
                <p>Minta informasi tambahan untuk proposal: <strong>{statusHalaman.proposal_terpilih.judul}</strong></p>
                <div className="form-group">
                  <label>Informasi yang Dibutuhkan: <span className="required">*</span></label>
                  <textarea
                    value={infoRequest}
                    onChange={(e) => setInfoRequest(e.target.value)}
                    placeholder="Jelaskan informasi tambahan yang dibutuhkan"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-info"
                onClick={() => requestMoreInfo(statusHalaman.proposal_terpilih!.id, infoRequest)}
                disabled={loading || !infoRequest.trim()}
              >
                <i className="fas fa-question"></i>
                {loading ? 'Mengirim...' : 'Kirim Permintaan'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setStatusHalaman({ 
                  halaman: 'detail', 
                  proposal_terpilih: statusHalaman.proposal_terpilih 
                })}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanPersetujuan;