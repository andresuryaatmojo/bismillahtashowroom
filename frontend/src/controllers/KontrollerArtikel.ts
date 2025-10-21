import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

export interface DataArtikel {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string;
  gambarUtama: string;
  galeriGambar: string[];
  kategori: KategoriArtikel;
  tags: string[];
  penulis: PenulisArtikel;
  tanggalPublish: string;
  tanggalUpdate: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  views: number;
  readingTime: number;
  featured: boolean;
  trending: boolean;
  visibility: 'public' | 'private' | 'members_only';
  isPinned: boolean;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string;
}

export interface KategoriArtikel {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  warna: string;
  icon: string;
  parentId?: string;
  jumlahArtikel: number;
}

export interface PenulisArtikel {
  id: string;
  nama: string;
  email: string;
  avatar: string;
  bio: string;
  jabatan: string;
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  totalArtikel: number;
  rating: number;
}

export interface FilterArtikel {
  kategori?: string[];
  tags?: string[];
  penulis?: string[];
  tanggalMulai?: string;
  tanggalSelesai?: string;
  status?: string[];
  featured?: boolean;
  trending?: boolean;
  minViews?: number;
  maxViews?: number;
  minReadingTime?: number;
  maxReadingTime?: number;
  search?: string;
}

export interface StatistikArtikel {
  totalArtikel: number;
  artikelPublished: number;
  artikelDraft: number;
  artikelArchived: number;
  totalViews: number;
  rataRataViews: number;
  rataRataReadingTime: number;
  kategoriTerpopuler: {
    kategori: string;
    jumlah: number;
  }[];
  penulisTeraktif: {
    penulis: string;
    jumlah: number;
  }[];
}

export interface HalamanArtikel {
  artikel: DataArtikel[];
  total: number;
  statistik: StatistikArtikel;
  kategori: KategoriArtikel[];
  tags: string[];
  penulis: PenulisArtikel[];
  filter: FilterArtikel;
  sortOptions: SortOption[];
  featuredArticles: DataArtikel[];
  trendingArticles: DataArtikel[];
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export interface InputArtikel {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: number;
  author_id: string;
  featured_image: string;
  featured_image_alt: string;
  gallery_images: string[];
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  is_featured: boolean;
  is_pinned: boolean;
  visibility: 'public' | 'private' | 'members_only';
  reading_time_minutes: number;
  published_at?: string | null;
}

export interface ResponseArtikel<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

// ==================== MAIN CONTROLLER CLASS ====================

export class KontrollerArtikel {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // ==================== READ OPERATIONS ====================

  /**
   * Memuat halaman artikel dengan data lengkap
   */
  public async muatHalamanArtikel(
    page: number = 1,
    limit: number = 12,
    filter?: FilterArtikel,
    sortBy: string = 'terbaru',
    search?: string
  ): Promise<HalamanArtikel> {
    try {
      const cacheKey = `artikel_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}_${search || ''}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const kategoriFilter = filter?.kategori || [];
      const slugKategori = kategoriFilter.filter(k => !/^\d+$/.test(k));
      
      const selectClause = `
        *,
        article_categories!category_id ( id, name, slug, description ),
        users!author_id ( id, full_name, username, email, profile_picture, role )
      `;

      let query = supabase
        .from('articles')
        .select(selectClause, { count: 'exact' });

      // Filter status - ADMIN BISA LIHAT SEMUA
      if (filter?.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      // Jika tidak ada filter status, cek role user
      else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          // Jika bukan admin/owner, hanya tampilkan published
          if (userData?.role !== 'admin' && userData?.role !== 'owner') {
            query = query.eq('status', 'published');
          }
          // Admin/owner bisa lihat semua status (tidak perlu filter)
        } else {
          query = query.eq('status', 'published');
        }
      }

      // Pencarian
      if (search && search.trim() !== '') {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},excerpt.ilike.${term},content.ilike.${term},seo_keywords.ilike.${term}`);
      }

      // Featured / Trending
      if (typeof filter?.featured === 'boolean') {
        query = query.eq('is_featured', filter.featured);
      }
      if (typeof filter?.trending === 'boolean' && filter.trending) {
        query = query.gte('view_count', 100);
      }

      // Kategori
      if (kategoriFilter.length > 0) {
        const ids = kategoriFilter.filter(k => /^\d+$/.test(k)).map(Number);
        if (ids.length > 0) {
          query = query.in('category_id', ids);
        }
        if (slugKategori.length > 0) {
          query = query.in('article_categories.slug', slugKategori);
        }
      }

      // Sorting
      switch (sortBy) {
        case 'terlama':
          query = query.order('published_at', { ascending: true, nullsFirst: true });
          break;
        case 'terpopuler':
          query = query.order('view_count', { ascending: false, nullsFirst: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false, nullsFirst: false });
          break;
        case 'alfabetis':
          query = query.order('title', { ascending: true });
          break;
        case 'terbaru':
        default:
          query = query.order('published_at', { ascending: false, nullsFirst: false });
          break;
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      const articles = (data || []).map(row => this.mapSupabaseArticle(row));
      const total = count || 0;

      // Derivasi kategori
      const kategoriMap = new Map<string, KategoriArtikel>();
      (data || []).forEach(row => {
        const cat = (row as any).article_categories;
        if (cat) {
          kategoriMap.set(String(cat.id), {
            id: String(cat.id),
            nama: cat.name || 'Kategori',
            slug: cat.slug || '',
            deskripsi: cat.description || '',
            warna: '#3B82F6',
            icon: 'folder',
            parentId: undefined,
            jumlahArtikel: 0
          });
        }
      });
      const kategori = Array.from(kategoriMap.values());

      // Derivasi penulis
      const authorsMap = new Map<string, PenulisArtikel>();
      (data || []).forEach(row => {
        const u = (row as any).users;
        if (u) {
          authorsMap.set(String(u.id), {
            id: String(u.id),
            nama: u.full_name || u.username || 'Penulis',
            email: u.email || '',
            avatar: u.profile_picture || '',
            bio: '',
            jabatan: u.role === 'admin' ? 'Admin' : u.role === 'owner' ? 'Owner' : 'Penulis',
            socialMedia: {},
            totalArtikel: 0,
            rating: 0
          });
        }
      });
      const penulis = Array.from(authorsMap.values());

      // Derivasi tags
      const tags = Array.from(
        new Set(
          (data || [])
            .flatMap(row => ((row as any).seo_keywords || '')
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean))
        )
      );

      // Featured & trending
      const featuredArticles = articles.filter(a => a.featured);
      const trendingArticles = articles
        .slice()
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, Math.min(articles.length, 5));

      // Statistik
      const statistik: StatistikArtikel = {
        totalArtikel: total,
        artikelPublished: articles.filter(a => a.status === 'published').length,
        artikelDraft: articles.filter(a => a.status === 'draft').length,
        artikelArchived: articles.filter(a => a.status === 'archived').length,
        totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
        rataRataViews: articles.length ? Math.round(articles.reduce((s, a) => s + (a.views || 0), 0) / articles.length) : 0,
        rataRataReadingTime: articles.length ? Math.round(articles.reduce((s, a) => s + (a.readingTime || 0), 0) / articles.length) : 0,
        kategoriTerpopuler: [],
        penulisTeraktif: []
      };

      const halamanData: HalamanArtikel = {
        artikel: articles,
        total,
        statistik,
        kategori,
        tags,
        penulis,
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        featuredArticles,
        trendingArticles
      };

      this.setToCache(cacheKey, halamanData);
      return halamanData;

    } catch (error) {
      console.error('Error loading article page:', error);
      return {
        artikel: [],
        total: 0,
        statistik: this.getDefaultStatistik(),
        kategori: [],
        tags: [],
        penulis: [],
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        featuredArticles: [],
        trendingArticles: []
      };
    }
  }

  /**
   * Memuat detail artikel berdasarkan ID atau slug
   */
  public async muatDetailArtikel(
    identifier: string,
    incrementView: boolean = true
  ): Promise<DataArtikel | null> {
    try {
      const cacheKey = `artikel_detail_${identifier}`;
      if (!incrementView) {
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) return cachedData;
      }

      const isUuid = /^[0-9a-fA-F-]{36}$/.test(identifier);
      let query = supabase
        .from('articles')
        .select(`
          id, title, slug, content, excerpt, featured_image, gallery_images, category_id, author_id, status,
          view_count, reading_time_minutes, is_featured, is_pinned,
          published_at, updated_at, seo_keywords, meta_title, meta_description, featured_image_alt, visibility,
          article_categories:category_id ( id, name, slug, description ),
          users:author_id ( id, full_name, username, email, profile_picture, role )
        `)
        .limit(1);

      query = isUuid ? query.eq('id', identifier) : query.eq('slug', identifier);
      query = query.eq('status', 'published');

      const { data, error } = await query;
      if (error) throw error;

      const row = data?.[0];
      if (!row) return null;

      const artikel = this.mapSupabaseArticle(row);

      // Increment view count
      if (incrementView) {
        const currentViews = (row as any).view_count || 0;
        await supabase
          .from('articles')
          .update({ view_count: currentViews + 1 })
          .eq('id', artikel.id);
        
        artikel.views = currentViews + 1;
      }

      if (!incrementView) this.setToCache(cacheKey, artikel);
      return artikel;

    } catch (error) {
      console.error('Error loading article detail:', error);
      return null;
    }
  }

  // ==================== CREATE OPERATION ====================

  /**
   * Membuat artikel baru
   */
  public async buatArtikel(input: InputArtikel): Promise<ResponseArtikel<DataArtikel>> {
    try {
      // Validasi input
      const validationResult = this.validateArtikelInput(input);
      if (!validationResult.valid) {
        return {
          success: false,
          message: 'Data artikel tidak valid',
          errors: validationResult.errors
        };
      }

      // Check slug uniqueness
      const slugExists = await this.checkSlugExists(input.slug);
      if (slugExists) {
        return {
          success: false,
          message: 'Slug sudah digunakan',
          errors: ['Slug artikel sudah ada, gunakan slug yang berbeda']
        };
      }

      // Insert artikel
      const { data, error } = await supabase
        .from('articles')
        .insert([{
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.content,
          category_id: input.category_id,
          author_id: input.author_id,
          featured_image: input.featured_image,
          featured_image_alt: input.featured_image_alt,
          gallery_images: input.gallery_images,
          meta_title: input.meta_title,
          meta_description: input.meta_description,
          seo_keywords: input.seo_keywords,
          status: input.status,
          is_featured: input.is_featured,
          is_pinned: input.is_pinned,
          visibility: input.visibility,
          reading_time_minutes: input.reading_time_minutes,
          published_at: input.status === 'published' ? (input.published_at || new Date().toISOString()) : null,
          view_count: 0
        }])
        .select(`
          *,
          article_categories:category_id ( id, name, slug, description ),
          users:author_id ( id, full_name, username, email, profile_picture, role )
        `)
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      const artikel = this.mapSupabaseArticle(data);

      return {
        success: true,
        data: artikel,
        message: 'Artikel berhasil dibuat'
      };

    } catch (error) {
      console.error('Error creating article:', error);
      return {
        success: false,
        message: 'Gagal membuat artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== UPDATE OPERATION ====================

  /**
   * Memperbarui artikel
   */
  public async perbaruiArtikel(id: string, input: Partial<InputArtikel>): Promise<ResponseArtikel<DataArtikel>> {
    try {
      // Check if article exists
      const existing = await this.getArticleByIdRaw(id);
      if (!existing) {
        return {
          success: false,
          message: 'Artikel tidak ditemukan',
          errors: ['Article not found']
        };
      }

      // Validate input if provided
      if (input.title || input.slug || input.content) {
        const validationResult = this.validateArtikelInput(input as InputArtikel, true);
        if (!validationResult.valid) {
          return {
            success: false,
            message: 'Data artikel tidak valid',
            errors: validationResult.errors
          };
        }
      }

      // Check slug uniqueness if slug is being updated
      if (input.slug && input.slug !== existing.slug) {
        const slugExists = await this.checkSlugExists(input.slug, id);
        if (slugExists) {
          return {
            success: false,
            message: 'Slug sudah digunakan',
            errors: ['Slug artikel sudah ada, gunakan slug yang berbeda']
          };
        }
      }

      // Prepare update data
      const updateData: any = {
        ...input,
        updated_at: new Date().toISOString()
      };

      // Set published_at if status changes to published
      if (input.status === 'published' && existing.status !== 'published') {
        updateData.published_at = input.published_at || new Date().toISOString();
      }

      // Update artikel
      const { data, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          article_categories:category_id ( id, name, slug, description ),
          users:author_id ( id, full_name, username, email, profile_picture, role )
        `)
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      const artikel = this.mapSupabaseArticle(data);

      return {
        success: true,
        data: artikel,
        message: 'Artikel berhasil diperbarui'
      };

    } catch (error) {
      console.error('Error updating article:', error);
      return {
        success: false,
        message: 'Gagal memperbarui artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== DELETE OPERATION ====================

  /**
   * Menghapus artikel
   */
  public async hapusArtikel(id: string): Promise<ResponseArtikel<void>> {
    try {
      // Check if article exists
      const existing = await this.getArticleByIdRaw(id);
      if (!existing) {
        return {
          success: false,
          message: 'Artikel tidak ditemukan',
          errors: ['Article not found']
        };
      }

      // Delete artikel
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return {
        success: true,
        message: 'Artikel berhasil dihapus'
      };

    } catch (error) {
      console.error('Error deleting article:', error);
      return {
        success: false,
        message: 'Gagal menghapus artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validasi input artikel
   */
  private validateArtikelInput(input: Partial<InputArtikel>, isUpdate: boolean = false): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isUpdate) {
      if (!input.title || input.title.trim().length === 0) {
        errors.push('Judul artikel wajib diisi');
      }
      if (!input.slug || input.slug.trim().length === 0) {
        errors.push('Slug artikel wajib diisi');
      }
      if (!input.content || input.content.trim().length === 0) {
        errors.push('Konten artikel wajib diisi');
      }
      if (!input.excerpt || input.excerpt.trim().length === 0) {
        errors.push('Ringkasan artikel wajib diisi');
      }
      if (!input.category_id || input.category_id <= 0) {
        errors.push('Kategori artikel wajib dipilih');
      }
      if (!input.author_id || input.author_id.trim().length === 0) {
        errors.push('Penulis artikel wajib diisi');
      }
    }

    // Validate title length
    if (input.title && input.title.length > 200) {
      errors.push('Judul artikel maksimal 200 karakter');
    }

    // Validate slug format
    if (input.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(input.slug)) {
        errors.push('Slug harus lowercase, angka, dan dash saja (contoh: artikel-saya)');
      }
    }

    // Validate excerpt length
    if (input.excerpt && input.excerpt.length > 500) {
      errors.push('Ringkasan artikel maksimal 500 karakter');
    }

    // Validate content length
    if (input.content && input.content.length < 100) {
      errors.push('Konten artikel minimal 100 karakter');
    }

    // Validate reading time
    if (input.reading_time_minutes !== undefined && input.reading_time_minutes < 0) {
      errors.push('Waktu baca tidak boleh negatif');
    }

    // Validate URLs
    if (input.featured_image && !this.isValidUrl(input.featured_image)) {
      errors.push('URL gambar utama tidak valid');
    }

    if (input.gallery_images) {
      for (const url of input.gallery_images) {
        if (!this.isValidUrl(url)) {
          errors.push(`URL gambar galeri tidak valid: ${url}`);
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if slug exists
   */
  private async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data } = await query;
      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }

  /**
   * Get article by ID (raw data)
   */
  private async getArticleByIdRaw(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting article:', error);
      return null;
    }
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mapper Supabase row -> DataArtikel
   */
  private mapSupabaseArticle(row: any): DataArtikel {
    const cat = row.article_categories;
    const u = row.users;

    const kategori: KategoriArtikel = cat ? {
      id: String(cat.id),
      nama: cat.name || 'Kategori',
      slug: cat.slug || '',
      deskripsi: cat.description || '',
      warna: '#3B82F6',
      icon: 'folder',
      parentId: undefined,
      jumlahArtikel: 0
    } : {
      id: String(row.category_id),
      nama: 'Kategori',
      slug: '',
      deskripsi: '',
      warna: '#3B82F6',
      icon: 'folder',
      parentId: undefined,
      jumlahArtikel: 0
    };

    const penulis: PenulisArtikel = u ? {
      id: String(u.id),
      nama: u.full_name || u.username || 'Penulis',
      email: u.email || '',
      avatar: u.profile_picture || '',
      bio: '',
      jabatan: u.role === 'admin' ? 'Admin' : u.role === 'owner' ? 'Owner' : 'Penulis',
      socialMedia: {},
      totalArtikel: 0,
      rating: 0
    } : {
      id: String(row.author_id),
      nama: 'Penulis',
      email: '',
      avatar: '',
      bio: '',
      jabatan: '',
      socialMedia: {},
      totalArtikel: 0,
      rating: 0
    };

    const tags = ((row.seo_keywords || '') as string)
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const galeri = Array.isArray(row.gallery_images) ? row.gallery_images : [];

    const statusMap: Record<string, DataArtikel['status']> = {
      published: 'published',
      draft: 'draft',
      archived: 'archived',
      review: 'archived',
      deleted: 'archived'
    };

    return {
      id: String(row.id),
      judul: row.title,
      slug: row.slug,
      konten: row.content,
      ringkasan: row.excerpt || '',
      gambarUtama: row.featured_image || '',
      galeriGambar: galeri,
      kategori,
      tags,
      penulis,
      tanggalPublish: row.published_at || row.created_at,
      tanggalUpdate: row.updated_at,
      status: statusMap[row.status] || 'draft',
      views: row.view_count || 0,
      readingTime: row.reading_time_minutes || 0,
      featured: !!row.is_featured,
      trending: (row.view_count || 0) >= 100,
      visibility: row.visibility || 'public',
      isPinned: !!row.is_pinned,
      metaTitle: row.meta_title || row.title,
      metaDescription: row.meta_description || row.excerpt || '',
      seoKeywords: row.seo_keywords || ''
    };
  }

  /**
   * Format tanggal
   */
  public formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Format reading time
   */
  public formatReadingTime(minutes: number): string {
    if (minutes < 1) return 'Kurang dari 1 menit';
    if (minutes === 1) return '1 menit';
    return `${minutes} menit`;
  }

  /**
   * Generate slug from title
   */
  public generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Calculate reading time
   */
  public calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikArtikel {
    return {
      totalArtikel: 0,
      artikelPublished: 0,
      artikelDraft: 0,
      artikelArchived: 0,
      totalViews: 0,
      rataRataViews: 0,
      rataRataReadingTime: 0,
      kategoriTerpopuler: [],
      penulisTeraktif: []
    };
  }

  /**
   * Get sort options
   */
  private getSortOptions(): SortOption[] {
    return [
      { value: 'terbaru', label: 'Terbaru', field: 'tanggalPublish', direction: 'desc' },
      { value: 'terlama', label: 'Terlama', field: 'tanggalPublish', direction: 'asc' },
      { value: 'terpopuler', label: 'Terpopuler', field: 'views', direction: 'desc' },
      { value: 'trending', label: 'Trending', field: 'views', direction: 'desc' },
      { value: 'alfabetis', label: 'A-Z', field: 'judul', direction: 'asc' }
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

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerArtikel;