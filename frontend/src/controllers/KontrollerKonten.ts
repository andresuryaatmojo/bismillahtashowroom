const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data konten
export interface DataKonten {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'page' | 'banner' | 'promotion' | 'news' | 'review' | 'guide' | 'faq';
  status: 'draft' | 'published' | 'scheduled' | 'archived' | 'trash';
  content: string;
  excerpt: string;
  featuredImage: string;
  gallery: string[];
  seo: SEOKonten;
  metadata: MetadataKonten;
  author: AuthorKonten;
  category: KategoriKonten;
  tags: string[];
  publishedAt?: string;
  scheduledAt?: string;
  views: number;
  likes: number;
  shares: number;
  comments: KomentarKonten[];
  relatedContent: string[];
  template: string;
  customFields: { [key: string]: any };
  visibility: 'public' | 'private' | 'password' | 'members';
  password?: string;
  featured: boolean;
  sticky: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Interface untuk SEO konten
export interface SEOKonten {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
  schema: any;
}

// Interface untuk metadata konten
export interface MetadataKonten {
  readingTime: number;
  wordCount: number;
  language: string;
  version: number;
  lastRevision: string;
  revisionHistory: RevisionHistory[];
  customData: { [key: string]: any };
}

// Interface untuk revision history
export interface RevisionHistory {
  id: string;
  version: number;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  changes: string[];
  note: string;
}

// Interface untuk author konten
export interface AuthorKonten {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
}

// Interface untuk kategori konten
export interface KategoriKonten {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  children?: KategoriKonten[];
  contentCount: number;
}

// Interface untuk komentar konten
export interface KomentarKonten {
  id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    website?: string;
  };
  content: string;
  status: 'approved' | 'pending' | 'spam' | 'trash';
  createdAt: string;
  parentId?: string;
  replies: KomentarKonten[];
  likes: number;
  ip: string;
  userAgent: string;
}

// Interface untuk media
export interface MediaKonten {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  caption: string;
  description: string;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata: {
    [key: string]: any;
  };
  uploadedBy: string;
  uploadedAt: string;
  usedIn: string[]; // array of content IDs using this media
}

// Interface untuk template konten
export interface TemplateKonten {
  id: string;
  name: string;
  description: string;
  type: string;
  structure: any;
  fields: FieldTemplate[];
  preview: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk field template
export interface FieldTemplate {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'rich_text' | 'image' | 'gallery' | 'select' | 'checkbox' | 'date' | 'number' | 'url' | 'email';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
  helpText?: string;
}

// Interface untuk filter konten
export interface FilterKonten {
  type?: string[];
  status?: string[];
  category?: string[];
  tags?: string[];
  author?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  visibility?: string[];
  featured?: boolean;
  sticky?: boolean;
  search?: string;
}

// Interface untuk statistik konten
export interface StatistikKonten {
  total: {
    content: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
    trash: number;
  };
  byType: {
    [type: string]: {
      count: number;
      percentage: number;
    };
  };
  byCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  byAuthor: {
    author: string;
    count: number;
    percentage: number;
  }[];
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    averageViews: number;
    averageEngagement: number;
  };
  trends: {
    month: string;
    published: number;
    views: number;
    engagement: number;
  }[];
  topContent: {
    mostViewed: DataKonten[];
    mostLiked: DataKonten[];
    mostShared: DataKonten[];
    mostCommented: DataKonten[];
  };
}

// Interface untuk dashboard konten
export interface DashboardKonten {
  statistik: StatistikKonten;
  recentContent: DataKonten[];
  scheduledContent: DataKonten[];
  draftContent: DataKonten[];
  pendingComments: KomentarKonten[];
  quickActions: QuickAction[];
  alerts: AlertKonten[];
  analytics: AnalyticsKonten;
}

// Interface untuk quick action
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
  count?: number;
  enabled: boolean;
}

// Interface untuk alert konten
export interface AlertKonten {
  id: string;
  type: 'scheduled_content' | 'pending_comments' | 'broken_links' | 'seo_issues' | 'media_issues' | 'backup_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  acknowledged: boolean;
}

// Interface untuk analytics konten
export interface AnalyticsKonten {
  pageViews: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  topPages: {
    url: string;
    title: string;
    views: number;
    uniqueViews: number;
  }[];
  trafficSources: {
    source: string;
    visits: number;
    percentage: number;
  }[];
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: {
    browser: string;
    visits: number;
    percentage: number;
  }[];
  locations: {
    country: string;
    visits: number;
    percentage: number;
  }[];
}

// Interface untuk form konten
export interface FormKonten {
  id?: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  gallery: string[];
  categoryId: string;
  tags: string[];
  seo: SEOKonten;
  template: string;
  customFields: { [key: string]: any };
  visibility: string;
  password?: string;
  featured: boolean;
  sticky: boolean;
  allowComments: boolean;
  publishedAt?: string;
  scheduledAt?: string;
}

// Interface untuk validasi form
export interface ValidasiFormKonten {
  valid: boolean;
  errors: { [field: string]: string[] };
  warnings: { [field: string]: string[] };
}

export class KontrollerKonten {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat dashboard konten dengan statistik dan data terkini
   * @returns Promise<DashboardKonten>
   */
  public async muatDashboardKonten(): Promise<DashboardKonten> {
    try {
      // Check cache first
      const cacheKey = 'dashboard_konten';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/content/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const dashboardData: DashboardKonten = {
        statistik: result.data.statistics || this.getDefaultStatistik(),
        recentContent: result.data.recentContent || [],
        scheduledContent: result.data.scheduledContent || [],
        draftContent: result.data.draftContent || [],
        pendingComments: result.data.pendingComments || [],
        quickActions: this.getQuickActions(),
        alerts: result.data.alerts || [],
        analytics: result.data.analytics || this.getDefaultAnalytics()
      };

      // Cache the result
      this.setToCache(cacheKey, dashboardData);

      return dashboardData;

    } catch (error) {
      console.error('Error loading content dashboard:', error);
      return {
        statistik: this.getDefaultStatistik(),
        recentContent: [],
        scheduledContent: [],
        draftContent: [],
        pendingComments: [],
        quickActions: this.getQuickActions(),
        alerts: [],
        analytics: this.getDefaultAnalytics()
      };
    }
  }

  /**
   * Memuat daftar konten dengan filter dan pagination
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 20)
   * @param filter - Filter konten
   * @param sortBy - Urutan data
   * @returns Promise<{content: DataKonten[], total: number, statistics: StatistikKonten}>
   */
  public async muatDaftarKonten(
    page: number = 1,
    limit: number = 20,
    filter?: FilterKonten,
    sortBy: string = 'updatedAt_desc'
  ): Promise<{
    content: DataKonten[];
    total: number;
    statistics: StatistikKonten;
  }> {
    try {
      // Check cache first
      const cacheKey = `konten_list_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      // Add filter parameters
      if (filter) {
        if (filter.type) params.append('type', filter.type.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.category) params.append('category', filter.category.join(','));
        if (filter.tags) params.append('tags', filter.tags.join(','));
        if (filter.author) params.append('author', filter.author.join(','));
        if (filter.dateRange) {
          params.append('startDate', filter.dateRange.start);
          params.append('endDate', filter.dateRange.end);
        }
        if (filter.visibility) params.append('visibility', filter.visibility.join(','));
        if (filter.featured !== undefined) params.append('featured', filter.featured.toString());
        if (filter.sticky !== undefined) params.append('sticky', filter.sticky.toString());
        if (filter.search) params.append('search', filter.search);
      }

      const response = await fetch(`${API_BASE_URL}/content?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const data = {
        content: result.data.content || [],
        total: result.data.total || 0,
        statistics: result.data.statistics || this.getDefaultStatistik()
      };

      // Cache the result
      this.setToCache(cacheKey, data);

      return data;

    } catch (error) {
      console.error('Error loading content list:', error);
      return {
        content: [],
        total: 0,
        statistics: this.getDefaultStatistik()
      };
    }
  }

  /**
   * Proses tambah konten baru
   * @param dataKonten - Data konten yang akan ditambahkan
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async prosesTambahKonten(dataKonten: FormKonten): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      // Validasi data terlebih dahulu
      const validasi = await this.validasiFormKonten(dataKonten);
      if (!validasi.valid) {
        return {
          success: false,
          message: 'Data tidak valid: ' + Object.values(validasi.errors).flat().join(', ')
        };
      }

      const response = await fetch(`${API_BASE_URL}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(dataKonten)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambah konten');
      }

      // Clear cache
      this.clearCacheByPattern('konten_');
      this.clearCacheByPattern('dashboard_konten');

      return {
        success: true,
        message: 'Konten berhasil ditambahkan',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error adding content:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambah konten'
      };
    }
  }

  /**
   * Memuat form edit konten berdasarkan ID
   * @param idKonten - ID konten yang akan diedit
   * @returns Promise<FormKonten | null>
   */
  public async muatFormEdit(idKonten: string): Promise<FormKonten | null> {
    try {
      // Check cache first
      const cacheKey = `konten_edit_${idKonten}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/content/${idKonten}/edit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform data to form format
      const formData: FormKonten = {
        id: result.data.id,
        title: result.data.title,
        slug: result.data.slug,
        type: result.data.type,
        status: result.data.status,
        content: result.data.content,
        excerpt: result.data.excerpt,
        featuredImage: result.data.featuredImage,
        gallery: result.data.gallery,
        categoryId: result.data.category.id,
        tags: result.data.tags,
        seo: result.data.seo,
        template: result.data.template,
        customFields: result.data.customFields,
        visibility: result.data.visibility,
        password: result.data.password,
        featured: result.data.featured,
        sticky: result.data.sticky,
        allowComments: result.data.allowComments,
        publishedAt: result.data.publishedAt,
        scheduledAt: result.data.scheduledAt
      };

      // Cache the result
      this.setToCache(cacheKey, formData);

      return formData;

    } catch (error) {
      console.error('Error loading edit form:', error);
      return null;
    }
  }

  /**
   * Proses perbarui konten
   * @param idKonten - ID konten yang akan diperbarui
   * @param dataKontenBaru - Data konten yang baru
   * @returns Promise<{success: boolean, message: string}>
   */
  public async prosesPerbaruiKonten(
    idKonten: string,
    dataKontenBaru: FormKonten
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validasi data terlebih dahulu
      const validasi = await this.validasiFormKonten(dataKontenBaru);
      if (!validasi.valid) {
        return {
          success: false,
          message: 'Data tidak valid: ' + Object.values(validasi.errors).flat().join(', ')
        };
      }

      const response = await fetch(`${API_BASE_URL}/content/${idKonten}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(dataKontenBaru)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui konten');
      }

      // Clear cache
      this.clearCacheByPattern('konten_');
      this.clearCacheByPattern('dashboard_konten');

      return {
        success: true,
        message: 'Konten berhasil diperbarui'
      };

    } catch (error) {
      console.error('Error updating content:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui konten'
      };
    }
  }

  /**
   * Proses hapus konten
   * @param idKonten - ID konten yang akan dihapus
   * @param permanent - Apakah hapus permanen (default: false, pindah ke trash)
   * @returns Promise<{success: boolean, message: string}>
   */
  public async prosesHapusKonten(
    idKonten: string,
    permanent: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (permanent) {
        params.append('permanent', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/content/${idKonten}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus konten');
      }

      // Clear cache
      this.clearCacheByPattern('konten_');
      this.clearCacheByPattern('dashboard_konten');

      return {
        success: true,
        message: permanent ? 'Konten berhasil dihapus permanen' : 'Konten berhasil dipindah ke trash'
      };

    } catch (error) {
      console.error('Error deleting content:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus konten'
      };
    }
  }

  /**
   * Duplicate konten
   * @param idKonten - ID konten yang akan diduplicate
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async duplicateKonten(idKonten: string): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/content/${idKonten}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menduplicate konten');
      }

      // Clear cache
      this.clearCacheByPattern('konten_');
      this.clearCacheByPattern('dashboard_konten');

      return {
        success: true,
        message: 'Konten berhasil diduplicate',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error duplicating content:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menduplicate konten'
      };
    }
  }

  /**
   * Bulk action untuk multiple konten
   * @param action - Jenis action ('publish', 'draft', 'trash', 'delete', 'feature', 'unfeature')
   * @param contentIds - Array ID konten
   * @returns Promise<{success: boolean, message: string, results?: any}>
   */
  public async prosesBulkAction(
    action: string,
    contentIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/content/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action,
          contentIds
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memproses bulk action');
      }

      // Clear cache
      this.clearCacheByPattern('konten_');
      this.clearCacheByPattern('dashboard_konten');

      return {
        success: true,
        message: `Bulk action berhasil diproses untuk ${contentIds.length} konten`,
        results: result.data
      };

    } catch (error) {
      console.error('Error processing bulk action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses bulk action'
      };
    }
  }

  /**
   * Upload media
   * @param file - File yang akan diupload
   * @param metadata - Metadata media
   * @returns Promise<{success: boolean, message: string, media?: MediaKonten}>
   */
  public async uploadMedia(
    file: File,
    metadata?: {
      alt?: string;
      caption?: string;
      description?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    media?: MediaKonten;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${API_BASE_URL}/content/media/upload`, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupload media');
      }

      return {
        success: true,
        message: 'Media berhasil diupload',
        media: result.data
      };

    } catch (error) {
      console.error('Error uploading media:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupload media'
      };
    }
  }

  /**
   * Validasi form konten
   * @param data - Data form yang akan divalidasi
   * @returns Promise<ValidasiFormKonten>
   */
  public async validasiFormKonten(data: FormKonten): Promise<ValidasiFormKonten> {
    const validasi: ValidasiFormKonten = {
      valid: true,
      errors: {},
      warnings: {}
    };

    // Validasi title
    if (!data.title || data.title.trim() === '') {
      validasi.errors.title = ['Judul harus diisi'];
      validasi.valid = false;
    } else if (data.title.length > 200) {
      validasi.errors.title = ['Judul maksimal 200 karakter'];
      validasi.valid = false;
    }

    // Validasi slug
    if (!data.slug || data.slug.trim() === '') {
      validasi.errors.slug = ['Slug harus diisi'];
      validasi.valid = false;
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      validasi.errors.slug = ['Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'];
      validasi.valid = false;
    }

    // Validasi content
    if (!data.content || data.content.trim() === '') {
      validasi.errors.content = ['Konten harus diisi'];
      validasi.valid = false;
    }

    // Validasi type
    const validTypes = ['article', 'page', 'banner', 'promotion', 'news', 'review', 'guide', 'faq'];
    if (!validTypes.includes(data.type)) {
      validasi.errors.type = ['Tipe konten tidak valid'];
      validasi.valid = false;
    }

    // Validasi status
    const validStatuses = ['draft', 'published', 'scheduled', 'archived', 'trash'];
    if (!validStatuses.includes(data.status)) {
      validasi.errors.status = ['Status tidak valid'];
      validasi.valid = false;
    }

    // Validasi scheduled date jika status scheduled
    if (data.status === 'scheduled') {
      if (!data.scheduledAt) {
        validasi.errors.scheduledAt = ['Tanggal publikasi harus diisi untuk konten terjadwal'];
        validasi.valid = false;
      } else if (new Date(data.scheduledAt) <= new Date()) {
        validasi.errors.scheduledAt = ['Tanggal publikasi harus di masa depan'];
        validasi.valid = false;
      }
    }

    // Validasi password jika visibility password
    if (data.visibility === 'password' && (!data.password || data.password.trim() === '')) {
      validasi.errors.password = ['Password harus diisi untuk konten yang dilindungi password'];
      validasi.valid = false;
    }

    // Validasi SEO
    if (data.seo) {
      if (data.seo.metaTitle && data.seo.metaTitle.length > 60) {
        validasi.warnings.seoMetaTitle = ['Meta title sebaiknya tidak lebih dari 60 karakter'];
      }
      if (data.seo.metaDescription && data.seo.metaDescription.length > 160) {
        validasi.warnings.seoMetaDescription = ['Meta description sebaiknya tidak lebih dari 160 karakter'];
      }
    }

    // Validasi excerpt
    if (data.excerpt && data.excerpt.length > 300) {
      validasi.warnings.excerpt = ['Excerpt sebaiknya tidak lebih dari 300 karakter'];
    }

    return validasi;
  }

  /**
   * Generate slug dari title
   * @param title - Title yang akan dijadikan slug
   * @returns string
   */
  public generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Format tanggal
   */
  public formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status badge color
   */
  public getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'published': 'green',
      'draft': 'gray',
      'scheduled': 'blue',
      'archived': 'orange',
      'trash': 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get type label
   */
  public getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'article': 'Artikel',
      'page': 'Halaman',
      'banner': 'Banner',
      'promotion': 'Promosi',
      'news': 'Berita',
      'review': 'Review',
      'guide': 'Panduan',
      'faq': 'FAQ'
    };
    return labels[type] || type;
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikKonten {
    return {
      total: {
        content: 0,
        published: 0,
        draft: 0,
        scheduled: 0,
        archived: 0,
        trash: 0
      },
      byType: {},
      byCategory: [],
      byAuthor: [],
      engagement: {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        averageViews: 0,
        averageEngagement: 0
      },
      trends: [],
      topContent: {
        mostViewed: [],
        mostLiked: [],
        mostShared: [],
        mostCommented: []
      }
    };
  }

  /**
   * Get default analytics
   */
  private getDefaultAnalytics(): AnalyticsKonten {
    return {
      pageViews: {
        today: 0,
        yesterday: 0,
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0
      },
      topPages: [],
      trafficSources: [],
      devices: {
        desktop: 0,
        mobile: 0,
        tablet: 0
      },
      browsers: [],
      locations: []
    };
  }

  /**
   * Get quick actions
   */
  private getQuickActions(): QuickAction[] {
    return [
      {
        id: 'add_content',
        label: 'Tambah Konten',
        icon: 'plus',
        action: 'add_content',
        color: 'blue',
        enabled: true
      },
      {
        id: 'manage_media',
        label: 'Kelola Media',
        icon: 'image',
        action: 'manage_media',
        color: 'green',
        enabled: true
      },
      {
        id: 'view_comments',
        label: 'Lihat Komentar',
        icon: 'message',
        action: 'view_comments',
        color: 'orange',
        enabled: true
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        action: 'view_analytics',
        color: 'purple',
        enabled: true
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        icon: 'settings',
        action: 'content_settings',
        color: 'gray',
        enabled: true
      }
    ];
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setToCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private clearCacheByPattern(pattern: string): void {
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerKonten;
