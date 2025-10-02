const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
  likes: number;
  shares: number;
  komentar: KomentarArtikel[];
  seo: SEOArtikel;
  metadata: MetadataArtikel;
  relatedArticles: string[];
  readingTime: number; // dalam menit
  featured: boolean;
  trending: boolean;
  isBookmarked?: boolean;
  isLiked?: boolean;
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

// Interface untuk komentar artikel
export interface KomentarArtikel {
  id: string;
  nama: string;
  email: string;
  avatar?: string;
  konten: string;
  tanggal: string;
  status: 'approved' | 'pending' | 'spam' | 'rejected';
  likes: number;
  replies: KomentarArtikel[];
  parentId?: string;
}

// Interface untuk SEO artikel
export interface SEOArtikel {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  schema: any;
}

// Interface untuk metadata artikel
export interface MetadataArtikel {
  readingTime: number;
  wordCount: number;
  language: string;
  publishedBy: string;
  lastModifiedBy: string;
  version: number;
  source?: string;
  externalLinks: string[];
  internalLinks: string[];
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
  totalLikes: number;
  totalShares: number;
  totalKomentar: number;
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

// Interface untuk share artikel
export interface ShareArtikel {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'copy_link';
  url: string;
  title: string;
  description: string;
  image: string;
  hashtags?: string[];
}

// Interface untuk analytics artikel
export interface AnalyticsArtikel {
  views: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    averageTimeOnPage: number;
    bounceRate: number;
  };
  traffic: {
    sources: {
      direct: number;
      search: number;
      social: number;
      referral: number;
    };
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    locations: {
      [country: string]: number;
    };
  };
  performance: {
    loadTime: number;
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
}

export class KontrollerArtikel {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Toggle bookmark artikel
   * @param idArtikel - ID artikel
   * @returns Promise<{success: boolean, message: string, isBookmarked: boolean}>
   */
  public async toggleBookmarkArtikel(idArtikel: string): Promise<{
    success: boolean;
    message: string;
    isBookmarked: boolean;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${idArtikel}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal toggle bookmark');
      }

      // Clear cache
      this.clearCacheByPattern(`artikel_detail_${idArtikel}`);
      this.clearCacheByPattern('artikel_');

      return {
        success: true,
        message: result.message || 'Bookmark berhasil diubah',
        isBookmarked: result.data.isBookmarked
      };

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengubah bookmark',
        isBookmarked: false
      };
    }
  }

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
      // Check cache first
      const cacheKey = `artikel_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}_${search || ''}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      if (search) {
        params.append('search', search);
      }

      // Add filter parameters
      if (filter) {
        if (filter.kategori) params.append('kategori', filter.kategori.join(','));
        if (filter.tags) params.append('tags', filter.tags.join(','));
        if (filter.penulis) params.append('penulis', filter.penulis.join(','));
        if (filter.tanggalMulai) params.append('tanggalMulai', filter.tanggalMulai);
        if (filter.tanggalSelesai) params.append('tanggalSelesai', filter.tanggalSelesai);
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.featured !== undefined) params.append('featured', filter.featured.toString());
        if (filter.trending !== undefined) params.append('trending', filter.trending.toString());
        if (filter.minViews) params.append('minViews', filter.minViews.toString());
        if (filter.maxViews) params.append('maxViews', filter.maxViews.toString());
        if (filter.minReadingTime) params.append('minReadingTime', filter.minReadingTime.toString());
        if (filter.maxReadingTime) params.append('maxReadingTime', filter.maxReadingTime.toString());
      }

      const response = await fetch(`${API_BASE_URL}/articles?${params}`, {
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
      
      const halamanData: HalamanArtikel = {
        artikel: result.data.articles || [],
        total: result.data.total || 0,
        statistik: result.data.statistics || this.getDefaultStatistik(),
        kategori: result.data.categories || [],
        tags: result.data.tags || [],
        penulis: result.data.authors || [],
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        featuredArticles: result.data.featuredArticles || [],
        trendingArticles: result.data.trendingArticles || []
      };

      // Cache the result
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
   * @param identifier - ID atau slug artikel
   * @param incrementView - Apakah menambah view count (default: true)
   * @returns Promise<DataArtikel | null>
   */
  public async muatDetailArtikel(
    identifier: string,
    incrementView: boolean = true
  ): Promise<DataArtikel | null> {
    try {
      // Check cache first (only if not incrementing view)
      const cacheKey = `artikel_detail_${identifier}`;
      if (!incrementView) {
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      const params = new URLSearchParams();
      if (!incrementView) {
        params.append('incrementView', 'false');
      }

      const response = await fetch(`${API_BASE_URL}/articles/${identifier}?${params}`, {
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
      
      // Cache the result only if not incrementing view
      if (!incrementView) {
        this.setToCache(cacheKey, result.data);
      }

      return result.data;

    } catch (error) {
      console.error('Error loading article detail:', error);
      return null;
    }
  }

  /**
   * Proses share artikel ke berbagai platform
   * @param idArtikel - ID artikel yang akan dishare
   * @param platform - Platform tujuan share
   * @param customMessage - Pesan kustom (opsional)
   * @returns Promise<{success: boolean, message: string, shareUrl?: string}>
   */
  public async prosesShareArtikel(
    idArtikel: string,
    platform: string = 'copy_link',
    customMessage?: string
  ): Promise<{
    success: boolean;
    message: string;
    shareUrl?: string;
  }> {
    try {
      // Ambil detail artikel terlebih dahulu
      const artikel = await this.muatDetailArtikel(idArtikel, false);
      if (!artikel) {
        return {
          success: false,
          message: 'Artikel tidak ditemukan'
        };
      }

      // Buat data share
      const shareData: ShareArtikel = {
        platform: platform as any,
        url: `${window.location.origin}/artikel/${artikel.slug}`,
        title: artikel.judul,
        description: artikel.ringkasan,
        image: artikel.gambarUtama,
        hashtags: artikel.tags
      };

      // Proses share berdasarkan platform
      let shareUrl = '';
      let success = false;
      let message = '';

      switch (platform) {
        case 'facebook':
          shareUrl = this.generateFacebookShareUrl(shareData);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Artikel berhasil dibagikan ke Facebook' : 'Gagal membagikan ke Facebook';
          break;

        case 'twitter':
          shareUrl = this.generateTwitterShareUrl(shareData, customMessage);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Artikel berhasil dibagikan ke Twitter' : 'Gagal membagikan ke Twitter';
          break;

        case 'linkedin':
          shareUrl = this.generateLinkedInShareUrl(shareData);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Artikel berhasil dibagikan ke LinkedIn' : 'Gagal membagikan ke LinkedIn';
          break;

        case 'whatsapp':
          shareUrl = this.generateWhatsAppShareUrl(shareData, customMessage);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Artikel berhasil dibagikan ke WhatsApp' : 'Gagal membagikan ke WhatsApp';
          break;

        case 'telegram':
          shareUrl = this.generateTelegramShareUrl(shareData, customMessage);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Artikel berhasil dibagikan ke Telegram' : 'Gagal membagikan ke Telegram';
          break;

        case 'email':
          shareUrl = this.generateEmailShareUrl(shareData, customMessage);
          success = await this.openShareWindow(shareUrl);
          message = success ? 'Email client berhasil dibuka' : 'Gagal membuka email client';
          break;

        case 'copy_link':
          success = await this.copyToClipboard(shareData.url);
          message = success ? 'Link artikel berhasil disalin' : 'Gagal menyalin link artikel';
          shareUrl = shareData.url;
          break;

        default:
          return {
            success: false,
            message: 'Platform share tidak didukung'
          };
      }

      // Track share analytics jika berhasil
      if (success) {
        await this.trackShareAnalytics(idArtikel, platform);
      }

      return {
        success,
        message,
        shareUrl
      };

    } catch (error) {
      console.error('Error sharing article:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat membagikan artikel'
      };
    }
  }

  /**
   * Like artikel
   * @param idArtikel - ID artikel
   * @returns Promise<{success: boolean, message: string, totalLikes: number}>
   */
  public async likeArtikel(idArtikel: string): Promise<{
    success: boolean;
    message: string;
    totalLikes: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${idArtikel}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memberikan like');
      }

      // Clear cache
      this.clearCacheByPattern(`artikel_detail_${idArtikel}`);
      this.clearCacheByPattern('artikel_');

      return {
        success: true,
        message: result.message || 'Like berhasil diberikan',
        totalLikes: result.data.totalLikes
      };

    } catch (error) {
      console.error('Error liking article:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memberikan like',
        totalLikes: 0
      };
    }
  }

  /**
   * Tambah komentar artikel
   * @param idArtikel - ID artikel
   * @param komentar - Data komentar
   * @returns Promise<{success: boolean, message: string, komentarId?: string}>
   */
  public async tambahKomentar(
    idArtikel: string,
    komentar: {
      nama: string;
      email: string;
      konten: string;
      parentId?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    komentarId?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${idArtikel}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(komentar)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambahkan komentar');
      }

      // Clear cache
      this.clearCacheByPattern(`artikel_detail_${idArtikel}`);

      return {
        success: true,
        message: 'Komentar berhasil ditambahkan dan menunggu moderasi',
        komentarId: result.data.id
      };

    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan komentar'
      };
    }
  }

  /**
   * Memuat analytics artikel
   * @param idArtikel - ID artikel
   * @param periode - Periode analytics ('7d' | '30d' | '90d' | '1y')
   * @returns Promise<AnalyticsArtikel | null>
   */
  public async muatAnalyticsArtikel(
    idArtikel: string,
    periode: string = '30d'
  ): Promise<AnalyticsArtikel | null> {
    try {
      // Check cache first
      const cacheKey = `artikel_analytics_${idArtikel}_${periode}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/articles/${idArtikel}/analytics?period=${periode}`, {
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
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

    } catch (error) {
      console.error('Error loading article analytics:', error);
      return null;
    }
  }

  /**
   * Generate share URLs untuk berbagai platform
   */
  private generateFacebookShareUrl(shareData: ShareArtikel): string {
    const params = new URLSearchParams({
      u: shareData.url,
      quote: shareData.title
    });
    return `https://www.facebook.com/sharer/sharer.php?${params}`;
  }

  private generateTwitterShareUrl(shareData: ShareArtikel, customMessage?: string): string {
    const text = customMessage || `${shareData.title} - ${shareData.description}`;
    const hashtags = shareData.hashtags?.join(',') || '';
    
    const params = new URLSearchParams({
      url: shareData.url,
      text,
      hashtags
    });
    return `https://twitter.com/intent/tweet?${params}`;
  }

  private generateLinkedInShareUrl(shareData: ShareArtikel): string {
    const params = new URLSearchParams({
      url: shareData.url,
      title: shareData.title,
      summary: shareData.description
    });
    return `https://www.linkedin.com/sharing/share-offsite/?${params}`;
  }

  private generateWhatsAppShareUrl(shareData: ShareArtikel, customMessage?: string): string {
    const text = customMessage || `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
    const params = new URLSearchParams({ text });
    return `https://wa.me/?${params}`;
  }

  private generateTelegramShareUrl(shareData: ShareArtikel, customMessage?: string): string {
    const text = customMessage || `${shareData.title}\n\n${shareData.description}`;
    const params = new URLSearchParams({
      url: shareData.url,
      text
    });
    return `https://t.me/share/url?${params}`;
  }

  private generateEmailShareUrl(shareData: ShareArtikel, customMessage?: string): string {
    const subject = `Artikel Menarik: ${shareData.title}`;
    const body = customMessage || `Halo,\n\nSaya ingin berbagi artikel menarik ini dengan Anda:\n\n${shareData.title}\n\n${shareData.description}\n\nBaca selengkapnya: ${shareData.url}\n\nTerima kasih!`;
    
    const params = new URLSearchParams({
      subject,
      body
    });
    return `mailto:?${params}`;
  }

  /**
   * Utility methods
   */
  private async openShareWindow(url: string): Promise<boolean> {
    try {
      const popup = window.open(
        url,
        'share-popup',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
      return popup !== null;
    } catch (error) {
      console.error('Error opening share window:', error);
      return false;
    }
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback untuk browser lama
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  private async trackShareAnalytics(idArtikel: string, platform: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/articles/${idArtikel}/share-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ platform })
      });
    } catch (error) {
      console.error('Error tracking share analytics:', error);
    }
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
      totalLikes: 0,
      totalShares: 0,
      totalKomentar: 0,
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
      { value: 'trending', label: 'Trending', field: 'shares', direction: 'desc' },
      { value: 'alfabetis', label: 'A-Z', field: 'judul', direction: 'asc' },
      { value: 'most_liked', label: 'Paling Disukai', field: 'likes', direction: 'desc' },
      { value: 'most_commented', label: 'Paling Banyak Komentar', field: 'komentar', direction: 'desc' }
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
    // Convert iterator to array to avoid downlevelIteration issue
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
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

export default KontrollerArtikel;