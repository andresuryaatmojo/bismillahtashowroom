import { supabase } from '../lib/supabase';

// Interface untuk data artikel
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
}

// Interface untuk kategori artikel
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

// Interface untuk penulis artikel
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

// Interface untuk filter artikel
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

// Interface untuk statistik artikel
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
  trendBulanan: {
    bulan: string;
    views: number;
    artikel: number;
  }[];
}

// Interface untuk halaman artikel
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

// Interface untuk opsi sort
export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export class KontrollerArtikel {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Memuat halaman artikel dengan data lengkap
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 12)
   * @param filter - Filter pencarian
   * @param sortBy - Urutan ('terbaru' | 'terlama' | 'terpopuler' | 'trending' | 'alfabetis')
   * @param search - Kata kunci pencarian
   * @returns Promise<HalamanArtikel>
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

      // Default: hanya yang published (sesuai RLS)
      if (!filter?.status || filter.status.length === 0) {
        query = query.eq('status', 'published');
      } else {
        query = query.in('status', filter.status);
      }

      // Pencarian sederhana
      if (search && search.trim() !== '') {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},excerpt.ilike.${term},content.ilike.${term},seo_keywords.ilike.${term}`);
      }

      // Featured / Trending
      if (typeof filter?.featured === 'boolean') {
        query = query.eq('is_featured', filter.featured);
      }
      if (typeof filter?.trending === 'boolean' && filter.trending) {
        query = query.gte('view_count', 100); // Artikel trending minimal 100 views
      }

      // Kategori: ID atau slug
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

      // Derivasi kategori unik dari hasil join
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

      // Derivasi penulis unik dari join users
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

      // Derivasi tags dari seo_keywords
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

      // Statistik sederhana dari halaman ini
      const statistik: StatistikArtikel = {
        totalArtikel: total,
        artikelPublished: articles.filter(a => a.status === 'published').length,
        artikelDraft: articles.filter(a => a.status === 'draft').length,
        artikelArchived: articles.filter(a => a.status === 'archived').length,
        totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
        rataRataViews: articles.length ? Math.round(articles.reduce((s, a) => s + (a.views || 0), 0) / articles.length) : 0,
        rataRataReadingTime: articles.length ? Math.round(articles.reduce((s, a) => s + (a.readingTime || 0), 0) / articles.length) : 0,
        kategoriTerpopuler: [],
        penulisTeraktif: [],
        trendBulanan: []
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
      console.error('Error loading article page (Supabase):', error);
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
   * @param identifier - ID atau slug artikel
   * @param incrementView - Apakah menambah view count (default: true)
   * @returns Promise<DataArtikel | null>
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

      // Hanya artikel published
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
        
        // Update local state
        artikel.views = currentViews + 1;
      }

      if (!incrementView) this.setToCache(cacheKey, artikel);
      return artikel;

    } catch (error) {
      console.error('Error loading article detail (Supabase):', error);
      return null;
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
      trending: (row.view_count || 0) >= 100
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
      penulisTeraktif: [],
      trendBulanan: []
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