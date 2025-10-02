import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import KontrollerArtikel from '../controllers/KontrollerArtikel';
import { DataArtikel, KategoriArtikel as KategoriArtikelType, KomentarArtikel as KomentarArtikelType } from '../controllers/KontrollerArtikel';

// Interface untuk artikel
interface Artikel {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  tags: string[];
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  shares: number;
  isBookmarked: boolean;
  isLiked: boolean;
  comments: KomentarArtikel[];
}

// Interface untuk kategori artikel
interface KategoriArtikel {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  articleCount: number;
}

// Interface untuk komentar artikel
interface KomentarArtikel {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: KomentarArtikel[];
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  artikel: DataArtikel[];
  selectedArticle: DataArtikel | null;
  kategori: KategoriArtikelType[];
  selectedCategory: string | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  showCommentForm: boolean;
  commentText: string;
  submittingComment: boolean;
}

const HalamanArtikel: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const kontrollerArtikel = new KontrollerArtikel();

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: true,
    error: null,
    artikel: [],
    selectedArticle: null,
    kategori: [],
    selectedCategory: searchParams.get('category'),
    searchQuery: searchParams.get('search') || '',
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    showCommentForm: false,
    commentText: '',
    submittingComment: false
  });

  /**
   * Akses menu artikel - memuat daftar artikel dan kategori
   */
  const aksesMenuArtikel = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await kontrollerArtikel.muatHalamanArtikel(
        state.currentPage,
        12, // articles per page
        {
          kategori: state.selectedCategory ? [state.selectedCategory] : undefined,
          search: state.searchQuery || undefined,
          status: ['published']
        }
      );

      setState(prev => ({
        ...prev,
        loading: false,
        artikel: result.artikel,
        kategori: result.kategori,
        totalPages: Math.ceil(result.total / 12)
      }));

    } catch (error) {
      console.error('Error accessing article menu:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat artikel. Silakan coba lagi.'
      }));
    }
  }, [state.currentPage, state.selectedCategory, state.searchQuery]);

  /**
   * Pilih kategori artikel
   * @param kategori - Slug kategori yang dipilih
   */
  const pilihKategoriArtikel = useCallback((kategori: string | null) => {
    setState(prev => ({
      ...prev,
      selectedCategory: kategori,
      currentPage: 1
    }));

    // Update URL parameters
    const newParams = new URLSearchParams(searchParams);
    if (kategori) {
      newParams.set('category', kategori);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);

  }, [searchParams, setSearchParams]);

  /**
   * Pilih artikel untuk dibaca
   * @param idArtikel - ID artikel yang dipilih
   */
  const pilihArtikel = useCallback(async (idArtikel: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const artikel = await kontrollerArtikel.muatDetailArtikel(idArtikel);
      
      if (artikel) {
        setState(prev => ({
          ...prev,
          selectedArticle: artikel,
          loading: false
        }));

        // Navigate to article detail page
        navigate(`/artikel/${artikel.slug}`);
      } else {
        throw new Error('Artikel tidak ditemukan');
      }

    } catch (error) {
      console.error('Error selecting article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat artikel. Silakan coba lagi.'
      }));
    }
  }, [navigate]);

  /**
   * Share artikel ke platform media sosial
   * @param idArtikel - ID artikel yang akan dishare
   */
  const shareArtikel = useCallback(async (idArtikel: string) => {
    try {
      const result = await kontrollerArtikel.prosesShareArtikel(idArtikel, 'facebook');
      
      if (result.success && result.shareUrl) {
        // Open share dialog
        const shareDialog = window.confirm(
          'Artikel akan dibagikan ke Facebook. Lanjutkan?'
        );
        
        if (shareDialog) {
          window.open(result.shareUrl, '_blank', 'width=600,height=400');
          
          // Update share count in UI
          setState(prev => ({
            ...prev,
            artikel: prev.artikel.map(article =>
              article.id === idArtikel
                ? { ...article, shares: article.shares + 1 }
                : article
            ),
            selectedArticle: prev.selectedArticle?.id === idArtikel
              ? { ...prev.selectedArticle, shares: prev.selectedArticle.shares + 1 }
              : prev.selectedArticle
          }));
        }
      }

    } catch (error) {
      console.error('Error sharing article:', error);
      alert('Gagal membagikan artikel. Silakan coba lagi.');
    }
  }, []);

  /**
   * Bookmark artikel untuk user
   * @param idArtikel - ID artikel yang akan dibookmark
   * @param idUser - ID user yang membookmark
   */
  const bookmarkArtikel = useCallback(async (idArtikel: string, idUser: string) => {
    try {
      const result = await kontrollerArtikel.toggleBookmarkArtikel(idArtikel);
      
      if (result.success) {
        // Update bookmark status in UI
        setState(prev => ({
          ...prev,
          artikel: prev.artikel.map(article =>
            article.id === idArtikel
              ? { ...article, isBookmarked: !article.isBookmarked }
              : article
          ),
          selectedArticle: prev.selectedArticle?.id === idArtikel
            ? { ...prev.selectedArticle, isBookmarked: !prev.selectedArticle.isBookmarked }
            : prev.selectedArticle
        }));

        // Show success message
        const message = result.isBookmarked 
          ? 'Artikel berhasil ditambahkan ke bookmark'
          : 'Artikel berhasil dihapus dari bookmark';
        
        // You can replace this with a toast notification
        alert(message);
      }

    } catch (error) {
      console.error('Error bookmarking article:', error);
      alert('Gagal memproses bookmark. Silakan coba lagi.');
    }
  }, []);

  /**
   * Tulis komentar pada artikel
   * @param idArtikel - ID artikel yang akan dikomentari
   * @param isiKomentar - Isi komentar yang akan ditulis
   */
  const tulisKomentar = useCallback(async (idArtikel: string, isiKomentar: string) => {
    if (!isiKomentar.trim()) {
      alert('Komentar tidak boleh kosong');
      return;
    }

    try {
      setState(prev => ({ ...prev, submittingComment: true }));

      const result = await kontrollerArtikel.tambahKomentar(idArtikel, {
        nama: 'Anonymous', // You might want to get this from user context
        email: 'user@example.com', // You might want to get this from user context
        konten: isiKomentar.trim(),
        parentId: undefined // For main comment, not reply
      });

      if (result.success && result.komentarId) {
        // Create new comment object for UI
        const newComment: KomentarArtikelType = {
          id: result.komentarId,
          nama: 'Anonymous',
          email: 'user@example.com',
          konten: isiKomentar.trim(),
          tanggal: new Date().toISOString(),
          status: 'pending',
          likes: 0,
          parentId: undefined,
          replies: []
        };
        
        setState(prev => ({
          ...prev,
          selectedArticle: prev.selectedArticle ? {
            ...prev.selectedArticle,
            komentar: [newComment, ...prev.selectedArticle.komentar]
          } : prev.selectedArticle,
          commentText: '',
          showCommentForm: false,
          submittingComment: false
        }));

        alert('Komentar berhasil ditambahkan');
      }

    } catch (error) {
      console.error('Error adding comment:', error);
      setState(prev => ({ ...prev, submittingComment: false }));
      alert('Gagal menambahkan komentar. Silakan coba lagi.');
    }
  }, []);

  /**
   * Handle search artikel
   */
  const handleSearch = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }));

    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  /**
   * Like artikel
   */
  const handleLikeArtikel = useCallback(async (idArtikel: string) => {
    try {
      const result = await kontrollerArtikel.likeArtikel(idArtikel);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          artikel: prev.artikel.map(article =>
            article.id === idArtikel
              ? { 
                  ...article, 
                  isLiked: !article.isLiked,
                  likes: article.isLiked ? article.likes - 1 : article.likes + 1
                }
              : article
          ),
          selectedArticle: prev.selectedArticle?.id === idArtikel
            ? { 
                ...prev.selectedArticle, 
                isLiked: !prev.selectedArticle.isLiked,
                likes: prev.selectedArticle.isLiked 
                  ? prev.selectedArticle.likes - 1 
                  : prev.selectedArticle.likes + 1
              }
            : prev.selectedArticle
        }));
      }

    } catch (error) {
      console.error('Error liking article:', error);
    }
  }, []);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (slug) {
      // If we have a slug, load specific article
      const artikel = state.artikel.find(a => a.slug === slug);
      if (artikel) {
        pilihArtikel(artikel.id);
      } else {
        // Load article by slug from API
        kontrollerArtikel.muatDetailArtikel(slug).then(artikel => {
          if (artikel) {
            setState(prev => ({ ...prev, selectedArticle: artikel }));
          } else {
            navigate('/artikel', { replace: true });
          }
        });
      }
    } else {
      // Load article list
      aksesMenuArtikel();
    }
  }, [slug, aksesMenuArtikel, pilihArtikel]);

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Render article detail view
  if (state.selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/artikel')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Artikel
          </button>

          {/* Article header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <img
              src={state.selectedArticle.gambarUtama}
              alt={state.selectedArticle.judul}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: state.selectedArticle.kategori.warna }}
                >
                  {state.selectedArticle.kategori.nama}
                </span>
                <span className="ml-4 text-gray-500 text-sm">
                  {new Date(state.selectedArticle.tanggalPublish).toLocaleDateString('id-ID')}
                </span>
                <span className="ml-4 text-gray-500 text-sm">
                  {state.selectedArticle.readingTime} menit baca
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {state.selectedArticle.judul}
              </h1>

              <div className="flex items-center mb-6">
                <img
                  src={state.selectedArticle.penulis.avatar}
                  alt={state.selectedArticle.penulis.nama}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">{state.selectedArticle.penulis.nama}</p>
                  <p className="text-sm text-gray-500">{state.selectedArticle.penulis.bio}</p>
                </div>
              </div>

              {/* Article actions */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <button
                  onClick={() => handleLikeArtikel(state.selectedArticle!.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    state.selectedArticle.isLiked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{state.selectedArticle.likes}</span>
                </button>

                <button
                  onClick={() => shareArtikel(state.selectedArticle!.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>{state.selectedArticle.shares}</span>
                </button>

                <button
                  onClick={() => bookmarkArtikel(state.selectedArticle!.id, 'current-user-id')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    state.selectedArticle.isBookmarked
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <span>Bookmark</span>
                </button>
              </div>

              {/* Article content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: state.selectedArticle.konten }}
              />

              {/* Tags */}
              {state.selectedArticle.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {state.selectedArticle.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Komentar ({state.selectedArticle.komentar.length})
              </h3>
              <button
                onClick={() => setState(prev => ({ ...prev, showCommentForm: !prev.showCommentForm }))}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tulis Komentar
              </button>
            </div>

            {/* Comment form */}
            {state.showCommentForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={state.commentText}
                  onChange={(e) => setState(prev => ({ ...prev, commentText: e.target.value }))}
                  placeholder="Tulis komentar Anda..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex justify-end space-x-3 mt-3">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showCommentForm: false, commentText: '' }))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => tulisKomentar(state.selectedArticle!.id, state.commentText)}
                    disabled={state.submittingComment || !state.commentText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.submittingComment ? 'Mengirim...' : 'Kirim Komentar'}
                  </button>
                </div>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              {state.selectedArticle.komentar.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.avatar || '/default-avatar.png'}
                      alt={comment.nama}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800">{comment.nama}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.tanggal).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.konten}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <button className="text-gray-500 hover:text-blue-600 transition-colors">
                          👍 {comment.likes}
                        </button>
                        <button className="text-gray-500 hover:text-blue-600 transition-colors">
                          Balas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render article list view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Artikel Otomotif</h1>
          <p className="text-gray-600">
            Temukan artikel terbaru seputar dunia otomotif, tips, dan panduan lengkap
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari artikel..."
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => pilihKategoriArtikel(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !state.selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {state.kategori.map((category) => (
                <button
                  key={category.id}
                  onClick={() => pilihKategoriArtikel(category.slug)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    state.selectedCategory === category.slug
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: state.selectedCategory === category.slug ? category.warna : undefined
                  }}
                >
                  {category.nama} ({category.jumlahArtikel})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {state.artikel.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => pilihArtikel(article.id)}
            >
              <img
                src={article.gambarUtama}
                alt={article.judul}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: article.kategori.warna }}
                  >
                    {article.kategori.nama}
                  </span>
                  <span className="ml-3 text-gray-500 text-sm">
                    {article.readingTime} menit baca
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {article.judul}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.ringkasan}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👁️ {article.views}</span>
                    <span>❤️ {article.likes}</span>
                    <span>📤 {article.shares}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        bookmarkArtikel(article.id, 'current-user-id');
                      }}
                      className={`p-1 rounded ${
                        article.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArtikel(article.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-blue-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: state.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-lg ${
                    page === state.currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === state.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanArtikel;