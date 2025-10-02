/**
 * EntitasKnowledge - Kelas untuk mengelola knowledge base dan dokumentasi
 * Menangani artikel, FAQ, panduan, dan konten edukasi untuk customer dan staff
 */

export interface IEntitasKnowledge {
  idKnowledge: string;
  idKategori: string;
  idPenulis: string;
  judulKnowledge: string;
  kontenKnowledge: string;
  ringkasanKnowledge: string;
  tagKnowledge: string[];
  statusKnowledge: string;
  tingkatKesulitan: string;
  estimasiWaktuBaca: number;
  jumlahView: number;
  ratingKnowledge: number;
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  updatedAt: Date;
}

export interface IKnowledgeCategory {
  idKategori: string;
  namaKategori: string;
  deskripsiKategori: string;
  parentKategori?: string;
  iconKategori: string;
  urutanKategori: number;
}

export interface IKnowledgeAnalytics {
  totalArticles: number;
  totalViews: number;
  averageRating: number;
  popularTags: string[];
  topArticles: IEntitasKnowledge[];
  categoryDistribution: Record<string, number>;
}

export interface IKnowledgeSearch {
  query: string;
  filters: {
    kategori?: string;
    tingkatKesulitan?: string;
    rating?: number;
    tags?: string[];
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface IKnowledgeRecommendation {
  idKnowledge: string;
  judulKnowledge: string;
  score: number;
  reason: string;
}

export class EntitasKnowledge implements IEntitasKnowledge {
  // Attributes
  public idKnowledge: string;
  public idKategori: string;
  public idPenulis: string;
  public judulKnowledge: string;
  public kontenKnowledge: string;
  public ringkasanKnowledge: string;
  public tagKnowledge: string[];
  public statusKnowledge: string;
  public tingkatKesulitan: string;
  public estimasiWaktuBaca: number;
  public jumlahView: number;
  public ratingKnowledge: number;
  public tanggalDibuat: Date;
  public tanggalDiperbarui: Date;
  public updatedAt: Date;

  constructor(data: Partial<IEntitasKnowledge> = {}) {
    this.idKnowledge = data.idKnowledge || this.generateId();
    this.idKategori = data.idKategori || '';
    this.idPenulis = data.idPenulis || '';
    this.judulKnowledge = data.judulKnowledge || '';
    this.kontenKnowledge = data.kontenKnowledge || '';
    this.ringkasanKnowledge = data.ringkasanKnowledge || '';
    this.tagKnowledge = data.tagKnowledge || [];
    this.statusKnowledge = data.statusKnowledge || 'DRAFT';
    this.tingkatKesulitan = data.tingkatKesulitan || 'BEGINNER';
    this.estimasiWaktuBaca = data.estimasiWaktuBaca || 0;
    this.jumlahView = data.jumlahView || 0;
    this.ratingKnowledge = data.ratingKnowledge || 0;
    this.tanggalDibuat = data.tanggalDibuat || new Date();
    this.tanggalDiperbarui = data.tanggalDiperbarui || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Main Methods

  /**
   * Mencari artikel knowledge berdasarkan kriteria pencarian
   * @param searchParams - Parameter pencarian
   * @returns Promise<IEntitasKnowledge[]> - Array artikel yang ditemukan
   */
  public async cariArtikel(searchParams: IKnowledgeSearch): Promise<IEntitasKnowledge[]> {
    try {
      console.log('[EntitasKnowledge] Mencari artikel dengan parameter:', searchParams);
      
      await this.simulateDelay(300);
      
      // Validasi parameter pencarian
      await this.validateSearchParams(searchParams);
      
      // Ambil semua artikel dari database
      const allArticles = await this.fetchAllArticles();
      
      // Filter berdasarkan query text
      let filteredArticles = await this.filterByQuery(allArticles, searchParams.query);
      
      // Apply filters
      filteredArticles = await this.applyFilters(filteredArticles, searchParams.filters);
      
      // Sort hasil
      filteredArticles = await this.sortResults(filteredArticles, searchParams.sortBy, searchParams.sortOrder);
      
      // Update search analytics
      await this.updateSearchAnalytics(searchParams, filteredArticles.length);
      
      // Log search activity
      await this.logSearchActivity(searchParams, filteredArticles.length);
      
      // Generate search suggestions
      await this.generateSearchSuggestions(searchParams);
      
      console.log(`[EntitasKnowledge] Ditemukan ${filteredArticles.length} artikel`);
      return filteredArticles;
      
    } catch (error) {
      console.error('[EntitasKnowledge] Error mencari artikel:', error);
      await this.handleKnowledgeError(error as Error);
      throw error;
    }
  }

  /**
   * Mengambil artikel berdasarkan kategori tertentu
   * @param idKategori - ID kategori yang dicari
   * @param includeSubcategories - Apakah termasuk subkategori
   * @returns Promise<IEntitasKnowledge[]> - Array artikel dalam kategori
   */
  public async ambilArtikelByKategori(idKategori: string, includeSubcategories: boolean = false): Promise<IEntitasKnowledge[]> {
    try {
      console.log(`[EntitasKnowledge] Mengambil artikel kategori ${idKategori}...`);
      
      await this.simulateDelay(250);
      
      // Validasi kategori exists
      const kategori = await this.validateCategory(idKategori);
      
      // Ambil artikel dari kategori utama
      let articles = await this.fetchArticlesByCategory(idKategori);
      
      // Jika include subcategories, ambil juga dari subkategori
      if (includeSubcategories) {
        const subcategories = await this.getSubcategories(idKategori);
        for (const subcat of subcategories) {
          const subcatArticles = await this.fetchArticlesByCategory(subcat.idKategori);
          articles = articles.concat(subcatArticles);
        }
      }
      
      // Filter hanya artikel yang published
      articles = articles.filter(article => article.statusKnowledge === 'PUBLISHED');
      
      // Sort berdasarkan popularitas dan tanggal
      articles = await this.sortByPopularityAndDate(articles);
      
      // Update category analytics
      await this.updateCategoryAnalytics(idKategori, articles.length);
      
      // Generate category insights
      await this.generateCategoryInsights(idKategori, articles);
      
      // Log category access
      await this.logCategoryAccess(idKategori, articles.length);
      
      console.log(`[EntitasKnowledge] Ditemukan ${articles.length} artikel dalam kategori`);
      return articles;
      
    } catch (error) {
      console.error('[EntitasKnowledge] Error mengambil artikel kategori:', error);
      await this.handleKnowledgeError(error as Error);
      throw error;
    }
  }

  /**
   * Memberikan rekomendasi artikel berdasarkan preferensi user
   * @param userId - ID user untuk personalisasi
   * @param currentArticleId - ID artikel yang sedang dibaca (opsional)
   * @param limit - Jumlah maksimal rekomendasi
   * @returns Promise<IKnowledgeRecommendation[]> - Array rekomendasi artikel
   */
  public async rekomendasiArtikel(userId?: string, currentArticleId?: string, limit: number = 5): Promise<IKnowledgeRecommendation[]> {
    try {
      console.log(`[EntitasKnowledge] Generating rekomendasi untuk user ${userId}...`);
      
      await this.simulateDelay(400);
      
      // Ambil user preferences dan history
      const userPreferences = await this.getUserPreferences(userId);
      const readingHistory = await this.getReadingHistory(userId);
      
      // Ambil semua artikel yang tersedia
      const availableArticles = await this.getAvailableArticles();
      
      // Generate recommendations berdasarkan berbagai algoritma
      const contentBasedRecs = await this.generateContentBasedRecommendations(
        currentArticleId, availableArticles, limit
      );
      
      const collaborativeRecs = await this.generateCollaborativeRecommendations(
        userId, readingHistory, availableArticles, limit
      );
      
      const popularityRecs = await this.generatePopularityRecommendations(
        availableArticles, limit
      );
      
      const categoryRecs = await this.generateCategoryRecommendations(
        userPreferences, availableArticles, limit
      );
      
      // Combine dan rank semua rekomendasi
      const combinedRecs = await this.combineRecommendations([
        contentBasedRecs,
        collaborativeRecs,
        popularityRecs,
        categoryRecs
      ]);
      
      // Filter artikel yang sudah dibaca
      const filteredRecs = await this.filterReadArticles(combinedRecs, readingHistory);
      
      // Diversify recommendations
      const diversifiedRecs = await this.diversifyRecommendations(filteredRecs);
      
      // Limit hasil
      const finalRecs = diversifiedRecs.slice(0, limit);
      
      // Update recommendation analytics
      await this.updateRecommendationAnalytics(userId, finalRecs);
      
      // Log recommendation activity
      await this.logRecommendationActivity(userId, finalRecs.length);
      
      console.log(`[EntitasKnowledge] Generated ${finalRecs.length} rekomendasi`);
      return finalRecs;
      
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating rekomendasi:', error);
      await this.handleKnowledgeError(error as Error);
      throw error;
    }
  }

  /**
   * Menganalisis performa dan engagement artikel knowledge
   * @param timeRange - Rentang waktu analisis (days)
   * @returns Promise<IKnowledgeAnalytics> - Data analytics knowledge
   */
  public async analisisPerforma(timeRange: number = 30): Promise<IKnowledgeAnalytics> {
    try {
      console.log(`[EntitasKnowledge] Menganalisis performa ${timeRange} hari terakhir...`);
      
      await this.simulateDelay(500);
      
      // Ambil data artikel dalam rentang waktu
      const articles = await this.getArticlesInTimeRange(timeRange);
      
      // Hitung total articles dan views
      const totalArticles = articles.length;
      const totalViews = articles.reduce((sum, article) => sum + article.jumlahView, 0);
      
      // Hitung average rating
      const articlesWithRating = articles.filter(article => article.ratingKnowledge > 0);
      const averageRating = articlesWithRating.length > 0
        ? articlesWithRating.reduce((sum, article) => sum + article.ratingKnowledge, 0) / articlesWithRating.length
        : 0;
      
      // Analisis popular tags
      const popularTags = await this.analyzePopularTags(articles);
      
      // Identifikasi top articles
      const topArticles = await this.identifyTopArticles(articles);
      
      // Analisis distribusi kategori
      const categoryDistribution = await this.analyzeCategoryDistribution(articles);
      
      // Generate engagement metrics
      const engagementMetrics = await this.calculateEngagementMetrics(articles);
      
      // Analisis tren waktu
      const timeSeriesAnalysis = await this.analyzeTimeSeries(articles, timeRange);
      
      // Generate content quality insights
      const qualityInsights = await this.analyzeContentQuality(articles);
      
      // Analisis user behavior
      const userBehaviorAnalysis = await this.analyzeUserBehavior(articles);
      
      const analytics: IKnowledgeAnalytics = {
        totalArticles,
        totalViews,
        averageRating,
        popularTags,
        topArticles,
        categoryDistribution
      };
      
      // Generate comprehensive report
      await this.generateAnalyticsReport(analytics, engagementMetrics, timeSeriesAnalysis, qualityInsights);
      
      // Update dashboard metrics
      await this.updateDashboardMetrics(analytics);
      
      // Log analytics activity
      await this.logAnalyticsActivity(timeRange, analytics);
      
      console.log('[EntitasKnowledge] Analisis performa selesai:', analytics);
      return analytics;
      
    } catch (error) {
      console.error('[EntitasKnowledge] Error analisis performa:', error);
      await this.handleKnowledgeError(error as Error);
      throw error;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `KB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateSearchParams(params: IKnowledgeSearch): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (!params.query && !params.filters) {
        errors.push('Query atau filter harus diisi');
      }
      
      if (params.query && params.query.length < 2) {
        errors.push('Query minimal 2 karakter');
      }
      
      if (params.sortBy && !['relevance', 'date', 'rating', 'views'].includes(params.sortBy)) {
        errors.push('Sort by tidak valid');
      }
      
      if (errors.length > 0) {
        throw new Error(`Validasi search gagal: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Search validation error:', error);
      throw error;
    }
  }

  private async fetchAllArticles(): Promise<IEntitasKnowledge[]> {
    try {
      console.log('[EntitasKnowledge] Fetching all articles...');
      
      // Simulasi data artikel
      const articles: IEntitasKnowledge[] = [];
      const categories = ['CAR_GUIDE', 'MAINTENANCE', 'FINANCING', 'INSURANCE', 'LEGAL', 'TECHNOLOGY'];
      const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
      const statuses = ['PUBLISHED', 'DRAFT', 'REVIEW'];
      
      // Generate 50-100 sample articles
      const articleCount = Math.floor(Math.random() * 50) + 50;
      
      for (let i = 0; i < articleCount; i++) {
        const createdDate = new Date(Date.now() - Math.random() * 31536000000); // dalam 1 tahun terakhir
        const category = categories[Math.floor(Math.random() * categories.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const article: IEntitasKnowledge = {
          idKnowledge: this.generateId(),
          idKategori: category,
          idPenulis: `AUTHOR-${Math.floor(Math.random() * 10) + 1}`,
          judulKnowledge: this.generateArticleTitle(category),
          kontenKnowledge: this.generateArticleContent(),
          ringkasanKnowledge: this.generateArticleSummary(),
          tagKnowledge: this.generateArticleTags(category),
          statusKnowledge: status,
          tingkatKesulitan: difficulty,
          estimasiWaktuBaca: Math.floor(Math.random() * 15) + 2, // 2-17 menit
          jumlahView: Math.floor(Math.random() * 1000),
          ratingKnowledge: Math.random() * 5,
          tanggalDibuat: createdDate,
          tanggalDiperbarui: new Date(createdDate.getTime() + Math.random() * 2592000000), // +30 hari
          updatedAt: new Date()
        };
        
        articles.push(article);
      }
      
      await this.simulateDelay(200);
      return articles;
      
    } catch (error) {
      console.error('[EntitasKnowledge] Error fetching articles:', error);
      throw error;
    }
  }

  private generateArticleTitle(category: string): string {
    const titles: Record<string, string[]> = {
      'CAR_GUIDE': [
        'Panduan Memilih Mobil Pertama',
        'Tips Membeli Mobil Bekas Berkualitas',
        'Cara Menentukan Budget Mobil yang Tepat',
        'Panduan Test Drive yang Efektif'
      ],
      'MAINTENANCE': [
        'Jadwal Perawatan Rutin Mobil',
        'Cara Merawat Mesin Mobil Agar Awet',
        'Tips Perawatan Ban Mobil',
        'Panduan Service Berkala'
      ],
      'FINANCING': [
        'Memahami Kredit Mobil dan Bunga',
        'Tips Mengajukan KTA untuk Mobil',
        'Perbandingan Leasing vs Kredit Bank',
        'Cara Menghitung Cicilan Mobil'
      ],
      'INSURANCE': [
        'Jenis-jenis Asuransi Mobil',
        'Cara Klaim Asuransi Mobil',
        'Tips Memilih Asuransi Terbaik',
        'Panduan All Risk vs TLO'
      ],
      'LEGAL': [
        'Proses Balik Nama Mobil',
        'Dokumen Wajib Pemilik Mobil',
        'Cara Mengurus STNK Hilang',
        'Panduan Pajak Kendaraan'
      ],
      'TECHNOLOGY': [
        'Fitur Keselamatan Modern',
        'Teknologi Hybrid dan Listrik',
        'Sistem Infotainment Terbaru',
        'Panduan Connectivity Features'
      ]
    };
    
    const categoryTitles = titles[category] || ['Artikel Knowledge Base'];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  private generateArticleContent(): string {
    const contents = [
      'Konten artikel yang informatif dan mudah dipahami...',
      'Panduan lengkap dengan langkah-langkah detail...',
      'Penjelasan komprehensif tentang topik terkait...',
      'Tutorial praktis dengan contoh nyata...',
      'Analisis mendalam tentang subjek pembahasan...'
    ];
    
    return contents[Math.floor(Math.random() * contents.length)];
  }

  private generateArticleSummary(): string {
    const summaries = [
      'Ringkasan singkat tentang topik utama artikel',
      'Poin-poin penting yang dibahas dalam artikel',
      'Kesimpulan dan takeaway utama',
      'Overview singkat untuk pembaca'
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  private generateArticleTags(category: string): string[] {
    const tagPool: Record<string, string[]> = {
      'CAR_GUIDE': ['mobil', 'panduan', 'tips', 'pemula', 'buying-guide'],
      'MAINTENANCE': ['perawatan', 'service', 'maintenance', 'tips', 'rutin'],
      'FINANCING': ['kredit', 'finansial', 'cicilan', 'bank', 'leasing'],
      'INSURANCE': ['asuransi', 'klaim', 'proteksi', 'coverage'],
      'LEGAL': ['legal', 'dokumen', 'surat', 'pajak', 'administrasi'],
      'TECHNOLOGY': ['teknologi', 'fitur', 'modern', 'digital', 'innovation']
    };
    
    const availableTags = tagPool[category] || ['general'];
    const tagCount = Math.floor(Math.random() * 3) + 2; // 2-4 tags
    
    return availableTags.slice(0, tagCount);
  }

  private async filterByQuery(articles: IEntitasKnowledge[], query: string): Promise<IEntitasKnowledge[]> {
    try {
      if (!query || query.trim() === '') {
        return articles;
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      return articles.filter(article => {
        const titleMatch = article.judulKnowledge.toLowerCase().includes(searchTerm);
        const contentMatch = article.kontenKnowledge.toLowerCase().includes(searchTerm);
        const summaryMatch = article.ringkasanKnowledge.toLowerCase().includes(searchTerm);
        const tagMatch = article.tagKnowledge.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return titleMatch || contentMatch || summaryMatch || tagMatch;
      });
    } catch (error) {
      console.error('[EntitasKnowledge] Error filtering by query:', error);
      return articles;
    }
  }

  private async applyFilters(articles: IEntitasKnowledge[], filters: IKnowledgeSearch['filters']): Promise<IEntitasKnowledge[]> {
    try {
      let filtered = [...articles];
      
      if (filters.kategori) {
        filtered = filtered.filter(article => article.idKategori === filters.kategori);
      }
      
      if (filters.tingkatKesulitan) {
        filtered = filtered.filter(article => article.tingkatKesulitan === filters.tingkatKesulitan);
      }
      
      if (filters.rating !== undefined) {
        filtered = filtered.filter(article => article.ratingKnowledge >= filters.rating!);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(article => 
          filters.tags!.some(tag => article.tagKnowledge.includes(tag))
        );
      }
      
      return filtered;
    } catch (error) {
      console.error('[EntitasKnowledge] Error applying filters:', error);
      return articles;
    }
  }

  private async sortResults(articles: IEntitasKnowledge[], sortBy: string, sortOrder: 'asc' | 'desc'): Promise<IEntitasKnowledge[]> {
    try {
      const sorted = [...articles];
      
      sorted.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            comparison = a.tanggalDiperbarui.getTime() - b.tanggalDiperbarui.getTime();
            break;
          case 'rating':
            comparison = a.ratingKnowledge - b.ratingKnowledge;
            break;
          case 'views':
            comparison = a.jumlahView - b.jumlahView;
            break;
          case 'relevance':
          default:
            // Relevance berdasarkan kombinasi rating dan views
            const aRelevance = (a.ratingKnowledge * 0.6) + (a.jumlahView * 0.4 / 1000);
            const bRelevance = (b.ratingKnowledge * 0.6) + (b.jumlahView * 0.4 / 1000);
            comparison = aRelevance - bRelevance;
            break;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
      
      return sorted;
    } catch (error) {
      console.error('[EntitasKnowledge] Error sorting results:', error);
      return articles;
    }
  }

  private async validateCategory(idKategori: string): Promise<IKnowledgeCategory> {
    try {
      // Simulasi validasi kategori
      const categories: IKnowledgeCategory[] = [
        { idKategori: 'CAR_GUIDE', namaKategori: 'Panduan Mobil', deskripsiKategori: 'Panduan umum tentang mobil', iconKategori: 'car', urutanKategori: 1 },
        { idKategori: 'MAINTENANCE', namaKategori: 'Perawatan', deskripsiKategori: 'Tips perawatan kendaraan', iconKategori: 'wrench', urutanKategori: 2 },
        { idKategori: 'FINANCING', namaKategori: 'Pembiayaan', deskripsiKategori: 'Informasi kredit dan finansial', iconKategori: 'money', urutanKategori: 3 }
      ];
      
      const category = categories.find(cat => cat.idKategori === idKategori);
      
      if (!category) {
        throw new Error(`Kategori ${idKategori} tidak ditemukan`);
      }
      
      await this.simulateDelay(100);
      return category;
    } catch (error) {
      console.error('[EntitasKnowledge] Category validation error:', error);
      throw error;
    }
  }

  private async fetchArticlesByCategory(idKategori: string): Promise<IEntitasKnowledge[]> {
    try {
      const allArticles = await this.fetchAllArticles();
      return allArticles.filter(article => article.idKategori === idKategori);
    } catch (error) {
      console.error('[EntitasKnowledge] Error fetching articles by category:', error);
      return [];
    }
  }

  private async getSubcategories(parentId: string): Promise<IKnowledgeCategory[]> {
    try {
      // Simulasi subcategories
      const subcategories: IKnowledgeCategory[] = [
        { idKategori: `${parentId}_SUB1`, namaKategori: 'Subkategori 1', deskripsiKategori: 'Deskripsi sub', parentKategori: parentId, iconKategori: 'folder', urutanKategori: 1 },
        { idKategori: `${parentId}_SUB2`, namaKategori: 'Subkategori 2', deskripsiKategori: 'Deskripsi sub', parentKategori: parentId, iconKategori: 'folder', urutanKategori: 2 }
      ];
      
      await this.simulateDelay(100);
      return subcategories;
    } catch (error) {
      console.error('[EntitasKnowledge] Error getting subcategories:', error);
      return [];
    }
  }

  private async sortByPopularityAndDate(articles: IEntitasKnowledge[]): Promise<IEntitasKnowledge[]> {
    try {
      return articles.sort((a, b) => {
        // Kombinasi popularity (views + rating) dan recency
        const aScore = (a.jumlahView * 0.4) + (a.ratingKnowledge * 20) + (Date.now() - a.tanggalDiperbarui.getTime()) / 86400000 * 0.1;
        const bScore = (b.jumlahView * 0.4) + (b.ratingKnowledge * 20) + (Date.now() - b.tanggalDiperbarui.getTime()) / 86400000 * 0.1;
        
        return bScore - aScore; // Descending
      });
    } catch (error) {
      console.error('[EntitasKnowledge] Error sorting by popularity:', error);
      return articles;
    }
  }

  private async getUserPreferences(userId?: string): Promise<any> {
    try {
      if (!userId) return {};
      
      // Simulasi user preferences
      const preferences = {
        preferredCategories: ['CAR_GUIDE', 'MAINTENANCE'],
        preferredDifficulty: 'INTERMEDIATE',
        preferredReadingTime: 10, // minutes
        interests: ['electric-cars', 'maintenance', 'financing']
      };
      
      await this.simulateDelay(100);
      return preferences;
    } catch (error) {
      console.error('[EntitasKnowledge] Error getting user preferences:', error);
      return {};
    }
  }

  private async getReadingHistory(userId?: string): Promise<string[]> {
    try {
      if (!userId) return [];
      
      // Simulasi reading history
      const history = [
        'KB-001', 'KB-002', 'KB-003', 'KB-004', 'KB-005'
      ];
      
      await this.simulateDelay(100);
      return history;
    } catch (error) {
      console.error('[EntitasKnowledge] Error getting reading history:', error);
      return [];
    }
  }

  private async getAvailableArticles(): Promise<IEntitasKnowledge[]> {
    try {
      const allArticles = await this.fetchAllArticles();
      return allArticles.filter(article => article.statusKnowledge === 'PUBLISHED');
    } catch (error) {
      console.error('[EntitasKnowledge] Error getting available articles:', error);
      return [];
    }
  }

  private async generateContentBasedRecommendations(
    currentArticleId?: string, 
    articles: IEntitasKnowledge[] = [], 
    limit: number = 5
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      if (!currentArticleId) return [];
      
      const currentArticle = articles.find(a => a.idKnowledge === currentArticleId);
      if (!currentArticle) return [];
      
      // Find similar articles berdasarkan kategori dan tags
      const similarArticles = articles.filter(article => 
        article.idKnowledge !== currentArticleId &&
        (article.idKategori === currentArticle.idKategori ||
         article.tagKnowledge.some(tag => currentArticle.tagKnowledge.includes(tag)))
      );
      
      return similarArticles.slice(0, limit).map(article => ({
        idKnowledge: article.idKnowledge,
        judulKnowledge: article.judulKnowledge,
        score: Math.random() * 0.8 + 0.2, // 0.2-1.0
        reason: 'Similar content'
      }));
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating content-based recommendations:', error);
      return [];
    }
  }

  private async generateCollaborativeRecommendations(
    userId?: string,
    readingHistory: string[] = [],
    articles: IEntitasKnowledge[] = [],
    limit: number = 5
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      if (!userId || readingHistory.length === 0) return [];
      
      // Simulasi collaborative filtering
      const recommendations = articles
        .filter(article => !readingHistory.includes(article.idKnowledge))
        .slice(0, limit)
        .map(article => ({
          idKnowledge: article.idKnowledge,
          judulKnowledge: article.judulKnowledge,
          score: Math.random() * 0.7 + 0.3, // 0.3-1.0
          reason: 'Users like you also read'
        }));
      
      return recommendations;
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating collaborative recommendations:', error);
      return [];
    }
  }

  private async generatePopularityRecommendations(
    articles: IEntitasKnowledge[] = [],
    limit: number = 5
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      // Sort by popularity (views + rating)
      const popularArticles = articles
        .sort((a, b) => (b.jumlahView + b.ratingKnowledge * 100) - (a.jumlahView + a.ratingKnowledge * 100))
        .slice(0, limit);
      
      return popularArticles.map(article => ({
        idKnowledge: article.idKnowledge,
        judulKnowledge: article.judulKnowledge,
        score: Math.random() * 0.6 + 0.4, // 0.4-1.0
        reason: 'Popular article'
      }));
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating popularity recommendations:', error);
      return [];
    }
  }

  private async generateCategoryRecommendations(
    userPreferences: any,
    articles: IEntitasKnowledge[] = [],
    limit: number = 5
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      const preferredCategories = userPreferences.preferredCategories || [];
      
      if (preferredCategories.length === 0) return [];
      
      const categoryArticles = articles.filter(article => 
        preferredCategories.includes(article.idKategori)
      );
      
      return categoryArticles.slice(0, limit).map(article => ({
        idKnowledge: article.idKnowledge,
        judulKnowledge: article.judulKnowledge,
        score: Math.random() * 0.5 + 0.5, // 0.5-1.0
        reason: 'Based on your interests'
      }));
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating category recommendations:', error);
      return [];
    }
  }

  private async combineRecommendations(
    recommendationSets: IKnowledgeRecommendation[][]
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      const combined: Map<string, IKnowledgeRecommendation> = new Map();
      
      recommendationSets.forEach(set => {
        set.forEach(rec => {
          const existing = combined.get(rec.idKnowledge);
          if (existing) {
            // Combine scores
            existing.score = (existing.score + rec.score) / 2;
            existing.reason += `, ${rec.reason}`;
          } else {
            combined.set(rec.idKnowledge, { ...rec });
          }
        });
      });
      
      return Array.from(combined.values()).sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('[EntitasKnowledge] Error combining recommendations:', error);
      return [];
    }
  }

  private async filterReadArticles(
    recommendations: IKnowledgeRecommendation[],
    readingHistory: string[]
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      return recommendations.filter(rec => !readingHistory.includes(rec.idKnowledge));
    } catch (error) {
      console.error('[EntitasKnowledge] Error filtering read articles:', error);
      return recommendations;
    }
  }

  private async diversifyRecommendations(
    recommendations: IKnowledgeRecommendation[]
  ): Promise<IKnowledgeRecommendation[]> {
    try {
      // Implementasi diversifikasi sederhana
      // Dalam implementasi nyata, bisa berdasarkan kategori, difficulty, dll
      return recommendations;
    } catch (error) {
      console.error('[EntitasKnowledge] Error diversifying recommendations:', error);
      return recommendations;
    }
  }

  private async getArticlesInTimeRange(days: number): Promise<IEntitasKnowledge[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const allArticles = await this.fetchAllArticles();
      
      return allArticles.filter(article => article.tanggalDibuat >= cutoffDate);
    } catch (error) {
      console.error('[EntitasKnowledge] Error getting articles in time range:', error);
      return [];
    }
  }

  private async analyzePopularTags(articles: IEntitasKnowledge[]): Promise<string[]> {
    try {
      const tagCounts: Map<string, number> = new Map();
      
      articles.forEach(article => {
        article.tagKnowledge.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });
      
      return Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    } catch (error) {
      console.error('[EntitasKnowledge] Error analyzing popular tags:', error);
      return [];
    }
  }

  private async identifyTopArticles(articles: IEntitasKnowledge[]): Promise<IEntitasKnowledge[]> {
    try {
      return articles
        .sort((a, b) => (b.jumlahView + b.ratingKnowledge * 100) - (a.jumlahView + a.ratingKnowledge * 100))
        .slice(0, 5);
    } catch (error) {
      console.error('[EntitasKnowledge] Error identifying top articles:', error);
      return [];
    }
  }

  private async analyzeCategoryDistribution(articles: IEntitasKnowledge[]): Promise<Record<string, number>> {
    try {
      const distribution: Record<string, number> = {};
      
      articles.forEach(article => {
        distribution[article.idKategori] = (distribution[article.idKategori] || 0) + 1;
      });
      
      return distribution;
    } catch (error) {
      console.error('[EntitasKnowledge] Error analyzing category distribution:', error);
      return {};
    }
  }

  private async calculateEngagementMetrics(articles: IEntitasKnowledge[]): Promise<any> {
    try {
      const totalViews = articles.reduce((sum, article) => sum + article.jumlahView, 0);
      const avgViewsPerArticle = articles.length > 0 ? totalViews / articles.length : 0;
      
      const ratedArticles = articles.filter(article => article.ratingKnowledge > 0);
      const avgRating = ratedArticles.length > 0 
        ? ratedArticles.reduce((sum, article) => sum + article.ratingKnowledge, 0) / ratedArticles.length 
        : 0;
      
      return {
        totalViews,
        avgViewsPerArticle,
        avgRating,
        engagementRate: ratedArticles.length / articles.length * 100
      };
    } catch (error) {
      console.error('[EntitasKnowledge] Error calculating engagement metrics:', error);
      return {};
    }
  }

  private async analyzeTimeSeries(articles: IEntitasKnowledge[], days: number): Promise<any> {
    try {
      // Analisis tren publikasi dan engagement over time
      const dailyStats: Record<string, { articles: number; views: number }> = {};
      
      articles.forEach(article => {
        const dateKey = article.tanggalDibuat.toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { articles: 0, views: 0 };
        }
        dailyStats[dateKey].articles++;
        dailyStats[dateKey].views += article.jumlahView;
      });
      
      return {
        dailyStats,
        trend: 'stable' // Simplified trend analysis
      };
    } catch (error) {
      console.error('[EntitasKnowledge] Error analyzing time series:', error);
      return {};
    }
  }

  private async analyzeContentQuality(articles: IEntitasKnowledge[]): Promise<any> {
    try {
      const qualityMetrics = {
        avgReadingTime: articles.reduce((sum, article) => sum + article.estimasiWaktuBaca, 0) / articles.length,
        contentLengthDistribution: this.analyzeContentLength(articles),
        difficultyDistribution: this.analyzeDifficultyDistribution(articles)
      };
      
      return qualityMetrics;
    } catch (error) {
      console.error('[EntitasKnowledge] Error analyzing content quality:', error);
      return {};
    }
  }

  private analyzeContentLength(articles: IEntitasKnowledge[]): Record<string, number> {
    const distribution: Record<string, number> = {
      'short': 0,    // < 5 min
      'medium': 0,   // 5-10 min
      'long': 0      // > 10 min
    };
    
    articles.forEach(article => {
      if (article.estimasiWaktuBaca < 5) {
        distribution.short++;
      } else if (article.estimasiWaktuBaca <= 10) {
        distribution.medium++;
      } else {
        distribution.long++;
      }
    });
    
    return distribution;
  }

  private analyzeDifficultyDistribution(articles: IEntitasKnowledge[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    articles.forEach(article => {
      distribution[article.tingkatKesulitan] = (distribution[article.tingkatKesulitan] || 0) + 1;
    });
    
    return distribution;
  }

  private async analyzeUserBehavior(articles: IEntitasKnowledge[]): Promise<any> {
    try {
      // Simulasi analisis user behavior
      return {
        mostViewedCategories: ['CAR_GUIDE', 'MAINTENANCE', 'FINANCING'],
        peakReadingHours: [9, 13, 20], // 9 AM, 1 PM, 8 PM
        avgSessionDuration: 15, // minutes
        bounceRate: 0.25 // 25%
      };
    } catch (error) {
      console.error('[EntitasKnowledge] Error analyzing user behavior:', error);
      return {};
    }
  }

  private async generateAnalyticsReport(
    analytics: IKnowledgeAnalytics,
    engagement: any,
    timeSeries: any,
    quality: any
  ): Promise<void> {
    try {
      const report = {
        summary: analytics,
        engagement,
        timeSeries,
        quality,
        generatedAt: new Date(),
        recommendations: this.generateAnalyticsRecommendations(analytics, engagement, quality)
      };
      
      console.log('[EntitasKnowledge] Analytics report generated:', report);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating analytics report:', error);
    }
  }

  private generateAnalyticsRecommendations(analytics: IKnowledgeAnalytics, engagement: any, quality: any): string[] {
    const recommendations: string[] = [];
    
    if (analytics.averageRating < 3.5) {
      recommendations.push('Tingkatkan kualitas konten untuk meningkatkan rating');
    }
    
    if (engagement.engagementRate < 50) {
      recommendations.push('Implementasi sistem rating yang lebih user-friendly');
    }
    
    if (quality.avgReadingTime > 12) {
      recommendations.push('Pertimbangkan membuat konten yang lebih ringkas');
    }
    
    return recommendations;
  }

  // Logging and Analytics Methods
  private async updateSearchAnalytics(params: IKnowledgeSearch, resultCount: number): Promise<void> {
    try {
      const searchAnalytics = {
        query: params.query,
        filters: params.filters,
        resultCount,
        timestamp: new Date()
      };
      
      console.log('[EntitasKnowledge] Search analytics updated:', searchAnalytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error updating search analytics:', error);
    }
  }

  private async updateCategoryAnalytics(idKategori: string, articleCount: number): Promise<void> {
    try {
      const categoryAnalytics = {
        idKategori,
        articleCount,
        accessTime: new Date()
      };
      
      console.log('[EntitasKnowledge] Category analytics updated:', categoryAnalytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error updating category analytics:', error);
    }
  }

  private async updateRecommendationAnalytics(userId?: string, recommendations: IKnowledgeRecommendation[] = []): Promise<void> {
    try {
      const recAnalytics = {
        userId,
        recommendationCount: recommendations.length,
        avgScore: recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length,
        timestamp: new Date()
      };
      
      console.log('[EntitasKnowledge] Recommendation analytics updated:', recAnalytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error updating recommendation analytics:', error);
    }
  }

  private async updateDashboardMetrics(analytics: IKnowledgeAnalytics): Promise<void> {
    try {
      const dashboardUpdate = {
        metrics: analytics,
        lastUpdated: new Date()
      };
      
      console.log('[EntitasKnowledge] Dashboard metrics updated:', dashboardUpdate);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasKnowledge] Error updating dashboard:', error);
    }
  }

  private async logSearchActivity(params: IKnowledgeSearch, resultCount: number): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action: 'SEARCH',
        query: params.query,
        resultCount,
        component: 'EntitasKnowledge'
      };

      console.log('[EntitasKnowledge] Search activity logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error logging search activity:', error);
    }
  }

  private async logCategoryAccess(idKategori: string, articleCount: number): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action: 'CATEGORY_ACCESS',
        idKategori,
        articleCount,
        component: 'EntitasKnowledge'
      };

      console.log('[EntitasKnowledge] Category access logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error logging category access:', error);
    }
  }

  private async logRecommendationActivity(userId?: string, recommendationCount: number = 0): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action: 'RECOMMENDATION',
        userId,
        recommendationCount,
        component: 'EntitasKnowledge'
      };

      console.log('[EntitasKnowledge] Recommendation activity logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error logging recommendation activity:', error);
    }
  }

  private async logAnalyticsActivity(timeRange: number, analytics: IKnowledgeAnalytics): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action: 'ANALYTICS',
        timeRange,
        totalArticles: analytics.totalArticles,
        totalViews: analytics.totalViews,
        component: 'EntitasKnowledge'
      };

      console.log('[EntitasKnowledge] Analytics activity logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error logging analytics activity:', error);
    }
  }

  private async generateSearchSuggestions(params: IKnowledgeSearch): Promise<void> {
    try {
      // Generate search suggestions berdasarkan query
      const suggestions = [
        `${params.query} tips`,
        `${params.query} panduan`,
        `cara ${params.query}`,
        `${params.query} terbaru`
      ];
      
      console.log('[EntitasKnowledge] Search suggestions generated:', suggestions);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating search suggestions:', error);
    }
  }

  private async generateCategoryInsights(idKategori: string, articles: IEntitasKnowledge[]): Promise<void> {
    try {
      const insights = {
        idKategori,
        totalArticles: articles.length,
        avgRating: articles.reduce((sum, article) => sum + article.ratingKnowledge, 0) / articles.length,
        totalViews: articles.reduce((sum, article) => sum + article.jumlahView, 0),
        popularTags: await this.analyzePopularTags(articles)
      };
      
      console.log('[EntitasKnowledge] Category insights generated:', insights);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasKnowledge] Error generating category insights:', error);
    }
  }

  private async handleKnowledgeError(error: Error): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date(),
        error: error.message,
        idKnowledge: this.idKnowledge,
        action: 'KNOWLEDGE_ERROR'
      };

      console.error('[EntitasKnowledge] Handling knowledge error:', errorLog);
      await this.simulateDelay(100);
    } catch (handlingError) {
      console.error('[EntitasKnowledge] Error in error handling:', handlingError);
    }
  }

  // Utility Methods
  public incrementView(): void {
    this.jumlahView++;
    this.updatedAt = new Date();
  }

  public updateRating(newRating: number): void {
    if (newRating >= 0 && newRating <= 5) {
      this.ratingKnowledge = newRating;
      this.updatedAt = new Date();
    }
  }

  public addTag(tag: string): void {
    if (!this.tagKnowledge.includes(tag)) {
      this.tagKnowledge.push(tag);
      this.updatedAt = new Date();
    }
  }

  public removeTag(tag: string): void {
    const index = this.tagKnowledge.indexOf(tag);
    if (index > -1) {
      this.tagKnowledge.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public updateContent(newContent: string): void {
    this.kontenKnowledge = newContent;
    this.tanggalDiperbarui = new Date();
    this.updatedAt = new Date();
    
    // Recalculate reading time
    this.estimasiWaktuBaca = this.calculateReadingTime(newContent);
  }

  private calculateReadingTime(content: string): number {
    // Estimasi 200 kata per menit
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  public getArticleAge(): number {
    const now = new Date();
    const ageDiff = now.getTime() - this.tanggalDibuat.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24)); // dalam hari
  }

  public isPopular(): boolean {
    return this.jumlahView > 500 && this.ratingKnowledge > 4.0;
  }

  public getEngagementScore(): number {
    // Kombinasi views, rating, dan recency
    const viewScore = Math.min(this.jumlahView / 1000, 1) * 40; // max 40 points
    const ratingScore = (this.ratingKnowledge / 5) * 40; // max 40 points
    const recencyScore = Math.max(0, 20 - this.getArticleAge() / 30) * 20; // max 20 points, decreases over time
    
    return viewScore + ratingScore + recencyScore;
  }

  public toJSON(): IEntitasKnowledge {
    return {
      idKnowledge: this.idKnowledge,
      idKategori: this.idKategori,
      idPenulis: this.idPenulis,
      judulKnowledge: this.judulKnowledge,
      kontenKnowledge: this.kontenKnowledge,
      ringkasanKnowledge: this.ringkasanKnowledge,
      tagKnowledge: this.tagKnowledge,
      statusKnowledge: this.statusKnowledge,
      tingkatKesulitan: this.tingkatKesulitan,
      estimasiWaktuBaca: this.estimasiWaktuBaca,
      jumlahView: this.jumlahView,
      ratingKnowledge: this.ratingKnowledge,
      tanggalDibuat: this.tanggalDibuat,
      tanggalDiperbarui: this.tanggalDiperbarui,
      updatedAt: this.updatedAt
    };
  }
}

export default EntitasKnowledge;