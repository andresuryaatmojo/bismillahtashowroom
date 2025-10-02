import axios, { AxiosResponse } from 'axios';
import KontrollerAuth from './KontrollerAuth';

// ==================== INTERFACES ====================

export interface OverviewPerformaBisnis {
  id: string;
  periode: {
    mulai: Date;
    selesai: Date;
    label: string;
  };
  ringkasanKeuangan: RingkasanKeuangan;
  metrikPenjualan: MetrikPenjualan;
  analisisCustomer: AnalisisCustomer;
  performaInventaris: PerformaInventaris;
  trendPasar: TrendPasar;
  kompetitorAnalysis: KompetitorAnalysis;
  proyeksiPertumbuhan: ProyeksiPertumbuhan;
  rekomendasi: Rekomendasi[];
  lastUpdated: Date;
}

export interface RingkasanKeuangan {
  totalRevenue: {
    nilai: number;
    perubahan: number; // persentase
    target: number;
    pencapaian: number; // persentase
  };
  totalProfit: {
    nilai: number;
    margin: number; // persentase
    perubahan: number;
    target: number;
  };
  totalBiaya: {
    operasional: number;
    marketing: number;
    administrasi: number;
    lainnya: number;
    total: number;
  };
  cashFlow: {
    masuk: number;
    keluar: number;
    net: number;
    proyeksi30Hari: number;
  };
  roi: {
    marketing: number;
    inventory: number;
    overall: number;
  };
}

export interface MetrikPenjualan {
  totalTransaksi: {
    jumlah: number;
    nilai: number;
    perubahan: number;
    rataRataNilai: number;
  };
  konversiRate: {
    visitor: number;
    lead: number;
    customer: number;
    funnel: FunnelData[];
  };
  channelPerformance: {
    online: ChannelMetrik;
    offline: ChannelMetrik;
    referral: ChannelMetrik;
    social: ChannelMetrik;
  };
  topProducts: ProdukTerlaris[];
  salesTrend: TrendData[];
  customerAcquisition: {
    cost: number;
    lifetime_value: number;
    payback_period: number; // dalam bulan
  };
}

export interface AnalisisCustomer {
  totalCustomer: {
    aktif: number;
    baru: number;
    returning: number;
    churn: number;
  };
  segmentasi: CustomerSegment[];
  kepuasan: {
    rating: number;
    nps: number; // Net Promoter Score
    csat: number; // Customer Satisfaction
    feedback: FeedbackSummary;
  };
  behavior: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    conversionPath: ConversionPath[];
  };
  demografi: {
    usia: DemografiData[];
    gender: DemografiData[];
    lokasi: DemografiData[];
    income: DemografiData[];
  };
}

export interface PerformaInventaris {
  totalStok: {
    unit: number;
    nilai: number;
    turnover: number;
    daysSalesOutstanding: number;
  };
  kategoriPerforma: KategoriInventaris[];
  fastMoving: ProdukInventaris[];
  slowMoving: ProdukInventaris[];
  stockAlert: {
    lowStock: ProdukInventaris[];
    overStock: ProdukInventaris[];
    outOfStock: ProdukInventaris[];
  };
  supplierPerformance: SupplierMetrik[];
}

export interface TrendPasar {
  industryGrowth: {
    rate: number;
    projection: number;
    factors: string[];
  };
  marketShare: {
    current: number;
    target: number;
    competitors: CompetitorShare[];
  };
  priceAnalysis: {
    averageMarketPrice: number;
    ourAveragePrice: number;
    pricePosition: 'premium' | 'competitive' | 'budget';
    priceTrend: TrendData[];
  };
  demandForecast: {
    nextMonth: number;
    nextQuarter: number;
    seasonality: SeasonalityData[];
  };
}

export interface KompetitorAnalysis {
  mainCompetitors: Kompetitor[];
  benchmarking: {
    pricing: BenchmarkData;
    features: BenchmarkData;
    service: BenchmarkData;
    marketing: BenchmarkData;
  };
  competitiveAdvantage: string[];
  threats: string[];
  opportunities: string[];
}

export interface ProyeksiPertumbuhan {
  revenue: ProyeksiData[];
  customers: ProyeksiData[];
  marketShare: ProyeksiData[];
  scenarios: {
    optimistic: ScenarioData;
    realistic: ScenarioData;
    pessimistic: ScenarioData;
  };
  keyDrivers: string[];
  risks: RiskFactor[];
}

// Supporting Interfaces
export interface FunnelData {
  stage: string;
  visitors: number;
  conversion: number;
  dropoff: number;
}

export interface ChannelMetrik {
  visitors: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}

export interface ProdukTerlaris {
  id: string;
  nama: string;
  kategori: string;
  terjual: number;
  revenue: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendData {
  periode: Date;
  nilai: number;
  target?: number;
  benchmark?: number;
}

export interface CustomerSegment {
  nama: string;
  jumlah: number;
  persentase: number;
  revenue: number;
  karakteristik: string[];
  color: string;
}

export interface FeedbackSummary {
  positive: number;
  neutral: number;
  negative: number;
  topIssues: string[];
  improvements: string[];
}

export interface ConversionPath {
  path: string;
  conversions: number;
  revenue: number;
  steps: string[];
}

export interface DemografiData {
  label: string;
  value: number;
  percentage: number;
}

export interface KategoriInventaris {
  kategori: string;
  stok: number;
  nilai: number;
  turnover: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ProdukInventaris {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  nilai: number;
  lastMovement: Date;
  velocity: number;
}

export interface SupplierMetrik {
  id: string;
  nama: string;
  onTimeDelivery: number;
  qualityScore: number;
  costEfficiency: number;
  reliability: number;
}

export interface CompetitorShare {
  nama: string;
  share: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SeasonalityData {
  bulan: string;
  multiplier: number;
  historicalData: number[];
}

export interface Kompetitor {
  nama: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: 'higher' | 'similar' | 'lower';
  threat_level: 'high' | 'medium' | 'low';
}

export interface BenchmarkData {
  ourScore: number;
  industryAverage: number;
  bestInClass: number;
  gap: number;
}

export interface ProyeksiData {
  periode: Date;
  projected: number;
  confidence: number;
  range: {
    min: number;
    max: number;
  };
}

export interface ScenarioData {
  revenue: number;
  growth: number;
  probability: number;
  assumptions: string[];
}

export interface RiskFactor {
  nama: string;
  probability: number;
  impact: number;
  mitigation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Rekomendasi {
  id: string;
  kategori: 'revenue' | 'cost' | 'customer' | 'operations' | 'marketing';
  judul: string;
  deskripsi: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  expectedROI: number;
  priority: number;
  actionItems: string[];
}

export interface FilterAnalitik {
  periode: {
    mulai: Date;
    selesai: Date;
  };
  kategori?: string[];
  channel?: string[];
  region?: string[];
  customerSegment?: string[];
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  sections: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  template?: string;
}

// ==================== MAIN CONTROLLER ====================

export class KontrollerAnalitik {
  private baseURL: string;
  private authController: KontrollerAuth;
  private cache: Map<string, any>;
  private cacheTimeout: number = 15 * 60 * 1000; // 15 menit

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';    
    this.authController = KontrollerAuth.getInstance();
    this.cache = new Map();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Memuat overview performa bisnis lengkap
   */
  async muatOverviewPerformaBisnis(filter?: FilterAnalitik): Promise<OverviewPerformaBisnis> {
    try {
      const cacheKey = `business_overview_${filter ? JSON.stringify(filter) : 'default'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<OverviewPerformaBisnis> = await axios.post(
        `${this.baseURL}/analytics/business-overview`,
        filter || this.getDefaultFilter(),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const overviewData = response.data;
      this.setCache(cacheKey, overviewData);
      return overviewData;

    } catch (error) {
      console.error('Error loading business performance overview:', error);
      return this.getMockOverviewPerformaBisnis();
    }
  }

  // ==================== ADDITIONAL METHODS ====================

  /**
   * Mendapatkan analitik real-time
   */
  async getRealTimeAnalytics(): Promise<any> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<any> = await axios.get(
        `${this.baseURL}/analytics/realtime`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      return this.getMockRealTimeAnalytics();
    }
  }

  /**
   * Mendapatkan analitik berdasarkan periode kustom
   */
  async getCustomPeriodAnalytics(startDate: Date, endDate: Date): Promise<OverviewPerformaBisnis> {
    const filter: FilterAnalitik = {
      periode: {
        mulai: startDate,
        selesai: endDate
      },
      granularity: this.determineGranularity(startDate, endDate)
    };

    return this.muatOverviewPerformaBisnis(filter);
  }

  /**
   * Membandingkan performa antar periode
   */
  async comparePerformance(
    currentPeriod: { mulai: Date; selesai: Date },
    previousPeriod: { mulai: Date; selesai: Date }
  ): Promise<any> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<any> = await axios.post(
        `${this.baseURL}/analytics/compare`,
        {
          currentPeriod,
          previousPeriod
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error comparing performance:', error);
      return this.getMockComparisonData();
    }
  }

  /**
   * Mengekspor laporan analitik
   */
  async exportAnalytics(options: ExportOptions): Promise<string> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ downloadUrl: string }> = await axios.post(
        `${this.baseURL}/analytics/export`,
        options,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.downloadUrl;

    } catch (error) {
      console.error('Error exporting analytics:', error);
      return '';
    }
  }

  /**
   * Mendapatkan insight otomatis dari AI
   */
  async getAIInsights(data: OverviewPerformaBisnis): Promise<string[]> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ insights: string[] }> = await axios.post(
        `${this.baseURL}/analytics/ai-insights`,
        { data },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.insights;

    } catch (error) {
      console.error('Error getting AI insights:', error);
      return this.getMockAIInsights();
    }
  }

  /**
   * Mendapatkan prediksi berbasis machine learning
   */
  async getPredictions(type: 'revenue' | 'sales' | 'customers', horizon: number): Promise<ProyeksiData[]> {
    try {
      const cacheKey = `predictions_${type}_${horizon}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ProyeksiData[]> = await axios.get(
        `${this.baseURL}/analytics/predictions/${type}?horizon=${horizon}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const predictions = response.data;
      this.setCache(cacheKey, predictions, 60 * 60 * 1000); // Cache 1 jam
      return predictions;

    } catch (error) {
      console.error('Error getting predictions:', error);
      return this.getMockPredictions();
    }
  }

  // ==================== UTILITY METHODS ====================

  private getDefaultFilter(): FilterAnalitik {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return {
      periode: {
        mulai: startDate,
        selesai: endDate
      },
      granularity: 'daily'
    };
  }

  private determineGranularity(startDate: Date, endDate: Date): 'daily' | 'weekly' | 'monthly' | 'quarterly' {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) return 'daily';
    if (diffDays <= 90) return 'weekly';
    if (diffDays <= 365) return 'monthly';
    return 'quarterly';
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // ==================== CACHE METHODS ====================

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
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

  // ==================== MOCK DATA METHODS ====================

  private getMockOverviewPerformaBisnis(): OverviewPerformaBisnis {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return {
      id: 'overview_1',
      periode: {
        mulai: startDate,
        selesai: endDate,
        label: 'Last 30 Days'
      },
      ringkasanKeuangan: {
        totalRevenue: {
          nilai: 2500000000,
          perubahan: 15.2,
          target: 2800000000,
          pencapaian: 89.3
        },
        totalProfit: {
          nilai: 375000000,
          margin: 15.0,
          perubahan: 12.8,
          target: 420000000
        },
        totalBiaya: {
          operasional: 1800000000,
          marketing: 200000000,
          administrasi: 100000000,
          lainnya: 25000000,
          total: 2125000000
        },
        cashFlow: {
          masuk: 2500000000,
          keluar: 2125000000,
          net: 375000000,
          proyeksi30Hari: 450000000
        },
        roi: {
          marketing: 12.5,
          inventory: 8.3,
          overall: 17.6
        }
      },
      metrikPenjualan: this.getMockMetrikPenjualan(),
      analisisCustomer: this.getMockAnalisisCustomer(),
      performaInventaris: this.getMockPerformaInventaris(),
      trendPasar: this.getMockTrendPasar(),
      kompetitorAnalysis: this.getMockKompetitorAnalysis(),
      proyeksiPertumbuhan: this.getMockProyeksiPertumbuhan(),
      rekomendasi: this.getMockRekomendasi(),
      lastUpdated: new Date()
    };
  }

  private getMockMetrikPenjualan(): MetrikPenjualan {
    return {
      totalTransaksi: {
        jumlah: 156,
        nilai: 2500000000,
        perubahan: 18.5,
        rataRataNilai: 16025641
      },
      konversiRate: {
        visitor: 12500,
        lead: 2800,
        customer: 156,
        funnel: [
          { stage: 'Visitors', visitors: 12500, conversion: 100, dropoff: 0 },
          { stage: 'Leads', visitors: 2800, conversion: 22.4, dropoff: 77.6 },
          { stage: 'Qualified', visitors: 890, conversion: 31.8, dropoff: 68.2 },
          { stage: 'Customers', visitors: 156, conversion: 17.5, dropoff: 82.5 }
        ]
      },
      channelPerformance: {
        online: { visitors: 8500, conversions: 89, revenue: 1425000000, cost: 85000000, roi: 16.8 },
        offline: { visitors: 2800, conversions: 45, revenue: 720000000, cost: 42000000, roi: 17.1 },
        referral: { visitors: 950, conversions: 18, revenue: 288000000, cost: 12000000, roi: 24.0 },
        social: { visitors: 250, conversions: 4, revenue: 67000000, cost: 8000000, roi: 8.4 }
      },
      topProducts: [
        {
          id: 'prod_1',
          nama: 'Toyota Avanza Veloz',
          kategori: 'MPV',
          terjual: 23,
          revenue: 575000000,
          margin: 12.5,
          trend: 'up'
        },
        {
          id: 'prod_2',
          nama: 'Honda Brio Satya',
          kategori: 'Hatchback',
          terjual: 18,
          revenue: 324000000,
          margin: 15.2,
          trend: 'up'
        }
      ],
      salesTrend: this.generateTrendData(30),
      customerAcquisition: {
        cost: 850000,
        lifetime_value: 25000000,
        payback_period: 3.2
      }
    };
  }

  private getMockAnalisisCustomer(): AnalisisCustomer {
    return {
      totalCustomer: {
        aktif: 1250,
        baru: 156,
        returning: 89,
        churn: 23
      },
      segmentasi: [
        {
          nama: 'Premium Buyers',
          jumlah: 125,
          persentase: 10.0,
          revenue: 875000000,
          karakteristik: ['High income', 'Luxury preference', 'Brand loyal'],
          color: '#FFD700'
        },
        {
          nama: 'Family Oriented',
          jumlah: 625,
          persentase: 50.0,
          revenue: 1250000000,
          karakteristik: ['Safety focused', 'Space priority', 'Value conscious'],
          color: '#32CD32'
        },
        {
          nama: 'First Time Buyers',
          jumlah: 375,
          persentase: 30.0,
          revenue: 300000000,
          karakteristik: ['Budget conscious', 'Fuel efficient', 'Compact cars'],
          color: '#87CEEB'
        },
        {
          nama: 'Business Users',
          jumlah: 125,
          persentase: 10.0,
          revenue: 75000000,
          karakteristik: ['Commercial use', 'Durability focus', 'Cost effective'],
          color: '#DDA0DD'
        }
      ],
      kepuasan: {
        rating: 4.3,
        nps: 67,
        csat: 85.2,
        feedback: {
          positive: 78,
          neutral: 15,
          negative: 7,
          topIssues: ['Delivery time', 'Documentation process', 'After sales service'],
          improvements: ['Faster processing', 'Better communication', 'Extended warranty']
        }
      },
      behavior: {
        averageSessionDuration: 285,
        pagesPerSession: 4.2,
        bounceRate: 32.5,
        conversionPath: [
          {
            path: 'Homepage → Catalog → Detail → Contact',
            conversions: 45,
            revenue: 720000000,
            steps: ['Homepage', 'Catalog', 'Detail', 'Contact']
          },
          {
            path: 'Search → Detail → Compare → Contact',
            conversions: 38,
            revenue: 608000000,
            steps: ['Search', 'Detail', 'Compare', 'Contact']
          }
        ]
      },
      demografi: {
        usia: [
          { label: '18-25', value: 125, percentage: 10 },
          { label: '26-35', value: 500, percentage: 40 },
          { label: '36-45', value: 375, percentage: 30 },
          { label: '46-55', value: 188, percentage: 15 },
          { label: '55+', value: 62, percentage: 5 }
        ],
        gender: [
          { label: 'Male', value: 750, percentage: 60 },
          { label: 'Female', value: 500, percentage: 40 }
        ],
        lokasi: [
          { label: 'Jakarta', value: 375, percentage: 30 },
          { label: 'Surabaya', value: 250, percentage: 20 },
          { label: 'Bandung', value: 188, percentage: 15 },
          { label: 'Medan', value: 125, percentage: 10 },
          { label: 'Others', value: 312, percentage: 25 }
        ],
        income: [
          { label: '< 5M', value: 250, percentage: 20 },
          { label: '5-10M', value: 500, percentage: 40 },
          { label: '10-20M', value: 375, percentage: 30 },
          { label: '> 20M', value: 125, percentage: 10 }
        ]
      }
    };
  }

  private getMockPerformaInventaris(): PerformaInventaris {
    return {
      totalStok: {
        unit: 450,
        nilai: 18750000000,
        turnover: 6.8,
        daysSalesOutstanding: 53.7
      },
      kategoriPerforma: [
        {
          kategori: 'Sedan',
          stok: 125,
          nilai: 6250000000,
          turnover: 8.2,
          margin: 14.5,
          trend: 'up'
        },
        {
          kategori: 'SUV',
          stok: 89,
          nilai: 5340000000,
          turnover: 7.1,
          margin: 16.8,
          trend: 'up'
        },
        {
          kategori: 'MPV',
          stok: 156,
          nilai: 4680000000,
          turnover: 6.9,
          margin: 13.2,
          trend: 'stable'
        },
        {
          kategori: 'Hatchback',
          stok: 80,
          nilai: 2480000000,
          turnover: 5.4,
          margin: 12.1,
          trend: 'down'
        }
      ],
      fastMoving: [
        {
          id: 'inv_1',
          nama: 'Toyota Avanza Veloz',
          kategori: 'MPV',
          stok: 12,
          nilai: 300000000,
          lastMovement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          velocity: 8.5
        }
      ],
      slowMoving: [
        {
          id: 'inv_2',
          nama: 'Luxury Sedan X',
          kategori: 'Sedan',
          stok: 5,
          nilai: 750000000,
          lastMovement: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          velocity: 0.8
        }
      ],
      stockAlert: {
        lowStock: [],
        overStock: [],
        outOfStock: []
      },
      supplierPerformance: [
        {
          id: 'sup_1',
          nama: 'Toyota Astra Motor',
          onTimeDelivery: 95.2,
          qualityScore: 98.5,
          costEfficiency: 87.3,
          reliability: 96.8
        }
      ]
    };
  }

  private getMockTrendPasar(): TrendPasar {
    return {
      industryGrowth: {
        rate: 8.5,
        projection: 12.3,
        factors: ['Economic recovery', 'Government incentives', 'Rising middle class']
      },
      marketShare: {
        current: 12.5,
        target: 15.0,
        competitors: [
          { nama: 'Competitor A', share: 25.3, trend: 'stable' },
          { nama: 'Competitor B', share: 18.7, trend: 'down' },
          { nama: 'Competitor C', share: 15.2, trend: 'up' }
        ]
      },
      priceAnalysis: {
        averageMarketPrice: 285000000,
        ourAveragePrice: 275000000,
        pricePosition: 'competitive',
        priceTrend: this.generateTrendData(12, 250000000, 300000000)
      },
      demandForecast: {
        nextMonth: 180,
        nextQuarter: 520,
        seasonality: [
          { bulan: 'Jan', multiplier: 0.85, historicalData: [145, 152, 148] },
          { bulan: 'Feb', multiplier: 0.90, historicalData: [156, 162, 159] },
          { bulan: 'Mar', multiplier: 1.15, historicalData: [189, 195, 192] }
        ]
      }
    };
  }

  private getMockKompetitorAnalysis(): KompetitorAnalysis {
    return {
      mainCompetitors: [
        {
          nama: 'AutoMax Indonesia',
          marketShare: 25.3,
          strengths: ['Wide network', 'Strong brand', 'Competitive pricing'],
          weaknesses: ['Limited online presence', 'Slow digital adoption'],
          pricing: 'similar',
          threat_level: 'high'
        },
        {
          nama: 'MobilKu Group',
          marketShare: 18.7,
          strengths: ['Digital first', 'Fast service', 'Modern facilities'],
          weaknesses: ['Limited inventory', 'Higher prices'],
          pricing: 'higher',
          threat_level: 'medium'
        }
      ],
      benchmarking: {
        pricing: { ourScore: 85, industryAverage: 80, bestInClass: 92, gap: -7 },
        features: { ourScore: 78, industryAverage: 75, bestInClass: 88, gap: -10 },
        service: { ourScore: 88, industryAverage: 82, bestInClass: 95, gap: -7 },
        marketing: { ourScore: 72, industryAverage: 78, bestInClass: 90, gap: -18 }
      },
      competitiveAdvantage: [
        'Superior customer service',
        'Comprehensive warranty',
        'Flexible financing options'
      ],
      threats: [
        'New digital-native competitors',
        'Changing customer preferences',
        'Economic uncertainty'
      ],
      opportunities: [
        'Electric vehicle market',
        'Rural market expansion',
        'Corporate fleet sales'
      ]
    };
  }

  private getMockProyeksiPertumbuhan(): ProyeksiPertumbuhan {
    return {
      revenue: this.generateProjectionData(12, 2500000000),
      customers: this.generateProjectionData(12, 1250),
      marketShare: this.generateProjectionData(12, 12.5),
      scenarios: {
        optimistic: {
          revenue: 3500000000,
          growth: 40.0,
          probability: 25,
          assumptions: ['Strong economic growth', 'Successful new product launch', 'Market expansion']
        },
        realistic: {
          revenue: 3000000000,
          growth: 20.0,
          probability: 50,
          assumptions: ['Stable market conditions', 'Moderate competition', 'Current trends continue']
        },
        pessimistic: {
          revenue: 2750000000,
          growth: 10.0,
          probability: 25,
          assumptions: ['Economic downturn', 'Increased competition', 'Market saturation']
        }
      },
      keyDrivers: [
        'Digital transformation',
        'Customer experience improvement',
        'Market expansion',
        'Product innovation'
      ],
      risks: [
        {
          nama: 'Economic recession',
          probability: 30,
          impact: 85,
          mitigation: 'Diversify revenue streams',
          priority: 'high'
        },
        {
          nama: 'New competitor entry',
          probability: 60,
          impact: 65,
          mitigation: 'Strengthen competitive advantages',
          priority: 'medium'
        }
      ]
    };
  }

  private getMockRekomendasi(): Rekomendasi[] {
    return [
      {
        id: 'rec_1',
        kategori: 'revenue',
        judul: 'Expand Digital Marketing',
        deskripsi: 'Increase investment in digital marketing channels to improve online visibility and lead generation',
        impact: 'high',
        effort: 'medium',
        timeline: '3-6 months',
        expectedROI: 25.5,
        priority: 1,
        actionItems: [
          'Increase Google Ads budget by 40%',
          'Launch social media campaigns',
          'Implement SEO optimization',
          'Create content marketing strategy'
        ]
      },
      {
        id: 'rec_2',
        kategori: 'customer',
        judul: 'Improve Customer Experience',
        deskripsi: 'Enhance customer journey and reduce friction points to increase conversion rates',
        impact: 'high',
        effort: 'high',
        timeline: '6-12 months',
        expectedROI: 18.2,
        priority: 2,
        actionItems: [
          'Redesign website UX',
          'Implement live chat support',
          'Streamline documentation process',
          'Create customer feedback system'
        ]
      }
    ];
  }

  private getMockRealTimeAnalytics(): any {
    return {
      currentVisitors: 45,
      todayRevenue: 125000000,
      todayTransactions: 8,
      conversionRate: 5.2,
      topPages: [
        { page: '/catalog', visitors: 23 },
        { page: '/detail/toyota-avanza', visitors: 12 },
        { page: '/financing', visitors: 8 }
      ]
    };
  }

  private getMockComparisonData(): any {
    return {
      revenue: {
        current: 2500000000,
        previous: 2170000000,
        change: 15.2
      },
      transactions: {
        current: 156,
        previous: 132,
        change: 18.2
      },
      customers: {
        current: 1250,
        previous: 1089,
        change: 14.8
      }
    };
  }

  private getMockAIInsights(): string[] {
    return [
      'Revenue growth is accelerating, with a 15.2% increase compared to last period',
      'Customer acquisition cost has decreased by 8%, indicating improved marketing efficiency',
      'Premium segment shows highest growth potential with 25% increase in inquiries',
      'Mobile traffic accounts for 65% of visits but only 35% of conversions - optimization needed',
      'Inventory turnover for SUV category is 18% above industry average'
    ];
  }

  private getMockPredictions(): ProyeksiData[] {
    return this.generateProjectionData(6, 2500000000);
  }

  private generateTrendData(days: number, baseValue: number = 100000000, maxValue?: number): TrendData[] {
    const data: TrendData[] = [];
    let currentValue = baseValue;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some randomness
      const change = (Math.random() - 0.5) * 0.1; // ±5% change
      currentValue = Math.max(currentValue * (1 + change), baseValue * 0.5);
      
      if (maxValue) {
        currentValue = Math.min(currentValue, maxValue);
      }
      
      data.push({
        periode: date,
        nilai: Math.round(currentValue)
      });
    }
    
    return data;
  }

  private generateProjectionData(months: number, baseValue: number): ProyeksiData[] {
    const data: ProyeksiData[] = [];
    let currentValue = baseValue;
    
    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // Simulate growth with some variance
      const growth = 0.02 + (Math.random() * 0.03); // 2-5% monthly growth
      currentValue = currentValue * (1 + growth);
      
      const variance = currentValue * 0.15; // ±15% confidence range
      
      data.push({
        periode: date,
        projected: Math.round(currentValue),
        confidence: 75 + Math.random() * 20, // 75-95% confidence
        range: {
          min: Math.round(currentValue - variance),
          max: Math.round(currentValue + variance)
        }
      });
    }
    
    return data;
  }
}

export default KontrollerAnalitik;
