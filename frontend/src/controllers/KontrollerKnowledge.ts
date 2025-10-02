import axios, { AxiosResponse } from 'axios';
import KontrollerAuth from './KontrollerAuth';

// ==================== INTERFACES ====================

export interface DashboardKnowledge {
  id: string;
  title: string;
  description: string;
  lastUpdated: Date;
  totalArticles: number;
  totalCategories: number;
  totalViews: number;
  popularArticles: ArtikelPopuler[];
  recentArticles: ArtikelTerbaru[];
  categories: KategoriKnowledge[];
  statistics: StatistikKnowledge;
  quickActions: QuickAction[];
}

export interface ArtikelPopuler {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
  likes: number;
  publishDate: Date;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  thumbnail: string;
  excerpt: string;
  readTime: number; // dalam menit
  tags: string[];
}

export interface ArtikelTerbaru {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  publishDate: Date;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  thumbnail: string;
  excerpt: string;
  readTime: number;
  tags: string[];
}

export interface KategoriKnowledge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
  totalViews: number;
  lastActivity: Date;
  isActive: boolean;
  parentId?: string;
  children?: KategoriKnowledge[];
}

export interface StatistikKnowledge {
  totalViews: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  totalArticles: {
    published: number;
    draft: number;
    archived: number;
    total: number;
  };
  engagement: {
    averageReadTime: number;
    bounceRate: number;
    shareRate: number;
    commentRate: number;
  };
  topPerformers: {
    mostViewed: ArtikelPopuler[];
    mostShared: ArtikelPopuler[];
    mostCommented: ArtikelPopuler[];
  };
  trends: {
    viewsTrend: TrendData[];
    categoryTrends: CategoryTrend[];
  };
}

export interface TrendData {
  date: Date;
  views: number;
  articles: number;
  engagement: number;
}

export interface CategoryTrend {
  categoryId: string;
  categoryName: string;
  growth: number; // persentase pertumbuhan
  viewsChange: number;
  articlesChange: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  url?: string;
  permission?: string;
  badge?: {
    text: string;
    color: string;
  };
}

export interface KnowledgeSearch {
  query: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'relevance' | 'date' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  articles: ArtikelPopuler[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    tags: { name: string; count: number }[];
    authors: { name: string; count: number }[];
  };
  suggestions: string[];
}

export interface KnowledgeAnalytics {
  pageViews: {
    daily: { date: Date; views: number }[];
    weekly: { week: string; views: number }[];
    monthly: { month: string; views: number }[];
  };
  userBehavior: {
    averageSessionDuration: number;
    pagesPerSession: number;
    newVsReturning: {
      new: number;
      returning: number;
    };
  };
  contentPerformance: {
    topPages: { url: string; title: string; views: number }[];
    exitPages: { url: string; title: string; exitRate: number }[];
    searchQueries: { query: string; count: number }[];
  };
}

// ==================== MAIN CONTROLLER ====================

export class KontrollerKnowledge {
  private baseURL: string;
  private authController: KontrollerAuth;
  private cache: Map<string, any>;
  private cacheTimeout: number = 10 * 60 * 1000; // 10 menit

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.authController = KontrollerAuth.getInstance();
    this.cache = new Map();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Memuat dashboard knowledge dengan semua data yang diperlukan
   */
  async muatDashboardKnowledge(): Promise<DashboardKnowledge> {
    try {
      const cacheKey = 'knowledge_dashboard';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<DashboardKnowledge> = await axios.get(
        `${this.baseURL}/knowledge/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const dashboardData = response.data;
      this.setCache(cacheKey, dashboardData);
      return dashboardData;

    } catch (error) {
      console.error('Error loading knowledge dashboard:', error);
      return this.getMockDashboardKnowledge();
    }
  }

  // ==================== ADDITIONAL METHODS ====================

  /**
   * Mencari artikel dalam knowledge base
   */
  async searchKnowledge(searchParams: KnowledgeSearch): Promise<SearchResult> {
    try {
      const cacheKey = `knowledge_search_${JSON.stringify(searchParams)}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<SearchResult> = await axios.post(
        `${this.baseURL}/knowledge/search`,
        searchParams,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchResult = response.data;
      this.setCache(cacheKey, searchResult, 5 * 60 * 1000); // Cache 5 menit untuk search
      return searchResult;

    } catch (error) {
      console.error('Error searching knowledge:', error);
      return this.getMockSearchResult();
    }
  }

  /**
   * Mendapatkan artikel berdasarkan kategori
   */
  async getArtikelByKategori(categoryId: string, limit: number = 10): Promise<ArtikelPopuler[]> {
    try {
      const cacheKey = `articles_category_${categoryId}_${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ArtikelPopuler[]> = await axios.get(
        `${this.baseURL}/knowledge/articles/category/${categoryId}?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const articles = response.data;
      this.setCache(cacheKey, articles);
      return articles;

    } catch (error) {
      console.error('Error getting articles by category:', error);
      return this.getMockArtikelPopuler().slice(0, limit);
    }
  }

  /**
   * Mendapatkan detail artikel
   */
  async getDetailArtikel(articleId: string): Promise<ArtikelPopuler | null> {
    try {
      const cacheKey = `article_detail_${articleId}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ArtikelPopuler> = await axios.get(
        `${this.baseURL}/knowledge/articles/${articleId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const article = response.data;
      this.setCache(cacheKey, article);
      return article;

    } catch (error) {
      console.error('Error getting article detail:', error);
      return null;
    }
  }

  /**
   * Mendapatkan analytics knowledge base
   */
  async getKnowledgeAnalytics(dateRange?: { start: Date; end: Date }): Promise<KnowledgeAnalytics> {
    try {
      const cacheKey = `knowledge_analytics_${dateRange ? `${dateRange.start.getTime()}_${dateRange.end.getTime()}` : 'all'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const params = dateRange ? {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      } : {};

      const response: AxiosResponse<KnowledgeAnalytics> = await axios.get(
        `${this.baseURL}/knowledge/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params
        }
      );

      const analytics = response.data;
      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Error getting knowledge analytics:', error);
      return this.getMockKnowledgeAnalytics();
    }
  }

  /**
   * Mendapatkan semua kategori knowledge
   */
  async getAllKategori(): Promise<KategoriKnowledge[]> {
    try {
      const cacheKey = 'all_knowledge_categories';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<KategoriKnowledge[]> = await axios.get(
        `${this.baseURL}/knowledge/categories`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const categories = response.data;
      this.setCache(cacheKey, categories);
      return categories;

    } catch (error) {
      console.error('Error getting all categories:', error);
      return this.getMockKategoriKnowledge();
    }
  }

  /**
   * Mendapatkan artikel trending
   */
  async getTrendingArtikel(limit: number = 5): Promise<ArtikelPopuler[]> {
    try {
      const cacheKey = `trending_articles_${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ArtikelPopuler[]> = await axios.get(
        `${this.baseURL}/knowledge/articles/trending?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const trendingArticles = response.data;
      this.setCache(cacheKey, trendingArticles, 30 * 60 * 1000); // Cache 30 menit
      return trendingArticles;

    } catch (error) {
      console.error('Error getting trending articles:', error);
      return this.getMockArtikelPopuler().slice(0, limit);
    }
  }

  // ==================== CACHE METHODS ====================

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < (cached.timeout || this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, timeout?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ==================== UTILITY METHODS ====================

  private formatReadTime(minutes: number): string {
    if (minutes < 1) return '< 1 menit';
    if (minutes === 1) return '1 menit';
    return `${minutes} menit`;
  }

  private formatViews(views: number): string {
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
    return `${(views / 1000000).toFixed(1)}M`;
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // ==================== MOCK DATA METHODS ====================

  private getMockDashboardKnowledge(): DashboardKnowledge {
    return {
      id: 'dashboard_1',
      title: 'Knowledge Base Dashboard',
      description: 'Pusat informasi dan dokumentasi sistem',
      lastUpdated: new Date(),
      totalArticles: 156,
      totalCategories: 12,
      totalViews: 45230,
      popularArticles: this.getMockArtikelPopuler(),
      recentArticles: this.getMockArtikelTerbaru(),
      categories: this.getMockKategoriKnowledge(),
      statistics: this.getMockStatistikKnowledge(),
      quickActions: this.getMockQuickActions()
    };
  }

  private getMockArtikelPopuler(): ArtikelPopuler[] {
    return [
      {
        id: 'art_1',
        title: 'Panduan Lengkap Membeli Mobil Bekas',
        slug: 'panduan-lengkap-membeli-mobil-bekas',
        category: 'Tips & Trik',
        views: 15420,
        likes: 234,
        publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        author: {
          id: 'author_1',
          name: 'Ahmad Rizki',
          avatar: '/images/avatars/ahmad.jpg'
        },
        thumbnail: '/images/articles/mobil-bekas-guide.jpg',
        excerpt: 'Tips dan trik untuk memilih mobil bekas yang berkualitas dengan harga terbaik...',
        readTime: 8,
        tags: ['mobil bekas', 'tips', 'panduan']
      },
      {
        id: 'art_2',
        title: 'Cara Merawat Mesin Mobil Agar Awet',
        slug: 'cara-merawat-mesin-mobil-agar-awet',
        category: 'Perawatan',
        views: 12350,
        likes: 189,
        publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        author: {
          id: 'author_2',
          name: 'Sari Indah',
          avatar: '/images/avatars/sari.jpg'
        },
        thumbnail: '/images/articles/perawatan-mesin.jpg',
        excerpt: 'Panduan lengkap merawat mesin mobil untuk menjaga performa dan daya tahan...',
        readTime: 6,
        tags: ['perawatan', 'mesin', 'maintenance']
      },
      {
        id: 'art_3',
        title: 'Tren Mobil Listrik di Indonesia 2024',
        slug: 'tren-mobil-listrik-indonesia-2024',
        category: 'Berita',
        views: 9870,
        likes: 156,
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        author: {
          id: 'author_3',
          name: 'Budi Santoso',
          avatar: '/images/avatars/budi.jpg'
        },
        thumbnail: '/images/articles/mobil-listrik-2024.jpg',
        excerpt: 'Perkembangan terbaru industri mobil listrik di Indonesia dan prediksi masa depan...',
        readTime: 5,
        tags: ['mobil listrik', 'tren', 'indonesia']
      }
    ];
  }

  private getMockArtikelTerbaru(): ArtikelTerbaru[] {
    return [
      {
        id: 'art_4',
        title: 'Review Toyota Avanza Veloz 2024',
        slug: 'review-toyota-avanza-veloz-2024',
        category: 'Review',
        status: 'published',
        publishDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        author: {
          id: 'author_4',
          name: 'Lisa Permata',
          avatar: '/images/avatars/lisa.jpg'
        },
        thumbnail: '/images/articles/avanza-veloz-2024.jpg',
        excerpt: 'Review mendalam Toyota Avanza Veloz 2024 dengan fitur-fitur terbaru...',
        readTime: 7,
        tags: ['review', 'toyota', 'avanza']
      },
      {
        id: 'art_5',
        title: 'Panduan Kredit Mobil untuk Pemula',
        slug: 'panduan-kredit-mobil-pemula',
        category: 'Finansial',
        status: 'draft',
        publishDate: new Date(),
        author: {
          id: 'author_5',
          name: 'Andi Wijaya',
          avatar: '/images/avatars/andi.jpg'
        },
        thumbnail: '/images/articles/kredit-mobil.jpg',
        excerpt: 'Langkah-langkah mengajukan kredit mobil untuk pembeli pertama...',
        readTime: 9,
        tags: ['kredit', 'finansial', 'pemula']
      }
    ];
  }

  private getMockKategoriKnowledge(): KategoriKnowledge[] {
    return [
      {
        id: 'cat_1',
        name: 'Tips & Trik',
        slug: 'tips-trik',
        description: 'Tips dan trik seputar dunia otomotif',
        icon: 'lightbulb',
        color: '#FFA500',
        articleCount: 25,
        totalViews: 12500,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: 'cat_2',
        name: 'Perawatan',
        slug: 'perawatan',
        description: 'Panduan perawatan dan maintenance mobil',
        icon: 'wrench',
        color: '#32CD32',
        articleCount: 18,
        totalViews: 8900,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: 'cat_3',
        name: 'Review',
        slug: 'review',
        description: 'Review mobil dan aksesoris otomotif',
        icon: 'star',
        color: '#FF6347',
        articleCount: 32,
        totalViews: 15600,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
        isActive: true
      },
      {
        id: 'cat_4',
        name: 'Berita',
        slug: 'berita',
        description: 'Berita terkini industri otomotif',
        icon: 'newspaper',
        color: '#4169E1',
        articleCount: 45,
        totalViews: 22100,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        isActive: true
      }
    ];
  }

  private getMockStatistikKnowledge(): StatistikKnowledge {
    return {
      totalViews: {
        today: 1250,
        thisWeek: 8900,
        thisMonth: 35600,
        total: 45230
      },
      totalArticles: {
        published: 142,
        draft: 8,
        archived: 6,
        total: 156
      },
      engagement: {
        averageReadTime: 6.5,
        bounceRate: 35.2,
        shareRate: 12.8,
        commentRate: 8.4
      },
      topPerformers: {
        mostViewed: this.getMockArtikelPopuler(),
        mostShared: this.getMockArtikelPopuler().slice(0, 2),
        mostCommented: this.getMockArtikelPopuler().slice(1, 3)
      },
      trends: {
        viewsTrend: [
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), views: 1100, articles: 3, engagement: 65 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), views: 1350, articles: 2, engagement: 72 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), views: 980, articles: 1, engagement: 58 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), views: 1420, articles: 4, engagement: 78 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), views: 1180, articles: 2, engagement: 69 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), views: 1650, articles: 3, engagement: 82 },
          { date: new Date(), views: 1250, articles: 1, engagement: 75 }
        ],
        categoryTrends: [
          { categoryId: 'cat_1', categoryName: 'Tips & Trik', growth: 15.2, viewsChange: 1200, articlesChange: 3 },
          { categoryId: 'cat_3', categoryName: 'Review', growth: 22.8, viewsChange: 1800, articlesChange: 5 },
          { categoryId: 'cat_4', categoryName: 'Berita', growth: 8.5, viewsChange: 650, articlesChange: 2 }
        ]
      }
    };
  }

  private getMockQuickActions(): QuickAction[] {
    return [
      {
        id: 'action_1',
        title: 'Buat Artikel Baru',
        description: 'Tambah artikel baru ke knowledge base',
        icon: 'plus',
        color: '#28a745',
        action: 'create_article',
        url: '/knowledge/articles/create',
        permission: 'create_article'
      },
      {
        id: 'action_2',
        title: 'Kelola Kategori',
        description: 'Atur kategori knowledge base',
        icon: 'folder',
        color: '#17a2b8',
        action: 'manage_categories',
        url: '/knowledge/categories',
        permission: 'manage_categories'
      },
      {
        id: 'action_3',
        title: 'Lihat Analytics',
        description: 'Analisis performa knowledge base',
        icon: 'chart-bar',
        color: '#6f42c1',
        action: 'view_analytics',
        url: '/knowledge/analytics',
        permission: 'view_analytics'
      },
      {
        id: 'action_4',
        title: 'Moderasi Konten',
        description: 'Review artikel yang pending',
        icon: 'shield-check',
        color: '#fd7e14',
        action: 'moderate_content',
        url: '/knowledge/moderation',
        permission: 'moderate_content',
        badge: {
          text: '3',
          color: '#dc3545'
        }
      }
    ];
  }

  private getMockSearchResult(): SearchResult {
    return {
      articles: this.getMockArtikelPopuler(),
      totalCount: 3,
      facets: {
        categories: [
          { name: 'Tips & Trik', count: 1 },
          { name: 'Perawatan', count: 1 },
          { name: 'Berita', count: 1 }
        ],
        tags: [
          { name: 'mobil bekas', count: 1 },
          { name: 'perawatan', count: 1 },
          { name: 'mobil listrik', count: 1 }
        ],
        authors: [
          { name: 'Ahmad Rizki', count: 1 },
          { name: 'Sari Indah', count: 1 },
          { name: 'Budi Santoso', count: 1 }
        ]
      },
      suggestions: [
        'panduan mobil bekas',
        'tips perawatan mobil',
        'mobil listrik indonesia'
      ]
    };
  }

  private getMockKnowledgeAnalytics(): KnowledgeAnalytics {
    return {
      pageViews: {
        daily: [
          { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), views: 1100 },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), views: 1350 },
          { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), views: 980 },
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), views: 1420 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), views: 1180 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), views: 1650 },
          { date: new Date(), views: 1250 }
        ],
        weekly: [
          { week: 'Week 1', views: 7500 },
          { week: 'Week 2', views: 8200 },
          { week: 'Week 3', views: 9100 },
          { week: 'Week 4', views: 8900 }
        ],
        monthly: [
          { month: 'Jan', views: 32000 },
          { month: 'Feb', views: 35600 },
          { month: 'Mar', views: 41200 },
          { month: 'Apr', views: 45230 }
        ]
      },
      userBehavior: {
        averageSessionDuration: 245, // detik
        pagesPerSession: 3.2,
        newVsReturning: {
          new: 65,
          returning: 35
        }
      },
      contentPerformance: {
        topPages: [
          { url: '/knowledge/panduan-lengkap-membeli-mobil-bekas', title: 'Panduan Lengkap Membeli Mobil Bekas', views: 15420 },
          { url: '/knowledge/cara-merawat-mesin-mobil-agar-awet', title: 'Cara Merawat Mesin Mobil Agar Awet', views: 12350 },
          { url: '/knowledge/tren-mobil-listrik-indonesia-2024', title: 'Tren Mobil Listrik di Indonesia 2024', views: 9870 }
        ],
        exitPages: [
          { url: '/knowledge/panduan-kredit-mobil-pemula', title: 'Panduan Kredit Mobil untuk Pemula', exitRate: 45.2 },
          { url: '/knowledge/tips-nego-harga-mobil', title: 'Tips Negosiasi Harga Mobil', exitRate: 38.7 }
        ],
        searchQueries: [
          { query: 'mobil bekas', count: 156 },
          { query: 'perawatan mobil', count: 89 },
          { query: 'kredit mobil', count: 67 },
          { query: 'mobil listrik', count: 45 }
        ]
      }
    };
  }
}

export default KontrollerKnowledge;
