import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import KontrollerArtikel, { 
  DataArtikel, 
  KategoriArtikel, 
  InputArtikel,
  ResponseArtikel 
} from '../controllers/KontrollerArtikel';
import { uploadService } from '../services/UploadService';

interface FormArtikel {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: number;
  featured_image: string;
  featured_image_alt: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  is_featured: boolean;
  is_pinned: boolean;
  visibility: 'public' | 'private' | 'members_only';
  reading_time_minutes: number;
  published_at?: string;
  gallery_images: string[];
}

interface StateKelolaArtikel {
  articles: DataArtikel[];
  categories: KategoriArtikel[];
  loading: boolean;
  error: string | null;
  success: string | null;
  showModal: boolean;
  modalMode: 'create' | 'edit' | 'view' | 'delete';
  selectedArticle: DataArtikel | null;
  formData: FormArtikel;
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  searchQuery: string;
  filterStatus: string;
  filterCategory: string;
  sortBy: string;
  uploadingImage: boolean;
  imagePreview: string | null;
}

const HalamanKelolaArtikel: React.FC = () => {
  const kontrollerArtikel = new KontrollerArtikel();

  const initialFormData: FormArtikel = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: 0,
    featured_image: '',
    featured_image_alt: '',
    meta_title: '',
    meta_description: '',
    seo_keywords: '',
    status: 'draft',
    is_featured: false,
    is_pinned: false,
    visibility: 'public',
    reading_time_minutes: 0,
    gallery_images: []
  };

  const [state, setState] = useState<StateKelolaArtikel>({
    articles: [],
    categories: [],
    loading: false,
    error: null,
    success: null,
    showModal: false,
    modalMode: 'create',
    selectedArticle: null,
    formData: initialFormData,
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    searchQuery: '',
    filterStatus: '',
    filterCategory: '',
    sortBy: 'terbaru',
    uploadingImage: false,
    imagePreview: null
  });

  const loadData = async () => {
    try {
      console.log('🔄 loadData dipanggil');
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await kontrollerArtikel.muatHalamanArtikel(
        state.currentPage,
        12,
        {
          kategori: state.filterCategory ? [state.filterCategory] : undefined,
          status: state.filterStatus ? [state.filterStatus] : undefined,
          search: state.searchQuery || undefined
        },
        state.sortBy,
        state.searchQuery
      );

      console.log('📊 Data artikel diterima:', result.artikel.length);

      setState(prev => ({
        ...prev,
        articles: result.artikel,
        categories: result.kategori,
        totalArticles: result.total,
        totalPages: Math.ceil(result.total / 12),
        loading: false
      }));

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data artikel'
      }));
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - loading data');
    loadData();
  }, [state.currentPage, state.filterStatus, state.filterCategory, state.searchQuery, state.sortBy]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  const handleInputChange = (field: keyof FormArtikel, value: any) => {
    setState(prev => {
      const updates: any = { [field]: value };

      if (field === 'title') {
        updates.slug = kontrollerArtikel.generateSlug(value);
        updates.meta_title = value;
      }

      if (field === 'content') {
        updates.reading_time_minutes = kontrollerArtikel.calculateReadingTime(value);
      }

      if (field === 'excerpt') {
        updates.meta_description = value;
      }

      return {
        ...prev,
        formData: {
          ...prev.formData,
          ...updates
        }
      };
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setState(prev => ({ ...prev, uploadingImage: true, error: null }));

      const result = await uploadService.uploadImage(file, {
        folder: 'featured',
        maxSizeKB: 5120,
        quality: 0.8
      });

      if (result.success && result.url) {
        setState(prev => ({
          ...prev,
          uploadingImage: false,
          imagePreview: result.url || null,
          formData: {
            ...prev.formData,
            featured_image: result.url || '',
            featured_image_alt: prev.formData.title || 'Article image'
          }
        }));
      } else {
        setState(prev => ({
          ...prev,
          uploadingImage: false,
          error: result.error || 'Gagal mengupload gambar'
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setState(prev => ({
        ...prev,
        uploadingImage: false,
        error: 'Terjadi kesalahan saat upload gambar'
      }));
    }
  };

  const removeUploadedImage = () => {
    setState(prev => ({
      ...prev,
      imagePreview: null,
      formData: {
        ...prev.formData,
        featured_image: '',
        featured_image_alt: ''
      }
    }));
  };

  const openModal = (mode: 'create' | 'edit' | 'view' | 'delete', article?: DataArtikel) => {
    setState(prev => ({
      ...prev,
      showModal: true,
      modalMode: mode,
      selectedArticle: article || null,
      error: null,
      success: null,
      imagePreview: article?.gambarUtama || null,
      formData: article ? {
        id: article.id,
        title: article.judul,
        slug: article.slug,
        excerpt: article.ringkasan,
        content: article.konten,
        category_id: parseInt(article.kategori.id),
        featured_image: article.gambarUtama,
        featured_image_alt: article.judul,
        meta_title: article.metaTitle,
        meta_description: article.metaDescription,
        seo_keywords: article.seoKeywords,
        status: article.status,
        is_featured: article.featured,
        is_pinned: article.isPinned,
        visibility: article.visibility,
        reading_time_minutes: article.readingTime,
        published_at: article.status === 'published' ? article.tanggalPublish : undefined,
        gallery_images: article.galeriGambar
      } : initialFormData
    }));
  };

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      showModal: false,
      selectedArticle: null,
      formData: initialFormData,
      error: null,
      imagePreview: null
    }));
  };

  const saveArticle = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const articleInput: InputArtikel = {
        title: state.formData.title,
        slug: state.formData.slug,
        excerpt: state.formData.excerpt,
        content: state.formData.content,
        category_id: state.formData.category_id,
        author_id: user.id,
        featured_image: state.formData.featured_image,
        featured_image_alt: state.formData.featured_image_alt,
        gallery_images: state.formData.gallery_images,
        meta_title: state.formData.meta_title,
        meta_description: state.formData.meta_description,
        seo_keywords: state.formData.seo_keywords,
        status: state.formData.status,
        is_featured: state.formData.is_featured,
        is_pinned: state.formData.is_pinned,
        visibility: state.formData.visibility,
        reading_time_minutes: state.formData.reading_time_minutes,
        published_at: state.formData.status === 'published' ? new Date().toISOString() : null
      };

      let response: ResponseArtikel<DataArtikel>;

      if (state.modalMode === 'edit' && state.formData.id) {
        response = await kontrollerArtikel.perbaruiArtikel(state.formData.id, articleInput);
      } else {
        response = await kontrollerArtikel.buatArtikel(articleInput);
      }

      if (response.success) {
        kontrollerArtikel.clearCache();
        
        setState(prev => ({
          ...prev,
          loading: false,
          success: response.message,
          showModal: false,
          formData: initialFormData,
          imagePreview: null
        }));
        
        await loadData();
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message
        }));
      }
      
    } catch (error) {
      console.error('Error saving article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menyimpan artikel'
      }));
    }
  };

  const deleteArticle = async () => {
    if (!state.selectedArticle) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response: ResponseArtikel<void> = await kontrollerArtikel.hapusArtikel(state.selectedArticle.id);

      if (response.success) {
        kontrollerArtikel.clearCache();
        
        setState(prev => ({
          ...prev,
          loading: false,
          success: response.message,
          showModal: false
        }));
        
        await loadData();
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message
        }));
      }
      
    } catch (error) {
      console.error('Error deleting article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menghapus artikel'
      }));
    }
  };

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }));
  };

  const handleFilterChange = (type: 'status' | 'category' | 'sort', value: string) => {
    setState(prev => ({
      ...prev,
      [type === 'status' ? 'filterStatus' : type === 'category' ? 'filterCategory' : 'sortBy']: value,
      currentPage: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
              <p className="mt-2 text-gray-600">Manajemen artikel dan konten website</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Tambah Artikel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cari artikel..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={state.filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={state.filterCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.nama}
                </option>
              ))}
            </select>

            <select
              value={state.sortBy}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="terpopuler">Terpopuler</option>
              <option value="alfabetis">Alfabetis</option>
            </select>
          </div>
        </div>

        {/* Success Message */}
        {state.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800">{state.success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{state.error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {state.loading && !state.showModal && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        )}

        {/* Articles Table */}
        {!state.loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Artikel</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Kategori</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Status</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Views</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Tanggal</th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.articles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4">Tidak ada artikel ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    state.articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4">
                          <div className="flex items-center">
                            {article.gambarUtama && (
                              <img
                                src={article.gambarUtama}
                                alt={article.judul}
                                className="h-10 w-10 rounded-lg object-cover mr-3 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {article.judul}
                                {article.featured && (
                                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{article.ringkasan.substring(0, 60)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-20"
                            style={{ backgroundColor: article.kategori.warna + '20', color: article.kategori.warna }}
                            title={article.kategori.nama}
                          >
                            {article.kategori.nama.length > 8 ? article.kategori.nama.substring(0, 8) + '...' : article.kategori.nama}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(article.status)}`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-900">{article.views > 999 ? (article.views / 1000).toFixed(1) + 'k' : article.views}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(article.tanggalPublish).toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs font-medium">
                          <div className="flex flex-col space-y-1">
                            <button onClick={() => openModal('view', article)} className="text-blue-600 hover:text-blue-900 text-left">Lihat</button>
                            <button onClick={() => openModal('edit', article)} className="text-indigo-600 hover:text-indigo-900 text-left">Edit</button>
                            <button onClick={() => openModal('delete', article)} className="text-red-600 hover:text-red-900 text-left">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((state.currentPage - 1) * 12) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(state.currentPage * 12, state.totalArticles)}</span> of{' '}
                      <span className="font-medium">{state.totalArticles}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: state.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === state.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {state.showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {state.modalMode === 'create' && 'Tambah Artikel Baru'}
                  {state.modalMode === 'edit' && 'Edit Artikel'}
                  {state.modalMode === 'view' && 'Detail Artikel'}
                  {state.modalMode === 'delete' && 'Hapus Artikel'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {state.modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-700 mb-6">
                    Apakah Anda yakin ingin menghapus artikel <strong>"{state.selectedArticle?.judul}"</strong>?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={closeModal}
                      disabled={state.loading}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={deleteArticle}
                      disabled={state.loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {state.loading ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              ) : state.modalMode === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xl">{state.selectedArticle?.judul}</h4>
                    <p className="text-gray-600 mt-2">{state.selectedArticle?.ringkasan}</p>
                  </div>
                  {state.selectedArticle?.gambarUtama && (
                    <img
                      src={state.selectedArticle.gambarUtama}
                      alt={state.selectedArticle.judul}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: state.selectedArticle?.konten || '' }} />
                </div>
              ) : (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveArticle(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Artikel <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={state.formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <input
                        type="text"
                        value={state.formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={state.formData.category_id}
                        onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value={0}>Pilih Kategori</option>
                        {state.categories.map((category) => (
                          <option key={category.id} value={parseInt(category.id)}>
                            {category.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={state.formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Visibilitas</label>
                      <select
                        value={state.formData.visibility}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="members_only">Members Only</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Utama</label>
                      
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                            {state.uploadingImage ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Upload Gambar
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={state.uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <span className="text-sm text-gray-500">atau gunakan URL</span>
                      </div>

                      <input
                        type="url"
                        value={state.formData.featured_image}
                        onChange={(e) => {
                          handleInputChange('featured_image', e.target.value);
                          setState(prev => ({ ...prev, imagePreview: e.target.value }));
                        }}
                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        disabled={state.uploadingImage}
                      />

                      {(state.imagePreview || state.formData.featured_image) && (
                        <div className="mt-3 relative inline-block">
                          <img
                            src={state.imagePreview || state.formData.featured_image}
                            alt="Preview"
                            className="h-32 w-auto object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={removeUploadedImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ringkasan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={state.formData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{state.formData.excerpt.length}/500 karakter</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konten Artikel <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={state.formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Estimasi waktu baca: {state.formData.reading_time_minutes} menit</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords</label>
                      <input
                        type="text"
                        value={state.formData.seo_keywords}
                        onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="mobil, otomotif, tips"
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={state.formData.is_featured}
                          onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured Article</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={state.formData.is_pinned}
                          onChange={(e) => handleInputChange('is_pinned', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Pinned Article</span>
                      </label>
                    </div>
                  </div>

                  {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{state.error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={state.loading}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={state.loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {state.loading ? 'Menyimpan...' : (state.modalMode === 'create' ? 'Simpan Artikel' : 'Update Artikel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKelolaArtikel;