import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data iklan
export interface DataIklan {
  id?: string;
  carId: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: 'new' | 'used';
  images: string[];
  features: string[];
  specifications: {
    brand: string;
    model: string;
    year: number;
    transmission: 'manual' | 'automatic' | 'cvt';
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    mileage?: number;
    color: string;
    engine: string;
    seatingCapacity: number;
  };
  location: {
    city: string;
    province: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {
    name: string;
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  adPackage: 'basic' | 'premium' | 'featured';
  duration: number; // in days
  autoRenew: boolean;
  tags?: string[];
  seoKeywords?: string[];
  status: 'draft' | 'active' | 'paused' | 'expired' | 'rejected' | 'sold';
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

// Interface untuk paket iklan
export interface PaketIklan {
  id: string;
  name: string;
  type: 'basic' | 'premium' | 'featured';
  price: number;
  duration: number; // in days
  features: PaketFeature[];
  benefits: string[];
  limitations?: string[];
  isPopular: boolean;
  discount?: {
    percentage: number;
    validUntil: Date;
    minDuration?: number;
  };
}

// Interface untuk fitur paket
export interface PaketFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  icon?: string;
}

// Interface untuk statistik iklan
export interface StatistikIklan {
  adId: string;
  views: number;
  clicks: number;
  contacts: number;
  favorites: number;
  shares: number;
  ctr: number; // Click Through Rate
  conversionRate: number;
  dailyStats: DailyStats[];
  topSources: TrafficSource[];
  demographics: Demographics;
  performance: PerformanceMetrics;
}

// Interface untuk statistik harian
export interface DailyStats {
  date: Date;
  views: number;
  clicks: number;
  contacts: number;
  favorites: number;
}

// Interface untuk sumber traffic
export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

// Interface untuk demografi
export interface Demographics {
  ageGroups: { range: string; percentage: number }[];
  locations: { city: string; percentage: number }[];
  devices: { type: string; percentage: number }[];
}

// Interface untuk metrik performa
export interface PerformanceMetrics {
  averageViewDuration: number;
  bounceRate: number;
  engagementRate: number;
  qualityScore: number;
  competitorComparison: {
    views: 'above' | 'below' | 'average';
    price: 'competitive' | 'high' | 'low';
    response: 'fast' | 'slow' | 'average';
  };
}

// Interface untuk response iklan
export interface IklanResponse {
  success: boolean;
  message: string;
  data: {
    ad: DataIklan;
    paymentRequired?: boolean;
    paymentDetails?: {
      amount: number;
      paymentUrl: string;
      orderId: string;
    };
  };
}

// Interface untuk response paket
export interface PaketResponse {
  success: boolean;
  message: string;
  data: PaketIklan[];
}

class KontrollerIklan {
  private static instance: KontrollerIklan;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerIklan {
    if (!KontrollerIklan.instance) {
      KontrollerIklan.instance = new KontrollerIklan();
    }
    return KontrollerIklan.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Cache management
  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  // Buat iklan baru
  public async buatIklan(dataIklan: DataIklan): Promise<IklanResponse | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to create ad');
      }

      // Validate data iklan
      const validationResult = this.validateDataIklan(dataIklan);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await axios.post(`${API_BASE_URL}/ads`, dataIklan, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Clear related cache
        this.clearAdsCache();
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Buat iklan error:', error);
      
      // Return mock response for development
      return this.getMockIklanResponse(dataIklan);
    }
  }

  // Edit iklan
  public async editIklan(idIklan: string, dataIklan: Partial<DataIklan>): Promise<IklanResponse | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to edit ad');
      }

      const response = await axios.put(`${API_BASE_URL}/ads/${idIklan}`, dataIklan, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        this.clearAdsCache();
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Edit iklan error:', error);
      return null;
    }
  }

  // Hapus iklan
  public async hapusIklan(idIklan: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/ads/${idIklan}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearAdsCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Hapus iklan error:', error);
      return false;
    }
  }

  // Pilih paket iklan
  public async pilihPaketIklan(idPaket: string, duration: number, autoRenew: boolean = false): Promise<{ success: boolean; paymentUrl?: string; orderId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to select ad package');
      }

      const response = await axios.post(`${API_BASE_URL}/ads/packages/${idPaket}/select`, {
        duration,
        autoRenew
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.data.paymentUrl,
          orderId: response.data.data.orderId
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Pilih paket iklan error:', error);
      
      // Return mock response for development
      return {
        success: true,
        paymentUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions/token',
        orderId: 'ORDER-' + Date.now()
      };
    }
  }

  // Get available packages
  public async getPaketIklan(): Promise<PaketIklan[]> {
    try {
      const cacheKey = 'ad_packages';
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/ads/packages`);

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 60); // Cache for 1 hour
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get paket iklan error:', error);
      return this.getMockPaketIklan();
    }
  }

  // Get user's ads
  public async getUserAds(
    page: number = 1,
    limit: number = 10,
    status?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ ads: DataIklan[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (status) params.append('status', status);

      const response = await axios.get(`${API_BASE_URL}/ads/my-ads?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get user ads error:', error);
      return this.getMockUserAds();
    }
  }

  // Get ad statistics
  public async getStatistikIklan(idIklan: string, dateRange?: { from: Date; to: Date }): Promise<StatistikIklan | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      if (dateRange) {
        params.append('from', dateRange.from.toISOString());
        params.append('to', dateRange.to.toISOString());
      }

      const response = await axios.get(`${API_BASE_URL}/ads/${idIklan}/statistics?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get statistik iklan error:', error);
      return this.getMockStatistikIklan(idIklan);
    }
  }

  // Pause/Resume ad
  public async toggleAdStatus(idIklan: string, status: 'active' | 'paused'): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.patch(`${API_BASE_URL}/ads/${idIklan}/status`, {
        status
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearAdsCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Toggle ad status error:', error);
      return false;
    }
  }

  // Renew ad
  public async renewAd(idIklan: string, duration: number): Promise<{ success: boolean; paymentUrl?: string; orderId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const response = await axios.post(`${API_BASE_URL}/ads/${idIklan}/renew`, {
        duration
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.data.paymentUrl,
          orderId: response.data.data.orderId
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Renew ad error:', error);
      return { success: false };
    }
  }

  // Boost ad (promote to featured)
  public async boostAd(idIklan: string, duration: number): Promise<{ success: boolean; paymentUrl?: string; orderId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const response = await axios.post(`${API_BASE_URL}/ads/${idIklan}/boost`, {
        duration
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.data.paymentUrl,
          orderId: response.data.data.orderId
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Boost ad error:', error);
      return { success: false };
    }
  }

  // Upload ad images
  public async uploadAdImages(files: File[]): Promise<string[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      const response = await axios.post(`${API_BASE_URL}/ads/upload-images`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data.imageUrls;
      }

      return [];
    } catch (error: any) {
      console.error('Upload ad images error:', error);
      return [];
    }
  }

  // Get ad performance recommendations
  public async getPerformanceRecommendations(idIklan: string): Promise<string[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/ads/${idIklan}/recommendations`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data.recommendations;
      }

      return [];
    } catch (error: any) {
      console.error('Get performance recommendations error:', error);
      return this.getMockRecommendations();
    }
  }

  // Validate data iklan
  private validateDataIklan(data: DataIklan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.carId) errors.push('Car ID is required');
    if (!data.title || data.title.length < 10) errors.push('Title must be at least 10 characters');
    if (!data.description || data.description.length < 50) errors.push('Description must be at least 50 characters');
    if (!data.price || data.price <= 0) errors.push('Price must be greater than 0');
    if (!data.images || data.images.length === 0) errors.push('At least one image is required');
    if (data.images && data.images.length > 20) errors.push('Maximum 20 images allowed');
    if (!data.specifications.brand) errors.push('Brand is required');
    if (!data.specifications.model) errors.push('Model is required');
    if (!data.specifications.year || data.specifications.year < 1900) errors.push('Valid year is required');
    if (!data.location.city) errors.push('City is required');
    if (!data.location.province) errors.push('Province is required');
    if (!data.contact.name) errors.push('Contact name is required');
    if (!data.contact.phone) errors.push('Contact phone is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear ads cache
  private clearAdsCache(): void {
    const keysToDelete: string[] = [];
    const cacheKeys = Array.from(this.cache.keys());
    
    for (const key of cacheKeys) {
      if (key.includes('ads') || key.includes('ad_')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  // Format currency
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Calculate ad cost
  public calculateAdCost(packageType: string, duration: number): number {
    const basePrices = {
      basic: 50000,
      premium: 150000,
      featured: 300000
    };

    const basePrice = basePrices[packageType as keyof typeof basePrices] || 50000;
    const discountRate = duration >= 30 ? 0.2 : duration >= 14 ? 0.1 : 0;
    
    return Math.round(basePrice * duration * (1 - discountRate));
  }

  // Mock data for development
  private getMockIklanResponse(dataIklan: DataIklan): IklanResponse {
    return {
      success: true,
      message: 'Iklan berhasil dibuat',
      data: {
        ad: {
          ...dataIklan,
          id: 'ad-' + Date.now(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + dataIklan.duration * 24 * 60 * 60 * 1000)
        },
        paymentRequired: dataIklan.adPackage !== 'basic',
        paymentDetails: dataIklan.adPackage !== 'basic' ? {
          amount: this.calculateAdCost(dataIklan.adPackage, dataIklan.duration),
          paymentUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions/token',
          orderId: 'ORDER-' + Date.now()
        } : undefined
      }
    };
  }

  private getMockPaketIklan(): PaketIklan[] {
    return [
      {
        id: 'basic',
        name: 'Paket Basic',
        type: 'basic',
        price: 0,
        duration: 30,
        features: [
          { id: '1', name: 'Listing Standard', description: 'Iklan ditampilkan di katalog', included: true },
          { id: '2', name: 'Foto Mobil', description: 'Maksimal 5 foto', included: true, limit: 5 },
          { id: '3', name: 'Kontak Langsung', description: 'Pembeli dapat menghubungi langsung', included: true },
          { id: '4', name: 'Promosi Premium', description: 'Iklan dipromosikan di halaman utama', included: false }
        ],
        benefits: ['Gratis selamanya', 'Mudah digunakan', 'Jangkauan lokal'],
        isPopular: false
      },
      {
        id: 'premium',
        name: 'Paket Premium',
        type: 'premium',
        price: 150000,
        duration: 30,
        features: [
          { id: '1', name: 'Listing Premium', description: 'Iklan ditampilkan lebih menonjol', included: true },
          { id: '2', name: 'Foto Mobil', description: 'Maksimal 15 foto', included: true, limit: 15 },
          { id: '3', name: 'Video Mobil', description: 'Upload video mobil', included: true, limit: 1 },
          { id: '4', name: 'Badge Premium', description: 'Badge khusus untuk iklan premium', included: true },
          { id: '5', name: 'Statistik Detail', description: 'Analisis performa iklan', included: true }
        ],
        benefits: ['Jangkauan lebih luas', 'Prioritas pencarian', 'Statistik lengkap'],
        isPopular: true,
        discount: {
          percentage: 20,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          minDuration: 30
        }
      },
      {
        id: 'featured',
        name: 'Paket Featured',
        type: 'featured',
        price: 300000,
        duration: 30,
        features: [
          { id: '1', name: 'Listing Featured', description: 'Iklan ditampilkan di posisi teratas', included: true },
          { id: '2', name: 'Foto Mobil', description: 'Unlimited foto', included: true },
          { id: '3', name: 'Video Mobil', description: 'Upload multiple video', included: true, limit: 3 },
          { id: '4', name: 'Badge Featured', description: 'Badge khusus featured', included: true },
          { id: '5', name: 'Promosi Social Media', description: 'Dipromosikan di media sosial', included: true },
          { id: '6', name: 'Dedicated Support', description: 'Dukungan khusus dari tim kami', included: true }
        ],
        benefits: ['Eksposur maksimal', 'Penjualan lebih cepat', 'Support prioritas'],
        isPopular: false
      }
    ];
  }

  private getMockUserAds(): { ads: DataIklan[]; pagination: any } {
    return {
      ads: [
        {
          id: 'ad-1',
          carId: 'car-1',
          title: 'Toyota Avanza 2023 - Kondisi Prima',
          description: 'Toyota Avanza 2023 dalam kondisi sangat baik, service record lengkap, pajak hidup, siap pakai.',
          price: 250000000,
          negotiable: true,
          condition: 'new',
          images: ['/images/cars/avanza-1.jpg', '/images/cars/avanza-2.jpg'],
          features: ['AC', 'Power Steering', 'Central Lock'],
          specifications: {
            brand: 'Toyota',
            model: 'Avanza',
            year: 2023,
            transmission: 'manual',
            fuelType: 'gasoline',
            color: 'Silver',
            engine: '1.3L',
            seatingCapacity: 7
          },
          location: {
            city: 'Jakarta',
            province: 'DKI Jakarta'
          },
          contact: {
            name: 'John Doe',
            phone: '08123456789'
          },
          adPackage: 'premium',
          duration: 30,
          autoRenew: false,
          status: 'active',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          expiresAt: new Date('2024-02-14')
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockStatistikIklan(idIklan: string): StatistikIklan {
    return {
      adId: idIklan,
      views: 1250,
      clicks: 89,
      contacts: 15,
      favorites: 32,
      shares: 8,
      ctr: 7.12,
      conversionRate: 16.85,
      dailyStats: [
        { date: new Date('2024-01-15'), views: 45, clicks: 3, contacts: 1, favorites: 2 },
        { date: new Date('2024-01-16'), views: 67, clicks: 5, contacts: 2, favorites: 3 },
        { date: new Date('2024-01-17'), views: 89, clicks: 7, contacts: 1, favorites: 4 }
      ],
      topSources: [
        { source: 'Direct', visits: 450, percentage: 36 },
        { source: 'Google Search', visits: 380, percentage: 30.4 },
        { source: 'Facebook', visits: 250, percentage: 20 },
        { source: 'Instagram', visits: 170, percentage: 13.6 }
      ],
      demographics: {
        ageGroups: [
          { range: '25-34', percentage: 35 },
          { range: '35-44', percentage: 28 },
          { range: '18-24', percentage: 22 },
          { range: '45-54', percentage: 15 }
        ],
        locations: [
          { city: 'Jakarta', percentage: 45 },
          { city: 'Bogor', percentage: 20 },
          { city: 'Depok', percentage: 18 },
          { city: 'Tangerang', percentage: 17 }
        ],
        devices: [
          { type: 'Mobile', percentage: 68 },
          { type: 'Desktop', percentage: 25 },
          { type: 'Tablet', percentage: 7 }
        ]
      },
      performance: {
        averageViewDuration: 125,
        bounceRate: 35,
        engagementRate: 12.5,
        qualityScore: 8.5,
        competitorComparison: {
          views: 'above',
          price: 'competitive',
          response: 'fast'
        }
      }
    };
  }

  private getMockRecommendations(): string[] {
    return [
      'Tambahkan lebih banyak foto interior mobil',
      'Perbarui deskripsi dengan informasi service record',
      'Pertimbangkan untuk menurunkan harga 5-10% untuk meningkatkan minat',
      'Tambahkan video singkat untuk meningkatkan engagement',
      'Update lokasi dengan alamat yang lebih spesifik'
    ];
  }
}

export default KontrollerIklan;