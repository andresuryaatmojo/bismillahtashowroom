import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data mobil
export interface Mobil {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: 'new' | 'used';
  transmission: 'manual' | 'automatic' | 'cvt';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage?: number;
  color: string;
  images: string[];
  description: string;
  features: string[];
  specifications: {
    engine: string;
    power: string;
    torque: string;
    fuelCapacity: string;
    seatingCapacity: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      wheelbase: number;
    };
  };
  location: {
    city: string;
    province: string;
    address?: string;
  };
  seller: {
    id: string;
    name: string;
    type: 'individual' | 'dealer';
    rating: number;
    totalSales: number;
    verified: boolean;
  };
  status: 'available' | 'sold' | 'reserved' | 'pending';
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk filter katalog
export interface KatalogFilter {
  brand?: string[];
  model?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: ('new' | 'used')[];
  transmission?: ('manual' | 'automatic' | 'cvt')[];
  fuelType?: ('gasoline' | 'diesel' | 'electric' | 'hybrid')[];
  location?: string[];
  sellerType?: ('individual' | 'dealer')[];
}

// Interface untuk sorting
export interface KatalogSort {
  field: 'price' | 'year' | 'mileage' | 'createdAt' | 'views' | 'favorites';
  order: 'asc' | 'desc';
}

// Interface untuk pagination
export interface KatalogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface untuk response katalog
export interface KatalogResponse {
  success: boolean;
  message: string;
  data: {
    cars: Mobil[];
    pagination: KatalogPagination;
    filters: {
      availableBrands: string[];
      availableModels: string[];
      priceRange: { min: number; max: number };
      yearRange: { min: number; max: number };
      availableLocations: string[];
    };
  };
}

// Interface untuk detail mobil response
export interface DetailMobilResponse {
  success: boolean;
  message: string;
  data: {
    car: Mobil;
    relatedCars: Mobil[];
    sellerInfo: {
      totalCars: number;
      averageRating: number;
      responseTime: string;
      joinDate: Date;
    };
  };
}

class KontrollerKatalog {
  private static instance: KontrollerKatalog;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerKatalog {
    if (!KontrollerKatalog.instance) {
      KontrollerKatalog.instance = new KontrollerKatalog();
    }
    return KontrollerKatalog.instance;
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

  // Muat katalog mobil dengan filter, sorting, dan pagination
  public async muatKatalogMobil(
    filter?: KatalogFilter,
    sort?: KatalogSort,
    pagination?: { page: number; limit: number },
    search?: string
  ): Promise<KatalogResponse | null> {
    try {
      const cacheKey = this.getCacheKey('katalog', { filter, sort, pagination, search });
      
      // Check cache first
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const params = new URLSearchParams();
      
      // Add pagination
      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
      }

      // Add search
      if (search) {
        params.append('search', search);
      }

      // Add filters
      if (filter) {
        if (filter.brand?.length) {
          params.append('brand', filter.brand.join(','));
        }
        if (filter.model?.length) {
          params.append('model', filter.model.join(','));
        }
        if (filter.yearMin) {
          params.append('yearMin', filter.yearMin.toString());
        }
        if (filter.yearMax) {
          params.append('yearMax', filter.yearMax.toString());
        }
        if (filter.priceMin) {
          params.append('priceMin', filter.priceMin.toString());
        }
        if (filter.priceMax) {
          params.append('priceMax', filter.priceMax.toString());
        }
        if (filter.condition?.length) {
          params.append('condition', filter.condition.join(','));
        }
        if (filter.transmission?.length) {
          params.append('transmission', filter.transmission.join(','));
        }
        if (filter.fuelType?.length) {
          params.append('fuelType', filter.fuelType.join(','));
        }
        if (filter.location?.length) {
          params.append('location', filter.location.join(','));
        }
        if (filter.sellerType?.length) {
          params.append('sellerType', filter.sellerType.join(','));
        }
      }

      // Add sorting
      if (sort) {
        params.append('sortBy', sort.field);
        params.append('sortOrder', sort.order);
      }

      const response = await axios.get(`${API_BASE_URL}/cars?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Cache the result
        this.setCache(cacheKey, response.data, 5);
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Muat katalog mobil error:', error);
      
      // Return mock data for development
      return this.getMockKatalogData(filter, sort, pagination, search);
    }
  }

  // Muat detail mobil berdasarkan ID
  public async muatDetailMobil(idMobil: string): Promise<DetailMobilResponse | null> {
    try {
      const cacheKey = this.getCacheKey('detail', { idMobil });
      
      // Check cache first
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/cars/${idMobil}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Cache the result
        this.setCache(cacheKey, response.data, 10);
        
        // Track view
        this.trackCarView(idMobil);
        
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Muat detail mobil error:', error);
      
      // Return mock data for development
      return this.getMockDetailMobil(idMobil);
    }
  }

  // Track car view
  private async trackCarView(idMobil: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/cars/${idMobil}/view`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Track car view error:', error);
    }
  }

  // Get popular cars
  public async getPopularCars(limit: number = 10): Promise<Mobil[]> {
    try {
      const cacheKey = this.getCacheKey('popular', { limit });
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/cars/popular?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 15);
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get popular cars error:', error);
      return this.getMockPopularCars(limit);
    }
  }

  // Get featured cars
  public async getFeaturedCars(limit: number = 6): Promise<Mobil[]> {
    try {
      const cacheKey = this.getCacheKey('featured', { limit });
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/cars/featured?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 15);
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get featured cars error:', error);
      return this.getMockFeaturedCars(limit);
    }
  }

  // Get car brands
  public async getCarBrands(): Promise<string[]> {
    try {
      const cacheKey = 'brands';
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/cars/brands`);

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 60); // Cache for 1 hour
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get car brands error:', error);
      return this.getMockBrands();
    }
  }

  // Get car models by brand
  public async getCarModels(brand: string): Promise<string[]> {
    try {
      const cacheKey = this.getCacheKey('models', { brand });
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/cars/models?brand=${brand}`);

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 30);
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get car models error:', error);
      return this.getMockModels(brand);
    }
  }

  // Add to favorites
  public async addToFavorites(idMobil: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to add favorites');
      }

      const response = await axios.post(`${API_BASE_URL}/cars/${idMobil}/favorite`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Add to favorites error:', error);
      return false;
    }
  }

  // Remove from favorites
  public async removeFromFavorites(idMobil: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to remove favorites');
      }

      const response = await axios.delete(`${API_BASE_URL}/cars/${idMobil}/favorite`, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Remove from favorites error:', error);
      return false;
    }
  }

  // Get user favorites
  public async getUserFavorites(): Promise<Mobil[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/cars/favorites`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get user favorites error:', error);
      return [];
    }
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
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

  // Format number
  public formatNumber(number: number): string {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  // Get mock data for development
  private getMockKatalogData(
    filter?: KatalogFilter,
    sort?: KatalogSort,
    pagination?: { page: number; limit: number },
    search?: string
  ): KatalogResponse {
    const mockCars: Mobil[] = [
      {
        id: '1',
        brand: 'Toyota',
        model: 'Avanza',
        year: 2023,
        price: 250000000,
        condition: 'new',
        transmission: 'manual',
        fuelType: 'gasoline',
        color: 'Silver',
        images: ['/images/cars/avanza-1.jpg', '/images/cars/avanza-2.jpg'],
        description: 'Toyota Avanza 2023 kondisi baru, sangat terawat',
        features: ['AC', 'Power Steering', 'Central Lock', 'Electric Mirror'],
        specifications: {
          engine: '1.3L DOHC',
          power: '96 HP',
          torque: '121 Nm',
          fuelCapacity: '45L',
          seatingCapacity: 7,
          dimensions: {
            length: 4395,
            width: 1730,
            height: 1700,
            wheelbase: 2750
          }
        },
        location: {
          city: 'Jakarta',
          province: 'DKI Jakarta'
        },
        seller: {
          id: 'seller1',
          name: 'Toyota Dealer Jakarta',
          type: 'dealer',
          rating: 4.8,
          totalSales: 150,
          verified: true
        },
        status: 'available',
        views: 156,
        favorites: 23,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 450000000,
        condition: 'used',
        transmission: 'automatic',
        fuelType: 'gasoline',
        mileage: 15000,
        color: 'White',
        images: ['/images/cars/civic-1.jpg', '/images/cars/civic-2.jpg'],
        description: 'Honda Civic 2022 bekas berkualitas, service record lengkap',
        features: ['AC', 'Power Steering', 'ABS', 'Airbag', 'Sunroof'],
        specifications: {
          engine: '1.5L Turbo',
          power: '182 HP',
          torque: '240 Nm',
          fuelCapacity: '47L',
          seatingCapacity: 5,
          dimensions: {
            length: 4648,
            width: 1800,
            height: 1416,
            wheelbase: 2735
          }
        },
        location: {
          city: 'Surabaya',
          province: 'Jawa Timur'
        },
        seller: {
          id: 'seller2',
          name: 'Ahmad Wijaya',
          type: 'individual',
          rating: 4.5,
          totalSales: 3,
          verified: true
        },
        status: 'available',
        views: 89,
        favorites: 15,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];

    return {
      success: true,
      message: 'Katalog mobil berhasil dimuat',
      data: {
        cars: mockCars,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 10,
          total: 50,
          totalPages: 5
        },
        filters: {
          availableBrands: ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Daihatsu'],
          availableModels: ['Avanza', 'Civic', 'Pajero', 'Ertiga', 'Xenia'],
          priceRange: { min: 100000000, max: 1000000000 },
          yearRange: { min: 2015, max: 2024 },
          availableLocations: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar']
        }
      }
    };
  }

  private getMockDetailMobil(idMobil: string): DetailMobilResponse {
    const mockCar: Mobil = {
      id: idMobil,
      brand: 'Toyota',
      model: 'Avanza',
      year: 2023,
      price: 250000000,
      condition: 'new',
      transmission: 'manual',
      fuelType: 'gasoline',
      color: 'Silver',
      images: [
        '/images/cars/avanza-1.jpg',
        '/images/cars/avanza-2.jpg',
        '/images/cars/avanza-3.jpg',
        '/images/cars/avanza-4.jpg'
      ],
      description: 'Toyota Avanza 2023 kondisi baru, sangat terawat. Mobil keluarga yang nyaman dan irit bahan bakar.',
      features: [
        'AC Double Blower',
        'Power Steering',
        'Central Lock',
        'Electric Mirror',
        'Audio System',
        'USB Port',
        'Dual Airbag'
      ],
      specifications: {
        engine: '1.3L DOHC VVT-i',
        power: '96 HP @ 6000 rpm',
        torque: '121 Nm @ 4200 rpm',
        fuelCapacity: '45L',
        seatingCapacity: 7,
        dimensions: {
          length: 4395,
          width: 1730,
          height: 1700,
          wheelbase: 2750
        }
      },
      location: {
        city: 'Jakarta',
        province: 'DKI Jakarta',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat'
      },
      seller: {
        id: 'seller1',
        name: 'Toyota Dealer Jakarta',
        type: 'dealer',
        rating: 4.8,
        totalSales: 150,
        verified: true
      },
      status: 'available',
      views: 156,
      favorites: 23,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    };

    return {
      success: true,
      message: 'Detail mobil berhasil dimuat',
      data: {
        car: mockCar,
        relatedCars: [],
        sellerInfo: {
          totalCars: 25,
          averageRating: 4.8,
          responseTime: '< 1 jam',
          joinDate: new Date('2020-01-01')
        }
      }
    };
  }

  private getMockPopularCars(limit: number): Mobil[] {
    return [
      {
        id: '1',
        brand: 'Toyota',
        model: 'Avanza',
        year: 2023,
        price: 250000000,
        condition: 'new' as const,
        transmission: 'manual' as const,
        fuelType: 'gasoline' as const,
        color: 'Silver',
        images: ['/images/cars/avanza-1.jpg'],
        description: 'Toyota Avanza 2023',
        features: [],
        specifications: {
          engine: '1.3L',
          power: '96 HP',
          torque: '121 Nm',
          fuelCapacity: '45L',
          seatingCapacity: 7,
          dimensions: { length: 4395, width: 1730, height: 1700, wheelbase: 2750 }
        },
        location: { city: 'Jakarta', province: 'DKI Jakarta' },
        seller: {
          id: 'seller1',
          name: 'Toyota Dealer',
          type: 'dealer' as const,
          rating: 4.8,
          totalSales: 150,
          verified: true
        },
        status: 'available' as const,
        views: 156,
        favorites: 23,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ].slice(0, limit);
  }

  private getMockFeaturedCars(limit: number): Mobil[] {
    return this.getMockPopularCars(limit);
  }

  private getMockBrands(): string[] {
    return ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Daihatsu', 'Nissan', 'Mazda', 'Hyundai', 'KIA', 'BMW', 'Mercedes-Benz', 'Audi'];
  }

  private getMockModels(brand: string): string[] {
    const modelsByBrand: { [key: string]: string[] } = {
      'Toyota': ['Avanza', 'Innova', 'Fortuner', 'Camry', 'Corolla', 'Yaris', 'Vios', 'Rush'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'City', 'Mobilio', 'Pilot'],
      'Mitsubishi': ['Pajero', 'Outlander', 'Xpander', 'Mirage', 'Eclipse Cross', 'Triton'],
      'Suzuki': ['Ertiga', 'Swift', 'Baleno', 'Ignis', 'Jimny', 'SX4', 'Vitara'],
      'Daihatsu': ['Xenia', 'Terios', 'Ayla', 'Sigra', 'Gran Max', 'Luxio']
    };

    return modelsByBrand[brand] || [];
  }
}

export default KontrollerKatalog;