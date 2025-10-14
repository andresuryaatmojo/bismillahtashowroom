// carService.ts
// Service untuk operasi CRUD mobil dengan Supabase
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================
export interface Car {
  id: string;
  seller_id: string;
  brand_id: number;
  model_id: number;
  category_id: number;
  title: string;
  year: number;
  price: number;
  is_negotiable: boolean;
  market_price?: number;
  condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
  color: string;
  mileage: number;
  transmission: 'manual' | 'automatic' | 'cvt' | 'dct' | 'amt';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'phev';
  engine_capacity: number;
  description?: string;
  location_city: string;
  location_province?: string;
  status: 'pending' | 'available' | 'sold' | 'reserved' | 'rejected';
  seller_type: 'showroom' | 'external';
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  contact_count: number;
  wishlist_count: number;
  average_rating: number;
  total_reviews: number;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface CarWithRelations extends Car {
  car_brands: {
    id: number;
    name: string;
    logo_url?: string;
    country?: string;
  };
  car_models: {
    id: number;
    name: string;
    brand_id: number;
  };
  car_categories: {
    id: number;
    name: string;
    slug: string;
  };
  car_images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }>;
  users: {
    id: string;
    username: string;
    full_name: string;
    seller_rating: number;
    seller_type?: string;
  };
}

export interface CarFilters {
  search?: string;
  brand_ids?: number[];
  model_ids?: number[];
  category_ids?: number[];
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  transmission?: string[];
  fuel_type?: string[];
  condition?: string[];
  location_city?: string[];
  seller_type?: 'showroom' | 'external';
  is_featured?: boolean;
}

export interface CarQueryOptions {
  page?: number;
  limit?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'newest' | 'popular' | 'rating';
}

export interface CarsResponse {
  data: CarWithRelations[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==================== CAR SERVICE ====================
class CarService {
  /**
   * Fetch cars dengan filter dan pagination
   */
  async getCars( 
    filters: CarFilters = {}, 
    options: CarQueryOptions = {} 
  ): Promise<CarsResponse> { 
    try { 
      const { page = 1, limit = 20, sort_by = 'newest' } = options; 
      const offset = (page - 1) * limit; 
  
      // Query SEDERHANA tanpa join 
      let query = supabase 
        .from('cars') 
        .select('*', { count: 'exact' }) 
        .eq('status', 'available'); 
  
      // Apply filters 
      if (filters.search) { 
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`); 
      } 
  
      if (filters.brand_ids && filters.brand_ids.length > 0) { 
        query = query.in('brand_id', filters.brand_ids); 
      } 
  
      if (filters.model_ids && filters.model_ids.length > 0) { 
        query = query.in('model_id', filters.model_ids); 
      } 
  
      if (filters.category_ids && filters.category_ids.length > 0) { 
        query = query.in('category_id', filters.category_ids); 
      } 
  
      if (filters.min_price) { 
        query = query.gte('price', filters.min_price); 
      } 
  
      if (filters.max_price) { 
        query = query.lte('price', filters.max_price); 
      } 
  
      if (filters.min_year) { 
        query = query.gte('year', filters.min_year); 
      } 
  
      if (filters.max_year) { 
        query = query.lte('year', filters.max_year); 
      } 
  
      if (filters.transmission && filters.transmission.length > 0) { 
        query = query.in('transmission', filters.transmission); 
      } 
  
      if (filters.fuel_type && filters.fuel_type.length > 0) { 
        query = query.in('fuel_type', filters.fuel_type); 
      } 
  
      if (filters.condition && filters.condition.length > 0) { 
        query = query.in('condition', filters.condition); 
      } 
  
      if (filters.location_city && filters.location_city.length > 0) { 
        query = query.in('location_city', filters.location_city); 
      } 
  
      if (filters.seller_type) { 
        query = query.eq('seller_type', filters.seller_type); 
      } 
  
      if (filters.is_featured) { 
        query = query.eq('is_featured', true); 
      } 
  
      // Apply sorting 
      switch (sort_by) { 
        case 'price_asc': 
          query = query.order('price', { ascending: true }); 
          break; 
        case 'price_desc': 
          query = query.order('price', { ascending: false }); 
          break; 
        case 'year_asc': 
          query = query.order('year', { ascending: true }); 
          break; 
        case 'year_desc': 
          query = query.order('year', { ascending: false }); 
          break; 
        case 'popular': 
          query = query.order('view_count', { ascending: false }); 
          break; 
        case 'rating': 
          query = query.order('average_rating', { ascending: false }); 
          break; 
        case 'newest': 
        default: 
          query = query.order('created_at', { ascending: false }); 
          break; 
      } 
  
      // Pagination 
      query = query.range(offset, offset + limit - 1); 
  
      const { data, error, count } = await query; 
  
      if (error) { 
        console.error('Error fetching cars:', error); 
        throw error; 
      } 
  
      // Fetch relations SEPARATELY untuk setiap car 
      const carsWithRelations = await Promise.all( 
        (data || []).map(async (car) => { 
          const [brand, model, category, images] = await Promise.all([ 
            supabase.from('car_brands').select('id, name, logo_url, country').eq('id', car.brand_id).single(), 
            supabase.from('car_models').select('id, name, brand_id').eq('id', car.model_id).single(), 
            supabase.from('car_categories').select('id, name, slug').eq('id', car.category_id).single(), 
            supabase.from('car_images').select('id, image_url, is_primary, display_order').eq('car_id', car.id).order('display_order') 
          ]); 
  
          return { 
            ...car, 
            car_brands: brand.data || { id: 0, name: 'Unknown', logo_url: null, country: null }, 
            car_models: model.data || { id: 0, name: 'Unknown', brand_id: 0 }, 
            car_categories: category.data || { id: 0, name: 'Unknown', slug: 'unknown' }, 
            car_images: images.data || [], 
            users: { 
              id: car.seller_id, 
              username: '', 
              full_name: 'Seller', 
              seller_rating: 0, 
              seller_type: null 
            } 
          }; 
        }) 
      ); 
  
      const total = count || 0; 
      const total_pages = Math.ceil(total / limit); 
  
      return { 
        data: carsWithRelations, 
        total, 
        page, 
        limit, 
        total_pages 
      }; 
    } catch (error) { 
      console.error('Error in getCars:', error); 
      return { 
        data: [], 
        total: 0, 
        page: 1, 
        limit: 20, 
        total_pages: 0 
      }; 
    } 
  }

  /**
   * Get car by ID dengan semua relasi (LENGKAP untuk detail page)
   */
  async getCarById(carId: string): Promise<any | null> {
    try {
      // Fetch car data with all relations separately to avoid RLS issues
      const { data: car, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (carError || !car) {
        console.error('Error fetching car:', carError);
        return null;
      }

      // Fetch related data in parallel
      const [brand, model, category, images, specs, seller] = await Promise.all([
        supabase.from('car_brands').select('*').eq('id', car.brand_id).single(),
        supabase.from('car_models').select('*').eq('id', car.model_id).single(),
        supabase.from('car_categories').select('*').eq('id', car.category_id).single(),
        supabase.from('car_images').select('*').eq('car_id', car.id).order('display_order'),
        supabase.from('car_specifications').select('*').eq('car_id', car.id).single(),
        supabase.from('users').select('id, username, full_name, seller_rating, seller_type, phone_number, city').eq('id', car.seller_id).single()
      ]);

      // Combine all data
      const carWithDetails = {
        ...car,
        car_brands: brand.data || { id: 0, name: 'Unknown', logo_url: null, country: null },
        car_models: model.data || { id: 0, name: 'Unknown', brand_id: 0 },
        car_categories: category.data || { id: 0, name: 'Unknown', slug: 'unknown' },
        car_images: images.data || [],
        car_specifications: specs.data || null,
        users: seller.data || { 
          id: car.seller_id,
          username: '',
          full_name: 'Seller',
          seller_rating: 0,
          seller_type: null,
          phone_number: null,
          city: null
        }
      };

      // Increment view count (fire and forget)
      this.incrementViewCount(carId).catch(err => 
        console.error('Error incrementing view:', err)
      );

      return carWithDetails;
    } catch (error) {
      console.error('Error in getCarById:', error);
      return null;
    }
  }

  /**
   * Get featured cars (mobil unggulan)
   */
  async getFeaturedCars(limit: number = 8): Promise<CarWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url),
          car_models (id, name),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          users (id, username, full_name, seller_rating)
        `)
        .eq('status', 'available')
        .eq('is_featured', true)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      return [];
    }
  }

  /**
   * Get brands untuk filter
   */
  async getBrands(): Promise<Array<{ id: number; name: string; logo_url?: string }>> {
    try {
      const { data, error } = await supabase
        .from('car_brands')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  }

  /**
   * Get models by brand ID
   */
  async getModelsByBrand(brandId: number): Promise<Array<{ id: number; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('car_models')
        .select('id, name')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  /**
   * Get categories untuk filter
   */
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const { data, error } = await supabase
        .from('car_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Search cars by query
   */
  async searchCars(query: string, limit: number = 10): Promise<CarWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name),
          car_models (id, name),
          car_categories (id, name),
          car_images (id, image_url, is_primary)
        `)
        .eq('status', 'available')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching cars:', error);
      return [];
    }
  }

  /**
   * Increment view count
   */
  private async incrementViewCount(carId: string): Promise<void> {
    try {
      await supabase.rpc('increment_car_views', { car_id: carId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get price statistics untuk filter
   */
  async getPriceRange(): Promise<{ min: number; max: number }> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('price')
        .eq('status', 'available')
        .order('price', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return { min: 0, max: 0 };
      }

      return {
        min: data[0].price,
        max: data[data.length - 1].price
      };
    } catch (error) {
      console.error('Error fetching price range:', error);
      return { min: 0, max: 0 };
    }
  }
}

// Export singleton instance
export const carService = new CarService();
export default carService;