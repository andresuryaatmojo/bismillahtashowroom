import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import KontrollerArtikel from '../controllers/KontrollerArtikel';
import { DataArtikel, KategoriArtikel } from '../controllers/KontrollerArtikel';

// Interface untuk form artikel
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

// Interface untuk state
interface StateKelolaArtikel {
  articles: DataArtikel[];
  categories: KategoriArtikel[];
  loading: boolean;
  error: string | null;
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
}

const HalamanKelolaArtikel: React.FC = () => {
  const navigate = useNavigate();
  const kontrollerArtikel = new KontrollerArtikel();

  // Initial form data
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

  // State management
  const [state, setState] = useState<StateKelolaArtikel>({
    articles: [],
    categories: [],
    loading: false,
    error: null,
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
    sortBy: 'terbaru'
  });

  // Load articles and categories
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load articles with filters
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

      setState(prev => ({
        ...prev,
        articles: result.artikel,
        categories: result.kategori,
        totalArticles: result.total,
        totalPages: Math.ceil(result.total / 12),
        loading: false
      }));

    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data artikel'
      }));
    }
  }, [state.currentPage, state.filterStatus, state.filterCategory, state.searchQuery, state.sortBy]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Calculate reading time
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormArtikel, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
        ...(field === 'title' && { slug: generateSlug(value) }),
        ...(field === 'content' && { reading_time_minutes: calculateReadingTime(value) })
      }
    }));
  };

  // Open modal for different actions
  const openModal = (mode: 'create' | 'edit' | 'view' | 'delete', article?: DataArtikel) => {
    setState(prev => ({
      ...prev,
      showModal: true,
      modalMode: mode,
      selectedArticle: article || null,
      formData: article ? {
        id: article.id,
        title: article.judul,
        slug: article.slug,
        excerpt: article.ringkasan,
        content: article.konten,
        category_id: parseInt(article.kategori.id),
        featured_image: article.gambarUtama,
        featured_image_alt: article.judul,
        meta_title: article.judul,
        meta_description: article.ringkasan,
        seo_keywords: article.tags.join(', '),
        status: article.status,
        is_featured: article.featured,
        is_pinned: false,
        visibility: 'public',
        reading_time_minutes: article.readingTime,
        published_at: article.status === 'published' ? article.tanggalPublish : undefined,
        gallery_images: article.galeriGambar
      } : initialFormData
    }));
  };

  // Close modal
  const closeModal = () => {
    setState(prev => ({
      ...prev,
      showModal: false,
      selectedArticle: null,
      formData: initialFormData
    }));
  };

  // Save article (create or update)
  const saveArticle = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const articleData = {
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

      if (state.modalMode === 'edit' && state.formData.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', state.formData.id);

        if (error) throw error;
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
      }

      closeModal();
      loadData();
      
    } catch (error) {
      console.error('Error saving article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menyimpan artikel'
      }));
    }
  };

  // Delete article
  const deleteArticle = async () => {
    if (!state.selectedArticle) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', state.selectedArticle.id);

      if (error) throw error;

      closeModal();
      loadData();
      
    } catch (error) {
      console.error('Error deleting article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menghapus artikel'
      }));
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      currentPage: 1
    }));
  };

  // Handle filter change
  const handleFilterChange = (type: 'status' | 'category' | 'sort', value: string) => {
    setState(prev => ({
      ...prev,
      [type === 'status' ? 'filterStatus' : type === 'category' ? 'filterCategory' : 'sortBy']: value,
      currentPage: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
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

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Cari artikel..."
                value={state.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={state.filterStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
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
            </div>

            {/* Sort */}
            <div>
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
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Loading */}
        {state.loading && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {article.gambarUtama && (
                            <img
                              src={article.gambarUtama}
                              alt={article.judul}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {article.judul}
                              {article.featured && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {article.ringkasan.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: article.kategori.warna + '20', color: article.kategori.warna }}
                        >
                          {article.kategori.nama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(article.status)}`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.tanggalPublish)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('view', article)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Lihat
                          </button>
                          <button
                            onClick={() => openModal('edit', article)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openModal('delete', article)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(state.currentPage - 1)}
                    disabled={state.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(state.currentPage + 1)}
                    disabled={state.currentPage === state.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {state.modalMode === 'create' && 'Tambah Artikel Baru'}
                  {state.modalMode === 'edit' && 'Edit Artikel'}
                  {state.modalMode === 'view' && 'Detail Artikel'}
                  {state.modalMode === 'delete' && 'Hapus Artikel'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              {state.modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-700 mb-6">
                    Apakah Anda yakin ingin menghapus artikel "{state.selectedArticle?.judul}"?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={deleteArticle}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : state.modalMode === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{state.selectedArticle?.judul}</h4>
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
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Artikel *
                      </label>
                      <input
                        type="text"
                        value={state.formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={state.formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
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

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={state.formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Visibility */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibilitas
                      </label>
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

                    {/* Featured Image */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Utama (URL)
                      </label>
                      <input
                        type="url"
                        value={state.formData.featured_image}
                        onChange={(e) => handleInputChange('featured_image', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ringkasan *
                      </label>
                      <textarea
                        value={state.formData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konten Artikel *
                      </label>
                      <textarea
                        value={state.formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* SEO Keywords */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Keywords (pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={state.formData.seo_keywords}
                        onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="mobil, otomotif, tips"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-2 flex space-x-6">
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

                  {/* Modal Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={saveArticle}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {state.modalMode === 'create' ? 'Simpan' : 'Update'}
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