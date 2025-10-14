import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import KontrollerArtikel from '../controllers/KontrollerArtikel';
import { DataArtikel, KategoriArtikel as KategoriArtikelType } from '../controllers/KontrollerArtikel';

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
    totalPages: 1
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
          status: ['published'],
          search: state.searchQuery || undefined
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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

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
            setState(prev => ({ ...prev, selectedArticle: artikel, loading: false }));
          } else {
            navigate('/artikel', { replace: true });
          }
        });
      }
    } else {
      // Load article list
      aksesMenuArtikel();
    }
  }, [slug, state.currentPage, state.selectedCategory, state.searchQuery]);

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
            {state.selectedArticle.gambarUtama && (
              <img
                src={state.selectedArticle.gambarUtama}
                alt={state.selectedArticle.judul}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-4 flex-wrap gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: state.selectedArticle.kategori.warna }}
                >
                  {state.selectedArticle.kategori.nama}
                </span>
                <span className="text-gray-500 text-sm">
                  {kontrollerArtikel.formatTanggal(state.selectedArticle.tanggalPublish)}
                </span>
                <span className="text-gray-500 text-sm">
                  {kontrollerArtikel.formatReadingTime(state.selectedArticle.readingTime)}
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {state.selectedArticle.views} views
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {state.selectedArticle.judul}
              </h1>

              {state.selectedArticle.ringkasan && (
                <p className="text-lg text-gray-600 mb-6">
                  {state.selectedArticle.ringkasan}
                </p>
              )}

              <div className="flex items-center mb-6 pb-6 border-b">
                {state.selectedArticle.penulis.avatar && (
                  <img
                    src={state.selectedArticle.penulis.avatar}
                    alt={state.selectedArticle.penulis.nama}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-800">{state.selectedArticle.penulis.nama}</p>
                  {state.selectedArticle.penulis.jabatan && (
                    <p className="text-sm text-gray-500">{state.selectedArticle.penulis.jabatan}</p>
                  )}
                </div>
              </div>

              {/* Article content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg"
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
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
                        onClick={() => {
                          handleSearch(tag);
                          navigate('/artikel');
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery images */}
              {state.selectedArticle.galeriGambar.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Galeri</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {state.selectedArticle.galeriGambar.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Galeri ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Artikel Otomotif</h1>
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
          </div>
          
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
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
                {category.nama}
              </button>
            ))}
          </div>
        </div>

        {/* No results */}
        {state.artikel.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada artikel ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter kategori</p>
          </div>
        )}

        {/* Articles grid */}
        {state.artikel.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {state.artikel.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => pilihArtikel(article.id)}
              >
                {article.gambarUtama && (
                  <img
                    src={article.gambarUtama}
                    alt={article.judul}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center mb-3 flex-wrap gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: article.kategori.warna }}
                    >
                      {article.kategori.nama}
                    </span>
                    {article.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        ⭐ Featured
                      </span>
                    )}
                    {article.trending && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        🔥 Trending
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {article.judul}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.ringkasan}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {article.readingTime} min
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.views}
                      </span>
                    </div>
                    <span className="text-xs">
                      {kontrollerArtikel.formatTanggal(article.tanggalPublish)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Sebelumnya
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(state.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (state.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (state.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (state.currentPage >= state.totalPages - 2) {
                  pageNum = state.totalPages - 4 + i;
                } else {
                  pageNum = state.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      pageNum === state.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === state.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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