// ==================== LAYANAN ARTIKEL ====================
// Service untuk mengelola artikel dan konten edukasi
// Sistem Mobilindo Showroom

// ==================== INTERFACES ====================

export interface ArtikelData {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  konten: string;
  kontenHTML: string;
  kategori: KategoriArtikel;
  subKategori?: string;
  tags: string[];
  penulis: PenulisArtikel;
  editor?: PenulisArtikel;
  tanggalPublikasi: Date;
  tanggalUpdate?: Date;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  gambarUtama: string;
  gambarTambahan: string[];
  seo: SEOData;
  statistik: StatistikArtikel;
  komentar: KomentarArtikel[];
  rating: RatingArtikel;
  relatedArticles: string[];
  readingTime: number; // dalam menit
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  trending: boolean;
}

export interface KategoriArtikel {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  icon: string;
  warna: string;
  parentId?: string;
  urutan: number;
  aktif: boolean;
}

export interface PenulisArtikel {
  id: string;
  nama: string;
  email: string;
  avatar: string;
  bio: string;
  expertise: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  totalArtikel: number;
  rating: number;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  schema: any;
}

export interface StatistikArtikel {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  bookmarks: number;
  readTime: number;
  bounceRate: number;
  engagementRate: number;
  viewsHistory: ViewHistory[];
}

export interface ViewHistory {
  tanggal: Date;
  views: number;
  uniqueViews: number;
  avgReadTime: number;
}

export interface KomentarArtikel {
  id: string;
  artikelId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  konten: string;
  tanggal: Date;
  likes: number;
  replies: KomentarArtikel[];
  status: 'approved' | 'pending' | 'rejected';
  parentId?: string;
}

export interface RatingArtikel {
  rataRata: number;
  totalRating: number;
  distribusi: {
    bintang5: number;
    bintang4: number;
    bintang3: number;
    bintang2: number;
    bintang1: number;
  };
}

export interface FilterArtikel {
  kategori?: string[];
  subKategori?: string[];
  tags?: string[];
  penulis?: string[];
  status?: string[];
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
  difficulty?: string[];
  featured?: boolean;
  trending?: boolean;
  search?: string;
  sortBy?: 'tanggal_terbaru' | 'tanggal_terlama' | 'populer' | 'rating' | 'views' | 'judul_az' | 'judul_za';
  limit?: number;
  offset?: number;
}

export interface HasilFilterArtikel {
  articles: ArtikelData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  filters: FilterArtikel;
  suggestions: string[];
  relatedCategories: KategoriArtikel[];
}

export interface KontenArtikelLengkap {
  artikel: ArtikelData;
  kontenParsed: KontenSection[];
  tableOfContents: TableOfContent[];
  relatedArticles: ArtikelData[];
  recommendedArticles: ArtikelData[];
  authorArticles: ArtikelData[];
  socialSharing: SocialSharingData;
  readingProgress: ReadingProgress;
  interactiveElements: InteractiveElement[];
}

export interface KontenSection {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'quote' | 'list' | 'table' | 'code' | 'gallery';
  content: string;
  metadata?: any;
  order: number;
}

export interface TableOfContent {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TableOfContent[];
}

export interface SocialSharingData {
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: string;
  platforms: {
    facebook: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
    telegram: string;
    email: string;
  };
}

export interface ReadingProgress {
  totalWords: number;
  estimatedReadTime: number;
  sections: number;
  images: number;
  videos: number;
}

export interface InteractiveElement {
  id: string;
  type: 'poll' | 'quiz' | 'calculator' | 'comparison' | 'form';
  title: string;
  data: any;
  position: number;
}

export interface ArtikelServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananArtikel {
  private static instance: LayananArtikel;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 menit

  private constructor() {}

  public static getInstance(): LayananArtikel {
    if (!LayananArtikel.instance) {
      LayananArtikel.instance = new LayananArtikel();
    }
    return LayananArtikel.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Filter artikel berdasarkan kategori dan kriteria lainnya
   * @param filter - Kriteria filter untuk artikel
   * @returns Promise<ArtikelServiceResponse<HasilFilterArtikel>>
   */
  public async filterArtikelBerdasarkanKategori(filter: FilterArtikel): Promise<ArtikelServiceResponse<HasilFilterArtikel>> {
    try {
      // Validasi input filter
      const validationResult = this.validateFilterInput(filter);
      if (!validationResult.valid) {
        return {
          success: false,
          message: 'Filter tidak valid',
          errors: validationResult.errors,
          timestamp: new Date()
        };
      }

      // Check cache first
      const cacheKey = `articles_filter_${JSON.stringify(filter)}`;
      const cachedResult = this.getCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          message: 'Artikel berhasil diambil dari cache',
          timestamp: new Date()
        };
      }

      // Ambil semua artikel dari database/storage
      const allArticles = await this.getAllArticlesFromStorage();
      
      // Apply filters
      let filteredArticles = this.applyFilters(allArticles, filter);
      
      // Apply search if provided
      if (filter.search) {
        filteredArticles = this.applySearchFilter(filteredArticles, filter.search);
      }

      // Apply sorting
      if (filter.sortBy) {
        filteredArticles = this.sortArticles(filteredArticles, filter.sortBy);
      }

      // Calculate pagination
      const limit = filter.limit || 10;
      const offset = filter.offset || 0;
      const totalCount = filteredArticles.length;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      // Get paginated results
      const paginatedArticles = filteredArticles.slice(offset, offset + limit);

      // Generate suggestions and related categories
      const suggestions = await this.generateSearchSuggestions(filter, allArticles);
      const relatedCategories = await this.getRelatedCategories(filter);

      const result: HasilFilterArtikel = {
        articles: paginatedArticles,
        totalCount,
        totalPages,
        currentPage,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        filters: filter,
        suggestions,
        relatedCategories
      };

      // Cache the result
      this.setCache(cacheKey, result);

      // Log search analytics
      await this.logSearchAnalytics(filter, totalCount);

      return {
        success: true,
        data: result,
        message: `Ditemukan ${totalCount} artikel sesuai kriteria`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error filtering articles:', error);
      return {
        success: false,
        message: 'Gagal memfilter artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Muat konten artikel lengkap beserta elemen pendukung
   * @param artikelId - ID artikel atau slug artikel
   * @param userId - ID pengguna (opsional untuk personalisasi)
   * @returns Promise<ArtikelServiceResponse<KontenArtikelLengkap>>
   */
  public async muatKontenArtikel(artikelId: string, userId?: string): Promise<ArtikelServiceResponse<KontenArtikelLengkap>> {
    try {
      // Validasi input
      if (!artikelId || artikelId.trim() === '') {
        return {
          success: false,
          message: 'ID artikel tidak valid',
          errors: ['Article ID is required'],
          timestamp: new Date()
        };
      }

      // Check cache first
      const cacheKey = `article_content_${artikelId}_${userId || 'anonymous'}`;
      const cachedContent = this.getCache(cacheKey);
      if (cachedContent) {
        // Update view count even for cached content
        await this.updateViewCount(artikelId, userId);
        
        return {
          success: true,
          data: cachedContent,
          message: 'Konten artikel berhasil dimuat dari cache',
          timestamp: new Date()
        };
      }

      // Ambil data artikel utama
      const artikel = await this.getArticleById(artikelId);
      if (!artikel) {
        return {
          success: false,
          message: 'Artikel tidak ditemukan',
          errors: ['Article not found'],
          timestamp: new Date()
        };
      }

      // Cek status artikel
      if (artikel.status !== 'published') {
        return {
          success: false,
          message: 'Artikel tidak tersedia',
          errors: ['Article not published'],
          timestamp: new Date()
        };
      }

      // Parse konten artikel menjadi sections
      const kontenParsed = await this.parseArticleContent(artikel.konten);
      
      // Generate table of contents
      const tableOfContents = this.generateTableOfContents(kontenParsed);
      
      // Ambil artikel terkait
      const relatedArticles = await this.getRelatedArticles(artikel);
      
      // Generate rekomendasi artikel
      const recommendedArticles = await this.getRecommendedArticles(artikel, userId);
      
      // Ambil artikel lain dari penulis yang sama
      const authorArticles = await this.getAuthorArticles(artikel.penulis.id, artikel.id);
      
      // Generate social sharing data
      const socialSharing = this.generateSocialSharingData(artikel);
      
      // Calculate reading progress
      const readingProgress = this.calculateReadingProgress(kontenParsed);
      
      // Get interactive elements
      const interactiveElements = await this.getInteractiveElements(artikel.id);

      const kontenLengkap: KontenArtikelLengkap = {
        artikel,
        kontenParsed,
        tableOfContents,
        relatedArticles,
        recommendedArticles,
        authorArticles,
        socialSharing,
        readingProgress,
        interactiveElements
      };

      // Cache the result
      this.setCache(cacheKey, kontenLengkap);

      // Update view count and user activity
      await this.updateViewCount(artikel.id, userId);
      if (userId) {
        await this.updateUserReadingHistory(userId, artikel.id);
      }

      // Log reading analytics
      await this.logReadingAnalytics(artikel.id, userId);

      return {
        success: true,
        data: kontenLengkap,
        message: 'Konten artikel berhasil dimuat',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error loading article content:', error);
      return {
        success: false,
        message: 'Gagal memuat konten artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  // ==================== METODE PEMBANTU ====================

  private validateFilterInput(filter: FilterArtikel): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate limit and offset
    if (filter.limit && (filter.limit < 1 || filter.limit > 100)) {
      errors.push('Limit harus antara 1-100');
    }

    if (filter.offset && filter.offset < 0) {
      errors.push('Offset tidak boleh negatif');
    }

    // Validate date range
    if (filter.tanggalMulai && filter.tanggalAkhir) {
      if (filter.tanggalMulai > filter.tanggalAkhir) {
        errors.push('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }
    }

    // Validate search length
    if (filter.search && filter.search.length < 2) {
      errors.push('Kata kunci pencarian minimal 2 karakter');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async getAllArticlesFromStorage(): Promise<ArtikelData[]> {
    // Mock data - in real implementation, this would fetch from database
    const mockArticles: ArtikelData[] = [
      {
        id: 'artikel_001',
        judul: 'Tips Memilih Mobil Keluarga yang Tepat',
        slug: 'tips-memilih-mobil-keluarga-yang-tepat',
        ringkasan: 'Panduan lengkap untuk memilih mobil keluarga yang sesuai dengan kebutuhan dan budget Anda.',
        konten: 'Konten artikel lengkap tentang tips memilih mobil keluarga...',
        kontenHTML: '<p>Konten artikel dalam format HTML...</p>',
        kategori: {
          id: 'cat_001',
          nama: 'Tips & Panduan',
          slug: 'tips-panduan',
          deskripsi: 'Tips dan panduan seputar otomotif',
          icon: 'lightbulb',
          warna: '#3B82F6',
          urutan: 1,
          aktif: true
        },
        subKategori: 'Pembelian Mobil',
        tags: ['mobil keluarga', 'tips', 'panduan', 'pembelian'],
        penulis: {
          id: 'author_001',
          nama: 'Ahmad Rizki',
          email: 'ahmad@mobilindo.com',
          avatar: '/images/authors/ahmad.jpg',
          bio: 'Expert otomotif dengan pengalaman 10 tahun',
          expertise: ['Mobil Keluarga', 'SUV', 'MPV'],
          socialMedia: {
            linkedin: 'https://linkedin.com/in/ahmadrizki',
            twitter: '@ahmadrizki'
          },
          totalArtikel: 45,
          rating: 4.8
        },
        tanggalPublikasi: new Date('2024-01-15'),
        status: 'published',
        gambarUtama: '/images/articles/mobil-keluarga-main.jpg',
        gambarTambahan: [
          '/images/articles/mobil-keluarga-1.jpg',
          '/images/articles/mobil-keluarga-2.jpg'
        ],
        seo: {
          metaTitle: 'Tips Memilih Mobil Keluarga yang Tepat - Mobilindo',
          metaDescription: 'Panduan lengkap memilih mobil keluarga terbaik sesuai kebutuhan dan budget Anda.',
          metaKeywords: ['mobil keluarga', 'tips', 'panduan', 'otomotif'],
          canonicalUrl: 'https://mobilindo.com/artikel/tips-memilih-mobil-keluarga-yang-tepat',
          ogTitle: 'Tips Memilih Mobil Keluarga yang Tepat',
          ogDescription: 'Panduan lengkap memilih mobil keluarga terbaik',
          ogImage: '/images/articles/mobil-keluarga-og.jpg',
          twitterCard: 'summary_large_image',
          schema: {}
        },
        statistik: {
          views: 15420,
          likes: 234,
          shares: 89,
          comments: 45,
          bookmarks: 156,
          readTime: 8,
          bounceRate: 0.25,
          engagementRate: 0.68,
          viewsHistory: []
        },
        komentar: [],
        rating: {
          rataRata: 4.6,
          totalRating: 89,
          distribusi: {
            bintang5: 45,
            bintang4: 32,
            bintang3: 8,
            bintang2: 3,
            bintang1: 1
          }
        },
        relatedArticles: ['artikel_002', 'artikel_003'],
        readingTime: 8,
        difficulty: 'beginner',
        featured: true,
        trending: true
      },
      {
        id: 'artikel_002',
        judul: 'Perawatan Rutin Mobil untuk Performa Optimal',
        slug: 'perawatan-rutin-mobil-untuk-performa-optimal',
        ringkasan: 'Jadwal dan tips perawatan rutin mobil agar tetap dalam kondisi prima.',
        konten: 'Konten artikel tentang perawatan mobil...',
        kontenHTML: '<p>Konten perawatan mobil dalam HTML...</p>',
        kategori: {
          id: 'cat_002',
          nama: 'Perawatan',
          slug: 'perawatan',
          deskripsi: 'Tips perawatan dan maintenance mobil',
          icon: 'wrench',
          warna: '#10B981',
          urutan: 2,
          aktif: true
        },
        subKategori: 'Maintenance',
        tags: ['perawatan', 'maintenance', 'service', 'tips'],
        penulis: {
          id: 'author_002',
          nama: 'Sari Indah',
          email: 'sari@mobilindo.com',
          avatar: '/images/authors/sari.jpg',
          bio: 'Mekanik berpengalaman dan penulis artikel otomotif',
          expertise: ['Maintenance', 'Engine', 'Troubleshooting'],
          socialMedia: {
            instagram: '@sariindah_auto'
          },
          totalArtikel: 32,
          rating: 4.7
        },
        tanggalPublikasi: new Date('2024-01-10'),
        status: 'published',
        gambarUtama: '/images/articles/perawatan-mobil-main.jpg',
        gambarTambahan: [],
        seo: {
          metaTitle: 'Perawatan Rutin Mobil untuk Performa Optimal',
          metaDescription: 'Jadwal dan tips perawatan rutin mobil agar tetap prima',
          metaKeywords: ['perawatan mobil', 'maintenance', 'service'],
          canonicalUrl: 'https://mobilindo.com/artikel/perawatan-rutin-mobil-untuk-performa-optimal',
          ogTitle: 'Perawatan Rutin Mobil untuk Performa Optimal',
          ogDescription: 'Tips perawatan mobil agar tetap prima',
          ogImage: '/images/articles/perawatan-mobil-og.jpg',
          twitterCard: 'summary',
          schema: {}
        },
        statistik: {
          views: 12350,
          likes: 189,
          shares: 67,
          comments: 34,
          bookmarks: 123,
          readTime: 6,
          bounceRate: 0.30,
          engagementRate: 0.55,
          viewsHistory: []
        },
        komentar: [],
        rating: {
          rataRata: 4.4,
          totalRating: 67,
          distribusi: {
            bintang5: 32,
            bintang4: 25,
            bintang3: 7,
            bintang2: 2,
            bintang1: 1
          }
        },
        relatedArticles: ['artikel_001', 'artikel_003'],
        readingTime: 6,
        difficulty: 'intermediate',
        featured: false,
        trending: false
      }
    ];

    return mockArticles;
  }

  private applyFilters(articles: ArtikelData[], filter: FilterArtikel): ArtikelData[] {
    let filtered = [...articles];

    // Filter by category
    if (filter.kategori && filter.kategori.length > 0) {
      filtered = filtered.filter(article => 
        filter.kategori!.includes(article.kategori.id) || 
        filter.kategori!.includes(article.kategori.slug)
      );
    }

    // Filter by subcategory
    if (filter.subKategori && filter.subKategori.length > 0) {
      filtered = filtered.filter(article => 
        article.subKategori && filter.subKategori!.includes(article.subKategori)
      );
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(article => 
        filter.tags!.some(tag => article.tags.includes(tag))
      );
    }

    // Filter by author
    if (filter.penulis && filter.penulis.length > 0) {
      filtered = filtered.filter(article => 
        filter.penulis!.includes(article.penulis.id)
      );
    }

    // Filter by status
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(article => 
        filter.status!.includes(article.status)
      );
    }

    // Filter by date range
    if (filter.tanggalMulai) {
      filtered = filtered.filter(article => 
        article.tanggalPublikasi >= filter.tanggalMulai!
      );
    }

    if (filter.tanggalAkhir) {
      filtered = filtered.filter(article => 
        article.tanggalPublikasi <= filter.tanggalAkhir!
      );
    }

    // Filter by difficulty
    if (filter.difficulty && filter.difficulty.length > 0) {
      filtered = filtered.filter(article => 
        filter.difficulty!.includes(article.difficulty)
      );
    }

    // Filter by featured
    if (filter.featured !== undefined) {
      filtered = filtered.filter(article => article.featured === filter.featured);
    }

    // Filter by trending
    if (filter.trending !== undefined) {
      filtered = filtered.filter(article => article.trending === filter.trending);
    }

    return filtered;
  }

  private applySearchFilter(articles: ArtikelData[], searchTerm: string): ArtikelData[] {
    const term = searchTerm.toLowerCase();
    
    return articles.filter(article => 
      article.judul.toLowerCase().includes(term) ||
      article.ringkasan.toLowerCase().includes(term) ||
      article.konten.toLowerCase().includes(term) ||
      article.tags.some(tag => tag.toLowerCase().includes(term)) ||
      article.penulis.nama.toLowerCase().includes(term) ||
      article.kategori.nama.toLowerCase().includes(term)
    );
  }

  private sortArticles(articles: ArtikelData[], sortBy: string): ArtikelData[] {
    const sorted = [...articles];

    switch (sortBy) {
      case 'tanggal_terbaru':
        return sorted.sort((a, b) => b.tanggalPublikasi.getTime() - a.tanggalPublikasi.getTime());
      case 'tanggal_terlama':
        return sorted.sort((a, b) => a.tanggalPublikasi.getTime() - b.tanggalPublikasi.getTime());
      case 'populer':
        return sorted.sort((a, b) => b.statistik.views - a.statistik.views);
      case 'rating':
        return sorted.sort((a, b) => b.rating.rataRata - a.rating.rataRata);
      case 'views':
        return sorted.sort((a, b) => b.statistik.views - a.statistik.views);
      case 'judul_az':
        return sorted.sort((a, b) => a.judul.localeCompare(b.judul));
      case 'judul_za':
        return sorted.sort((a, b) => b.judul.localeCompare(a.judul));
      default:
        return sorted;
    }
  }

  private async generateSearchSuggestions(filter: FilterArtikel, allArticles: ArtikelData[]): Promise<string[]> {
    // Generate suggestions based on popular tags and categories
    const suggestions: string[] = [];
    
    // Popular tags
    const tagCounts: { [tag: string]: number } = {};
    allArticles.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const popularTags = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 5);
    
    suggestions.push(...popularTags);
    
    // Popular categories
    const categoryCounts: { [category: string]: number } = {};
    allArticles.forEach(article => {
      categoryCounts[article.kategori.nama] = (categoryCounts[article.kategori.nama] || 0) + 1;
    });
    
    const popularCategories = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 3);
    
    suggestions.push(...popularCategories);
    
    return suggestions.slice(0, 8);
  }

  private async getRelatedCategories(filter: FilterArtikel): Promise<KategoriArtikel[]> {
    // Mock related categories
    return [
      {
        id: 'cat_001',
        nama: 'Tips & Panduan',
        slug: 'tips-panduan',
        deskripsi: 'Tips dan panduan seputar otomotif',
        icon: 'lightbulb',
        warna: '#3B82F6',
        urutan: 1,
        aktif: true
      },
      {
        id: 'cat_002',
        nama: 'Perawatan',
        slug: 'perawatan',
        deskripsi: 'Tips perawatan dan maintenance mobil',
        icon: 'wrench',
        warna: '#10B981',
        urutan: 2,
        aktif: true
      }
    ];
  }

  private async getArticleById(artikelId: string): Promise<ArtikelData | null> {
    const allArticles = await this.getAllArticlesFromStorage();
    return allArticles.find(article => 
      article.id === artikelId || article.slug === artikelId
    ) || null;
  }

  private async parseArticleContent(content: string): Promise<KontenSection[]> {
    // Mock content parsing - in real implementation, this would parse markdown/HTML
    const sections: KontenSection[] = [
      {
        id: 'section_1',
        type: 'heading',
        content: 'Pendahuluan',
        order: 1
      },
      {
        id: 'section_2',
        type: 'paragraph',
        content: 'Memilih mobil keluarga yang tepat adalah keputusan penting...',
        order: 2
      },
      {
        id: 'section_3',
        type: 'image',
        content: '/images/articles/mobil-keluarga-comparison.jpg',
        metadata: {
          alt: 'Perbandingan mobil keluarga',
          caption: 'Berbagai pilihan mobil keluarga di Indonesia'
        },
        order: 3
      },
      {
        id: 'section_4',
        type: 'heading',
        content: 'Faktor-faktor yang Perlu Dipertimbangkan',
        order: 4
      },
      {
        id: 'section_5',
        type: 'list',
        content: JSON.stringify([
          'Budget yang tersedia',
          'Jumlah anggota keluarga',
          'Kebutuhan ruang bagasi',
          'Konsumsi bahan bakar',
          'Biaya perawatan'
        ]),
        order: 5
      }
    ];

    return sections;
  }

  private generateTableOfContents(sections: KontenSection[]): TableOfContent[] {
    const headings = sections.filter(section => section.type === 'heading');
    
    return headings.map((heading, index) => ({
      id: `toc_${index + 1}`,
      title: heading.content,
      level: 2, // Assuming all are h2 for simplicity
      anchor: `#${heading.content.toLowerCase().replace(/\s+/g, '-')}`,
      children: []
    }));
  }

  private async getRelatedArticles(artikel: ArtikelData): Promise<ArtikelData[]> {
    const allArticles = await this.getAllArticlesFromStorage();
    
    // Find articles with similar tags or same category
    const related = allArticles.filter(other => 
      other.id !== artikel.id &&
      (other.kategori.id === artikel.kategori.id ||
       other.tags.some(tag => artikel.tags.includes(tag)))
    );

    return related.slice(0, 3);
  }

  private async getRecommendedArticles(artikel: ArtikelData, userId?: string): Promise<ArtikelData[]> {
    const allArticles = await this.getAllArticlesFromStorage();
    
    // Simple recommendation based on popularity and category
    const recommended = allArticles
      .filter(other => other.id !== artikel.id)
      .sort((a, b) => b.statistik.views - a.statistik.views);

    return recommended.slice(0, 4);
  }

  private async getAuthorArticles(authorId: string, excludeId: string): Promise<ArtikelData[]> {
    const allArticles = await this.getAllArticlesFromStorage();
    
    return allArticles
      .filter(article => 
        article.penulis.id === authorId && 
        article.id !== excludeId &&
        article.status === 'published'
      )
      .slice(0, 3);
  }

  private generateSocialSharingData(artikel: ArtikelData): SocialSharingData {
    const baseUrl = 'https://mobilindo.com';
    const shareUrl = `${baseUrl}/artikel/${artikel.slug}`;
    const shareTitle = artikel.judul;
    const shareDescription = artikel.ringkasan;
    const shareImage = `${baseUrl}${artikel.gambarUtama}`;

    return {
      shareUrl,
      shareTitle,
      shareDescription,
      shareImage,
      platforms: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`
      }
    };
  }

  private calculateReadingProgress(sections: KontenSection[]): ReadingProgress {
    const totalWords = sections
      .filter(section => section.type === 'paragraph' || section.type === 'list')
      .reduce((count, section) => {
        const words = section.content.split(/\s+/).length;
        return count + words;
      }, 0);

    const images = sections.filter(section => section.type === 'image').length;
    const videos = sections.filter(section => section.type === 'video').length;
    
    // Estimate 200 words per minute reading speed
    const estimatedReadTime = Math.ceil(totalWords / 200);

    return {
      totalWords,
      estimatedReadTime,
      sections: sections.length,
      images,
      videos
    };
  }

  private async getInteractiveElements(artikelId: string): Promise<InteractiveElement[]> {
    // Mock interactive elements
    return [
      {
        id: 'interactive_1',
        type: 'calculator',
        title: 'Kalkulator Cicilan Mobil',
        data: {
          type: 'loan_calculator',
          fields: ['harga', 'dp', 'tenor']
        },
        position: 3
      },
      {
        id: 'interactive_2',
        type: 'poll',
        title: 'Merk mobil favorit Anda?',
        data: {
          options: ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki'],
          votes: [45, 32, 18, 12]
        },
        position: 5
      }
    ];
  }

  private async updateViewCount(artikelId: string, userId?: string): Promise<void> {
    // Mock implementation - in real app, this would update database
    console.log(`Updating view count for article ${artikelId}, user: ${userId || 'anonymous'}`);
  }

  private async updateUserReadingHistory(userId: string, artikelId: string): Promise<void> {
    // Mock implementation - in real app, this would update user reading history
    console.log(`Updating reading history for user ${userId}, article: ${artikelId}`);
  }

  private async logSearchAnalytics(filter: FilterArtikel, resultCount: number): Promise<void> {
    // Mock implementation - in real app, this would send to analytics service
    console.log('Search analytics:', { filter, resultCount, timestamp: new Date() });
  }

  private async logReadingAnalytics(artikelId: string, userId?: string): Promise<void> {
    // Mock implementation - in real app, this would send to analytics service
    console.log('Reading analytics:', { artikelId, userId, timestamp: new Date() });
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // ==================== METODE UTILITAS TAMBAHAN ====================

  /**
   * Get popular articles
   */
  public async getPopularArticles(limit: number = 5): Promise<ArtikelServiceResponse<ArtikelData[]>> {
    try {
      const allArticles = await this.getAllArticlesFromStorage();
      const popular = allArticles
        .filter(article => article.status === 'published')
        .sort((a, b) => b.statistik.views - a.statistik.views)
        .slice(0, limit);

      return {
        success: true,
        data: popular,
        message: `${popular.length} artikel populer berhasil dimuat`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengambil artikel populer',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Get featured articles
   */
  public async getFeaturedArticles(): Promise<ArtikelServiceResponse<ArtikelData[]>> {
    try {
      const allArticles = await this.getAllArticlesFromStorage();
      const featured = allArticles.filter(article => 
        article.status === 'published' && article.featured
      );

      return {
        success: true,
        data: featured,
        message: `${featured.length} artikel unggulan berhasil dimuat`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengambil artikel unggulan',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Get all categories
   */
  public async getAllCategories(): Promise<ArtikelServiceResponse<KategoriArtikel[]>> {
    try {
      const categories: KategoriArtikel[] = [
        {
          id: 'cat_001',
          nama: 'Tips & Panduan',
          slug: 'tips-panduan',
          deskripsi: 'Tips dan panduan seputar otomotif',
          icon: 'lightbulb',
          warna: '#3B82F6',
          urutan: 1,
          aktif: true
        },
        {
          id: 'cat_002',
          nama: 'Perawatan',
          slug: 'perawatan',
          deskripsi: 'Tips perawatan dan maintenance mobil',
          icon: 'wrench',
          warna: '#10B981',
          urutan: 2,
          aktif: true
        },
        {
          id: 'cat_003',
          nama: 'Review Mobil',
          slug: 'review-mobil',
          deskripsi: 'Review dan ulasan mobil terbaru',
          icon: 'star',
          warna: '#F59E0B',
          urutan: 3,
          aktif: true
        }
      ];

      return {
        success: true,
        data: categories,
        message: 'Kategori artikel berhasil dimuat',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengambil kategori artikel',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }
}

// ==================== EXPORT SINGLETON ====================
export const layananArtikel = LayananArtikel.getInstance();

// Default export for compatibility
export default LayananArtikel;