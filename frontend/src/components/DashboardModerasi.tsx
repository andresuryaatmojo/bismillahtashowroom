import React, { useState, useEffect } from 'react';
import './DashboardModerasi.css';

// Interface untuk data ulasan
interface DataUlasan {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  productName: string;
  productImage?: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  moderatorId?: string;
  moderatorName?: string;
  moderationReason?: string;
  moderationDate?: string;
  reportCount: number;
  helpfulCount: number;
  category: 'product' | 'service' | 'delivery' | 'general';
  sentiment: 'positive' | 'neutral' | 'negative';
  isVerifiedPurchase: boolean;
  originalContent?: string;
}

// Interface untuk filter ulasan
interface FilterUlasan {
  status: string;
  category: string;
  rating: string;
  sentiment: string;
  dateRange: string;
  isVerifiedPurchase: boolean | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Interface untuk statistik moderasi
interface StatistikModerasi {
  totalUlasan: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  averageRating: number;
  reportedReviews: number;
  verifiedPurchases: number;
  responseTime: number;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const DashboardModerasi: React.FC = () => {
  // State management
  const [dataUlasan, setDataUlasan] = useState<DataUlasan[]>([]);
  const [statistikModerasi, setStatistikModerasi] = useState<StatistikModerasi>({
    totalUlasan: 0,
    pendingReview: 0,
    approvedToday: 0,
    rejectedToday: 0,
    averageRating: 0,
    reportedReviews: 0,
    verifiedPurchases: 0,
    responseTime: 0
  });
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  
  const [selectedUlasan, setSelectedUlasan] = useState<DataUlasan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'edit'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  
  const [filter, setFilter] = useState<FilterUlasan>({
    status: '',
    category: '',
    rating: '',
    sentiment: '',
    dateRange: '',
    isVerifiedPurchase: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Method: aksesDashboardModerasi
  const aksesDashboardModerasi = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data
      const mockUlasan = generateMockUlasan();
      const mockStatistik = calculateStatistik(mockUlasan);
      
      setDataUlasan(mockUlasan);
      setStatistikModerasi(mockStatistik);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Dashboard moderasi berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat data moderasi', 
        success: null 
      });
    }
  };

  // Method: pilihUlasanUntukDitinjau
  const pilihUlasanUntukDitinjau = (idUlasan: string) => {
    const ulasan = dataUlasan.find(item => item.id === idUlasan);
    if (ulasan) {
      setSelectedUlasan(ulasan);
      setEditedContent(ulasan.content);
      setEditedTitle(ulasan.title);
      setShowDetailModal(true);
    }
  };

  // Method: setujuiUlasan
  const setujuiUlasan = async (idUlasan: string, alasan: string) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDataUlasan(prev => 
        prev.map(ulasan => 
          ulasan.id === idUlasan 
            ? {
                ...ulasan,
                status: 'approved' as const,
                moderatorId: 'moderator-1',
                moderatorName: 'Admin Moderator',
                moderationReason: alasan,
                moderationDate: new Date().toISOString()
              }
            : ulasan
        )
      );
      
      // Update statistik
      setStatistikModerasi(prev => ({
        ...prev,
        pendingReview: prev.pendingReview - 1,
        approvedToday: prev.approvedToday + 1
      }));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Ulasan berhasil disetujui' 
      });
      
      setShowModerationModal(false);
      setShowDetailModal(false);
      setModerationReason('');
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menyetujui ulasan', 
        success: null 
      });
    }
  };

  // Method: tolakUlasan
  const tolakUlasan = async (idUlasan: string, alasan: string) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDataUlasan(prev => 
        prev.map(ulasan => 
          ulasan.id === idUlasan 
            ? {
                ...ulasan,
                status: 'rejected' as const,
                moderatorId: 'moderator-1',
                moderatorName: 'Admin Moderator',
                moderationReason: alasan,
                moderationDate: new Date().toISOString()
              }
            : ulasan
        )
      );
      
      // Update statistik
      setStatistikModerasi(prev => ({
        ...prev,
        pendingReview: prev.pendingReview - 1,
        rejectedToday: prev.rejectedToday + 1
      }));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Ulasan berhasil ditolak' 
      });
      
      setShowModerationModal(false);
      setShowDetailModal(false);
      setModerationReason('');
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menolak ulasan', 
        success: null 
      });
    }
  };

  // Method: editUlasan
  const editUlasan = async (idUlasan: string, kontenBaru: string, alasan: string) => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDataUlasan(prev => 
        prev.map(ulasan => 
          ulasan.id === idUlasan 
            ? {
                ...ulasan,
                originalContent: ulasan.content,
                content: kontenBaru,
                title: editedTitle,
                status: 'edited' as const,
                moderatorId: 'moderator-1',
                moderatorName: 'Admin Moderator',
                moderationReason: alasan,
                moderationDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : ulasan
        )
      );
      
      // Update statistik
      setStatistikModerasi(prev => ({
        ...prev,
        pendingReview: prev.pendingReview - 1,
        approvedToday: prev.approvedToday + 1
      }));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Ulasan berhasil diedit dan disetujui' 
      });
      
      setShowEditModal(false);
      setShowDetailModal(false);
      setEditedContent('');
      setEditedTitle('');
      setModerationReason('');
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal mengedit ulasan', 
        success: null 
      });
    }
  };

  // Method: cekLanjutModerasi
  const cekLanjutModerasi = () => {
    const pendingCount = dataUlasan.filter(ulasan => ulasan.status === 'pending').length;
    
    if (pendingCount > 0) {
      if (window.confirm(`Masih ada ${pendingCount} ulasan yang menunggu moderasi. Apakah Anda ingin melanjutkan?`)) {
        return true;
      }
      return false;
    }
    
    alert('Semua ulasan telah dimoderasi. Terima kasih atas kerja keras Anda!');
    return true;
  };

  // Helper functions
  const generateMockUlasan = (): DataUlasan[] => {
    const mockData: DataUlasan[] = [];
    const products = [
      { id: 'prod-1', name: 'Toyota Avanza 2024', image: '/images/avanza.jpg' },
      { id: 'prod-2', name: 'Honda Brio Satya', image: '/images/brio.jpg' },
      { id: 'prod-3', name: 'Daihatsu Xenia', image: '/images/xenia.jpg' },
      { id: 'prod-4', name: 'Suzuki Ertiga', image: '/images/ertiga.jpg' },
      { id: 'prod-5', name: 'Mitsubishi Xpander', image: '/images/xpander.jpg' }
    ];
    
    const sampleReviews = [
      {
        title: 'Mobil keluarga yang sangat nyaman',
        content: 'Saya sangat puas dengan pembelian mobil ini. Kabin luas, mesin responsif, dan fitur keselamatan lengkap. Sangat cocok untuk keluarga besar.',
        rating: 5,
        sentiment: 'positive' as const
      },
      {
        title: 'Pelayanan showroom kurang memuaskan',
        content: 'Mobilnya bagus tapi pelayanan di showroom agak mengecewakan. Sales kurang informatif dan proses administrasi lama.',
        rating: 3,
        sentiment: 'neutral' as const
      },
      {
        title: 'Kualitas tidak sesuai harga',
        content: 'Untuk harga segini, kualitas interior masih kurang. Banyak plastik keras dan finishing kurang rapi.',
        rating: 2,
        sentiment: 'negative' as const
      },
      {
        title: 'Recommended untuk first car',
        content: 'Mobil pertama yang sempurna! Irit BBM, mudah dikendarai, dan spare part mudah dicari. Harga juga terjangkau.',
        rating: 4,
        sentiment: 'positive' as const
      },
      {
        title: 'After sales service excellent',
        content: 'Service center responsif, teknisi berpengalaman, dan harga service wajar. Sangat puas dengan layanan purna jual.',
        rating: 5,
        sentiment: 'positive' as const
      }
    ];
    
    for (let i = 0; i < 25; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      mockData.push({
        id: `review-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        userName: `Customer ${i + 1}`,
        userAvatar: `/images/avatar-${(i % 5) + 1}.jpg`,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: Math.random() > 0.7 ? [`/images/review-${i + 1}-1.jpg`, `/images/review-${i + 1}-2.jpg`] : [],
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
        status: ['pending', 'approved', 'rejected', 'edited'][Math.floor(Math.random() * 4)] as 'pending' | 'approved' | 'rejected' | 'edited',
        reportCount: Math.floor(Math.random() * 5),
        helpfulCount: Math.floor(Math.random() * 50),
        category: ['product', 'service', 'delivery', 'general'][Math.floor(Math.random() * 4)] as 'product' | 'service' | 'delivery' | 'general',
        sentiment: review.sentiment,
        isVerifiedPurchase: Math.random() > 0.3,
        moderatorId: Math.random() > 0.5 ? 'moderator-1' : undefined,
        moderatorName: Math.random() > 0.5 ? 'Admin Moderator' : undefined,
        moderationReason: Math.random() > 0.5 ? 'Sesuai dengan kebijakan komunitas' : undefined,
        moderationDate: Math.random() > 0.5 ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }
    
    return mockData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const calculateStatistik = (ulasan: DataUlasan[]): StatistikModerasi => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const approvedToday = ulasan.filter(u => 
      u.status === 'approved' && 
      u.moderationDate && 
      new Date(u.moderationDate) >= today
    ).length;
    
    const rejectedToday = ulasan.filter(u => 
      u.status === 'rejected' && 
      u.moderationDate && 
      new Date(u.moderationDate) >= today
    ).length;
    
    const totalRating = ulasan.reduce((sum, u) => sum + u.rating, 0);
    const averageRating = ulasan.length > 0 ? totalRating / ulasan.length : 0;
    
    return {
      totalUlasan: ulasan.length,
      pendingReview: ulasan.filter(u => u.status === 'pending').length,
      approvedToday,
      rejectedToday,
      averageRating,
      reportedReviews: ulasan.filter(u => u.reportCount > 0).length,
      verifiedPurchases: ulasan.filter(u => u.isVerifiedPurchase).length,
      responseTime: Math.floor(Math.random() * 24) + 1 // Mock response time in hours
    };
  };

  // Handler functions
  const handleModerationAction = (action: 'approve' | 'reject' | 'edit') => {
    setModerationAction(action);
    setShowModerationModal(true);
  };

  const handleConfirmModeration = () => {
    if (!selectedUlasan) return;
    
    switch (moderationAction) {
      case 'approve':
        setujuiUlasan(selectedUlasan.id, moderationReason);
        break;
      case 'reject':
        tolakUlasan(selectedUlasan.id, moderationReason);
        break;
      case 'edit':
        setShowModerationModal(false);
        setShowEditModal(true);
        break;
    }
  };

  const handleConfirmEdit = () => {
    if (!selectedUlasan) return;
    editUlasan(selectedUlasan.id, editedContent, moderationReason);
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
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'edited': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#28a745';
      case 'neutral': return '#ffc107';
      case 'negative': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return 'fas fa-car';
      case 'service': return 'fas fa-tools';
      case 'delivery': return 'fas fa-truck';
      case 'general': return 'fas fa-comment';
      default: return 'fas fa-comment';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? 'filled' : 'empty'}`}
      />
    ));
  };

  // Filter data
  const filteredUlasan = dataUlasan.filter(ulasan => {
    const matchSearch = ulasan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ulasan.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ulasan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ulasan.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = !filter.status || ulasan.status === filter.status;
    const matchCategory = !filter.category || ulasan.category === filter.category;
    const matchRating = !filter.rating || ulasan.rating.toString() === filter.rating;
    const matchSentiment = !filter.sentiment || ulasan.sentiment === filter.sentiment;
    const matchVerified = filter.isVerifiedPurchase === null || ulasan.isVerifiedPurchase === filter.isVerifiedPurchase;
    
    return matchSearch && matchStatus && matchCategory && matchRating && matchSentiment && matchVerified;
  });

  // Sort data
  const sortedUlasan = [...filteredUlasan].sort((a, b) => {
    const aValue = a[filter.sortBy as keyof DataUlasan];
    const bValue = b[filter.sortBy as keyof DataUlasan];
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    if (filter.sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUlasan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUlasan.length / itemsPerPage);

  // Effects
  useEffect(() => {
    aksesDashboardModerasi();
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
    <div className="dashboard-moderasi">
      <div className="header-section">
        <div className="header-content">
          <h1>Dashboard Moderasi</h1>
          <p>Kelola dan moderasi ulasan customer untuk menjaga kualitas konten</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={cekLanjutModerasi}>
            <i className="fas fa-check-circle"></i>
            Cek Progress
          </button>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i>
            Refresh Data
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

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memproses moderasi ulasan...</p>
        </div>
      )}

      {!statusHalaman.loading && (
        <>
          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.totalUlasan}</h3>
                <p>Total Ulasan</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.pendingReview}</h3>
                <p>Menunggu Review</p>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon">
                <i className="fas fa-check"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.approvedToday}</h3>
                <p>Disetujui Hari Ini</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon">
                <i className="fas fa-times"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.rejectedToday}</h3>
                <p>Ditolak Hari Ini</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.averageRating.toFixed(1)}</h3>
                <p>Rating Rata-rata</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{statistikModerasi.verifiedPurchases}</h3>
                <p>Verified Purchase</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="search-group">
              <div className="search-input">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Cari ulasan, produk, atau customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-controls">
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="edited">Edited</option>
              </select>
              
              <select
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Semua Kategori</option>
                <option value="product">Produk</option>
                <option value="service">Layanan</option>
                <option value="delivery">Pengiriman</option>
                <option value="general">Umum</option>
              </select>
              
              <select
                value={filter.rating}
                onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value }))}
              >
                <option value="">Semua Rating</option>
                <option value="5">5 Bintang</option>
                <option value="4">4 Bintang</option>
                <option value="3">3 Bintang</option>
                <option value="2">2 Bintang</option>
                <option value="1">1 Bintang</option>
              </select>
              
              <select
                value={filter.sentiment}
                onChange={(e) => setFilter(prev => ({ ...prev, sentiment: e.target.value }))}
              >
                <option value="">Semua Sentiment</option>
                <option value="positive">Positif</option>
                <option value="neutral">Netral</option>
                <option value="negative">Negatif</option>
              </select>
              
              <select
                value={filter.isVerifiedPurchase === null ? '' : filter.isVerifiedPurchase.toString()}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  isVerifiedPurchase: e.target.value === '' ? null : e.target.value === 'true' 
                }))}
              >
                <option value="">Semua Purchase</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {currentItems.map(ulasan => (
              <div key={ulasan.id} className="review-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {ulasan.userAvatar ? (
                        <img src={ulasan.userAvatar} alt={ulasan.userName} />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>
                    <div className="user-details">
                      <h4>{ulasan.userName}</h4>
                      <div className="user-meta">
                        <span>{formatDate(ulasan.createdAt)}</span>
                        {ulasan.isVerifiedPurchase && (
                          <span className="verified-badge">
                            <i className="fas fa-check-circle"></i>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ulasan.status) }}
                    >
                      {ulasan.status}
                    </span>
                    <span 
                      className="sentiment-badge"
                      style={{ backgroundColor: getSentimentColor(ulasan.sentiment) }}
                    >
                      {ulasan.sentiment}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="product-info">
                    <div className="product-image">
                      {ulasan.productImage ? (
                        <img src={ulasan.productImage} alt={ulasan.productName} />
                      ) : (
                        <i className="fas fa-car"></i>
                      )}
                    </div>
                    <div className="product-details">
                      <h5>{ulasan.productName}</h5>
                      <div className="rating">
                        {renderStars(ulasan.rating)}
                        <span className="rating-text">({ulasan.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <h4>{ulasan.title}</h4>
                    <p>{ulasan.content}</p>
                    
                    {ulasan.images.length > 0 && (
                      <div className="review-images">
                        {ulasan.images.map((image, index) => (
                          <img key={index} src={image} alt={`Review ${index + 1}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="review-meta">
                    <div className="meta-item">
                      <i className={getCategoryIcon(ulasan.category)}></i>
                      <span>{ulasan.category}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-thumbs-up"></i>
                      <span>{ulasan.helpfulCount} helpful</span>
                    </div>
                    {ulasan.reportCount > 0 && (
                      <div className="meta-item report">
                        <i className="fas fa-flag"></i>
                        <span>{ulasan.reportCount} reports</span>
                      </div>
                    )}
                  </div>
                  
                  {ulasan.moderatorName && (
                    <div className="moderation-info">
                      <p><strong>Dimoderasi oleh:</strong> {ulasan.moderatorName}</p>
                      <p><strong>Tanggal:</strong> {ulasan.moderationDate && formatDate(ulasan.moderationDate)}</p>
                      {ulasan.moderationReason && (
                        <p><strong>Alasan:</strong> {ulasan.moderationReason}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  <button 
                    className="btn-detail"
                    onClick={() => pilihUlasanUntukDitinjau(ulasan.id)}
                  >
                    <i className="fas fa-eye"></i>
                    Detail
                  </button>
                  
                  {ulasan.status === 'pending' && (
                    <>
                      <button 
                        className="btn-approve"
                        onClick={() => {
                          setSelectedUlasan(ulasan);
                          handleModerationAction('approve');
                        }}
                      >
                        <i className="fas fa-check"></i>
                        Setujui
                      </button>
                      <button 
                        className="btn-edit"
                        onClick={() => {
                          setSelectedUlasan(ulasan);
                          handleModerationAction('edit');
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          setSelectedUlasan(ulasan);
                          handleModerationAction('reject');
                        }}
                      >
                        <i className="fas fa-times"></i>
                        Tolak
                      </button>
                    </>
                  )}
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
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUlasan && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Detail Ulasan</h2>
              <button 
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="review-detail">
                <div className="detail-section">
                  <h3>Informasi Customer</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Nama:</span>
                      <strong>{selectedUlasan.userName}</strong>
                    </div>
                    <div className="detail-item">
                      <span>User ID:</span>
                      <strong>{selectedUlasan.userId}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Verified Purchase:</span>
                      <strong>{selectedUlasan.isVerifiedPurchase ? 'Ya' : 'Tidak'}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Informasi Produk</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Produk:</span>
                      <strong>{selectedUlasan.productName}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Rating:</span>
                      <div className="rating">
                        {renderStars(selectedUlasan.rating)}
                        <span>({selectedUlasan.rating}/5)</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span>Kategori:</span>
                      <strong>{selectedUlasan.category}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Konten Ulasan</h3>
                  <div className="review-content-detail">
                    <h4>{selectedUlasan.title}</h4>
                    <p>{selectedUlasan.content}</p>
                    
                    {selectedUlasan.originalContent && (
                      <div className="original-content">
                        <h5>Konten Asli:</h5>
                        <p>{selectedUlasan.originalContent}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Statistik</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Helpful Count:</span>
                      <strong>{selectedUlasan.helpfulCount}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Report Count:</span>
                      <strong>{selectedUlasan.reportCount}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Sentiment:</span>
                      <span 
                        className="sentiment-badge"
                        style={{ backgroundColor: getSentimentColor(selectedUlasan.sentiment) }}
                      >
                        {selectedUlasan.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              {selectedUlasan.status === 'pending' && (
                <>
                  <button 
                    className="btn-approve"
                    onClick={() => handleModerationAction('approve')}
                  >
                    <i className="fas fa-check"></i>
                    Setujui
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleModerationAction('edit')}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleModerationAction('reject')}
                  >
                    <i className="fas fa-times"></i>
                    Tolak
                  </button>
                </>
              )}
              <button 
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {moderationAction === 'approve' && 'Setujui Ulasan'}
                {moderationAction === 'reject' && 'Tolak Ulasan'}
                {moderationAction === 'edit' && 'Edit Ulasan'}
              </h2>
              <button 
                className="btn-close"
                onClick={() => setShowModerationModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Alasan Moderasi *</label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Masukkan alasan untuk keputusan moderasi..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="moderation-info">
                <p><strong>Ulasan:</strong> {selectedUlasan?.title}</p>
                <p><strong>Customer:</strong> {selectedUlasan?.userName}</p>
                <p><strong>Produk:</strong> {selectedUlasan?.productName}</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowModerationModal(false)}
              >
                Batal
              </button>
              <button 
                className={`btn-${moderationAction === 'reject' ? 'reject' : 'primary'}`}
                onClick={handleConfirmModeration}
                disabled={!moderationReason.trim()}
              >
                <i className={`fas fa-${moderationAction === 'approve' ? 'check' : moderationAction === 'reject' ? 'times' : 'edit'}`}></i>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUlasan && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Edit Ulasan</h2>
              <button 
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Judul Ulasan *</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Masukkan judul ulasan..."
                />
              </div>
              
              <div className="form-group">
                <label>Konten Ulasan *</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Masukkan konten ulasan yang telah diedit..."
                  rows={6}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Alasan Edit *</label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Masukkan alasan mengapa ulasan perlu diedit..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="original-content">
                <h4>Konten Asli:</h4>
                <div className="original-text">
                  <h5>{selectedUlasan.title}</h5>
                  <p>{selectedUlasan.content}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmEdit}
                disabled={!editedContent.trim() || !editedTitle.trim() || !moderationReason.trim()}
              >
                <i className="fas fa-save"></i>
                Simpan Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardModerasi;