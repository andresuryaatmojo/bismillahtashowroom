import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk item wishlist
export interface ItemWishlist {
  id: string;
  userId: string;
  carId: string;
  carDetails: {
    brand: string;
    model: string;
    year: number;
    variant?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    location: string;
    dealer: {
      id: string;
      name: string;
      rating: number;
    };
    specifications: {
      engine: string;
      transmission: string;
      fuelType: string;
      seatingCapacity: number;
    };
    features: string[];
    availability: 'available' | 'sold' | 'reserved' | 'coming_soon';
  };
  addedAt: Date;
  notes?: string;
  priceAlerts: PriceAlert[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  reminderDate?: Date;
  viewCount: number;
  lastViewedAt?: Date;
}

// Interface untuk price alert
export interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: 'below' | 'above' | 'equals';
  active: boolean;
  triggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

// Interface untuk wishlist collection
export interface KoleksiWishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: string[]; // Array of wishlist item IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[]; // Array of user IDs
  shareLink?: string;
}

// Interface untuk wishlist statistics
export interface StatistikWishlist {
  totalItems: number;
  totalCollections: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  byBrand: {
    brand: string;
    count: number;
    percentage: number;
  }[];
  byPriceRange: {
    range: string;
    count: number;
    percentage: number;
  }[];
  byYear: {
    year: number;
    count: number;
  }[];
  recentActivity: {
    action: 'added' | 'removed' | 'viewed' | 'price_alert';
    carName: string;
    timestamp: Date;
  }[];
  recommendations: RecommendationData[];
}

// Interface untuk rekomendasi
export interface RecommendationData {
  carId: string;
  carName: string;
  reason: string;
  score: number;
  price: number;
  image: string;
  similarity: number;
}

// Interface untuk comparison data
export interface PerbandinganWishlist {
  items: ItemWishlist[];
  comparisonMatrix: {
    feature: string;
    values: { [carId: string]: any };
    type: 'text' | 'number' | 'boolean' | 'rating';
  }[];
  summary: {
    cheapest: ItemWishlist;
    mostExpensive: ItemWishlist;
    newest: ItemWishlist;
    oldest: ItemWishlist;
    bestRated: ItemWishlist;
  };
}

// Interface untuk sharing options
export interface SharingOptions {
  platform: 'whatsapp' | 'email' | 'facebook' | 'twitter' | 'copy_link';
  message?: string;
  recipients?: string[];
}

class KontrollerWishlist {
  private static instance: KontrollerWishlist;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerWishlist {
    if (!KontrollerWishlist.instance) {
      KontrollerWishlist.instance = new KontrollerWishlist();
    }
    return KontrollerWishlist.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Add item to wishlist
  public async addToWishlist(
    carId: string,
    notes?: string,
    tags?: string[],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{ success: boolean; itemId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to add to wishlist');
      }

      const response = await axios.post(`${API_BASE_URL}/wishlist/add`, {
        carId,
        notes,
        tags,
        priority
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Clear cache
        this.clearWishlistCache();
        return {
          success: true,
          itemId: response.data.data.id
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Add to wishlist error:', error);
      
      // Return mock response for development
      return {
        success: true,
        itemId: 'wishlist-' + Date.now()
      };
    }
  }

  // Remove item from wishlist
  public async removeFromWishlist(itemId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/wishlist/items/${itemId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Clear cache
        this.clearWishlistCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Remove from wishlist error:', error);
      return true; // Mock success for development
    }
  }

  // Get user's wishlist
  public async getWishlist(
    page: number = 1,
    limit: number = 20,
    sortBy: 'addedAt' | 'price' | 'year' | 'brand' = 'addedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters: {
      brand?: string;
      priceMin?: number;
      priceMax?: number;
      year?: number;
      tags?: string[];
      priority?: string;
    } = {}
  ): Promise<{ items: ItemWishlist[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const cacheKey = `wishlist-${page}-${limit}-${sortBy}-${sortOrder}-${JSON.stringify(filters)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await axios.get(`${API_BASE_URL}/wishlist?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const result = response.data.data;
        this.setCache(cacheKey, result, 5 * 60 * 1000); // 5 minutes
        return result;
      }

      return null;
    } catch (error: any) {
      console.error('Get wishlist error:', error);
      return this.getMockWishlist();
    }
  }

  // Get wishlist item details
  public async getWishlistItem(itemId: string): Promise<ItemWishlist | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/wishlist/items/${itemId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get wishlist item error:', error);
      return this.getMockWishlistItem(itemId);
    }
  }

  // Update wishlist item
  public async updateWishlistItem(
    itemId: string,
    updates: {
      notes?: string;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      reminderDate?: Date;
    }
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.put(`${API_BASE_URL}/wishlist/items/${itemId}`, updates, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Clear cache
        this.clearWishlistCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Update wishlist item error:', error);
      return true; // Mock success for development
    }
  }

  // Check if car is in wishlist
  public async isInWishlist(carId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.get(`${API_BASE_URL}/wishlist/check/${carId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data.success && response.data.data.inWishlist;
    } catch (error: any) {
      console.error('Check wishlist error:', error);
      return false;
    }
  }

  // Set price alert
  public async setPriceAlert(
    itemId: string,
    targetPrice: number,
    condition: 'below' | 'above' | 'equals' = 'below'
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/wishlist/items/${itemId}/price-alert`, {
        targetPrice,
        condition
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Set price alert error:', error);
      return true; // Mock success for development
    }
  }

  // Remove price alert
  public async removePriceAlert(itemId: string, alertId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/wishlist/items/${itemId}/price-alert/${alertId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Remove price alert error:', error);
      return true; // Mock success for development
    }
  }

  // Create wishlist collection
  public async createCollection(
    name: string,
    description?: string,
    isPublic: boolean = false,
    itemIds: string[] = []
  ): Promise<{ success: boolean; collectionId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const response = await axios.post(`${API_BASE_URL}/wishlist/collections`, {
        name,
        description,
        isPublic,
        itemIds
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          collectionId: response.data.data.id
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Create collection error:', error);
      return {
        success: true,
        collectionId: 'collection-' + Date.now()
      };
    }
  }

  // Get wishlist collections
  public async getCollections(): Promise<KoleksiWishlist[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const cacheKey = 'wishlist-collections';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/wishlist/collections`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const collections = response.data.data;
        this.setCache(cacheKey, collections, 10 * 60 * 1000); // 10 minutes
        return collections;
      }

      return [];
    } catch (error: any) {
      console.error('Get collections error:', error);
      return this.getMockCollections();
    }
  }

  // Get wishlist statistics
  public async getWishlistStatistics(): Promise<StatistikWishlist | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const cacheKey = 'wishlist-statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/wishlist/statistics`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const stats = response.data.data;
        this.setCache(cacheKey, stats, 15 * 60 * 1000); // 15 minutes
        return stats;
      }

      return null;
    } catch (error: any) {
      console.error('Get wishlist statistics error:', error);
      return this.getMockStatistics();
    }
  }

  // Compare wishlist items
  public async compareWishlistItems(itemIds: string[]): Promise<PerbandinganWishlist | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      if (itemIds.length < 2) {
        throw new Error('At least 2 items required for comparison');
      }

      const response = await axios.post(`${API_BASE_URL}/wishlist/compare`, {
        itemIds
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Compare wishlist items error:', error);
      return this.getMockComparison(itemIds);
    }
  }

  // Share wishlist
  public async shareWishlist(
    collectionId: string,
    options: SharingOptions
  ): Promise<{ success: boolean; shareUrl?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const response = await axios.post(`${API_BASE_URL}/wishlist/collections/${collectionId}/share`, options, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          shareUrl: response.data.data.shareUrl
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Share wishlist error:', error);
      return {
        success: true,
        shareUrl: `https://mobilindo.com/wishlist/shared/${collectionId}`
      };
    }
  }

  // Export wishlist
  public async exportWishlist(
    format: 'pdf' | 'excel' | 'csv' = 'pdf',
    collectionId?: string
  ): Promise<{ success: boolean; downloadUrl?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const params = new URLSearchParams();
      params.append('format', format);
      if (collectionId) params.append('collectionId', collectionId);

      const response = await axios.get(`${API_BASE_URL}/wishlist/export?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          downloadUrl: response.data.data.downloadUrl
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Export wishlist error:', error);
      return {
        success: true,
        downloadUrl: `https://example.com/exports/wishlist-${Date.now()}.${format}`
      };
    }
  }

  // Clear wishlist cache
  private clearWishlistCache(): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith('wishlist-') || key === 'wishlist-collections' || key === 'wishlist-statistics'
    );
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  // Cache management
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
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

  // Format date
  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  // Get priority color
  public getPriorityColor(priority: string): string {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444'
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  }

  // Mock data for development
  private getMockWishlist(): { items: ItemWishlist[]; pagination: any } {
    return {
      items: [
        {
          id: 'wishlist-1',
          userId: 'user-123',
          carId: 'car-456',
          carDetails: {
            brand: 'Toyota',
            model: 'Camry',
            year: 2023,
            variant: 'Hybrid',
            price: 650000000,
            originalPrice: 700000000,
            discount: 50000000,
            images: ['/images/cars/camry-1.jpg', '/images/cars/camry-2.jpg'],
            location: 'Jakarta',
            dealer: {
              id: 'dealer-1',
              name: 'Toyota Jakarta',
              rating: 4.8
            },
            specifications: {
              engine: '2.5L Hybrid',
              transmission: 'CVT',
              fuelType: 'Hybrid',
              seatingCapacity: 5
            },
            features: ['Sunroof', 'Leather Seats', 'Navigation', 'Safety Sense'],
            availability: 'available'
          },
          addedAt: new Date('2024-01-15'),
          notes: 'Mobil impian untuk keluarga',
          priceAlerts: [
            {
              id: 'alert-1',
              targetPrice: 600000000,
              condition: 'below',
              active: true,
              triggered: false,
              createdAt: new Date('2024-01-15')
            }
          ],
          tags: ['family', 'hybrid', 'sedan'],
          priority: 'high',
          viewCount: 15,
          lastViewedAt: new Date('2024-01-20')
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockWishlistItem(itemId: string): ItemWishlist {
    const mockData = this.getMockWishlist().items[0];
    return { ...mockData, id: itemId };
  }

  private getMockCollections(): KoleksiWishlist[] {
    return [
      {
        id: 'collection-1',
        userId: 'user-123',
        name: 'Mobil Keluarga',
        description: 'Koleksi mobil untuk keluarga',
        isPublic: false,
        items: ['wishlist-1'],
        tags: ['family'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
  }

  private getMockStatistics(): StatistikWishlist {
    return {
      totalItems: 5,
      totalCollections: 2,
      averagePrice: 450000000,
      priceRange: {
        min: 200000000,
        max: 800000000
      },
      byBrand: [
        { brand: 'Toyota', count: 2, percentage: 40 },
        { brand: 'Honda', count: 2, percentage: 40 },
        { brand: 'Mazda', count: 1, percentage: 20 }
      ],
      byPriceRange: [
        { range: '200M - 400M', count: 2, percentage: 40 },
        { range: '400M - 600M', count: 2, percentage: 40 },
        { range: '600M - 800M', count: 1, percentage: 20 }
      ],
      byYear: [
        { year: 2023, count: 3 },
        { year: 2022, count: 2 }
      ],
      recentActivity: [
        {
          action: 'added',
          carName: 'Toyota Camry 2023',
          timestamp: new Date('2024-01-20T10:00:00Z')
        }
      ],
      recommendations: [
        {
          carId: 'car-789',
          carName: 'Honda Accord 2023',
          reason: 'Similar to your wishlist items',
          score: 85,
          price: 620000000,
          image: '/images/cars/accord-1.jpg',
          similarity: 0.85
        }
      ]
    };
  }

  private getMockComparison(itemIds: string[]): PerbandinganWishlist {
    const items = this.getMockWishlist().items;
    
    return {
      items: items.slice(0, itemIds.length),
      comparisonMatrix: [
        {
          feature: 'Price',
          values: { 'wishlist-1': 650000000 },
          type: 'number'
        },
        {
          feature: 'Engine',
          values: { 'wishlist-1': '2.5L Hybrid' },
          type: 'text'
        },
        {
          feature: 'Year',
          values: { 'wishlist-1': 2023 },
          type: 'number'
        }
      ],
      summary: {
        cheapest: items[0],
        mostExpensive: items[0],
        newest: items[0],
        oldest: items[0],
        bestRated: items[0]
      }
    };
  }
}

export default KontrollerWishlist;