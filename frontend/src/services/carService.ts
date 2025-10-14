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
  
      // Query sederhana dulu - tanpa join kompleks
      let query = supabase
        .from('cars')
        .select('*', { count: 'exact' })
        .eq('status', 'available');
  
      // Apply sorting
      if (sort_by === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort_by === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
  
      // Pagination
      query = query.range(offset, offset + limit - 1);
  
      const { data, error, count } = await query;
  
      if (error) throw error;
  
      // Fetch relations separately untuk setiap car
      const carsWithRelations = await Promise.all(
        (data || []).map(async (car) => {
          const [brand, model, category, images] = await Promise.all([
            supabase.from('car_brands').select('*').eq('id', car.brand_id).single(),
            supabase.from('car_models').select('*').eq('id', car.model_id).single(),
            supabase.from('car_categories').select('*').eq('id', car.category_id).single(),
            supabase.from('car_images').select('*').eq('car_id', car.id).order('display_order')
          ]);
  
          return {
            ...car,
            car_brands: brand.data || {},
            car_models: model.data || {},
            car_categories: category.data || {},
            car_images: images.data || [],
            users: { id: car.seller_id, username: '', full_name: 'Seller', seller_rating: 0 }
          };
        })
      );
  
      return {
        data: carsWithRelations,
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getCars:', error);
      return { data: [], total: 0, page: 1, limit: 20, total_pages: 0 };
    }
  }

  /**
   * Get car by ID dengan semua relasi
   */
  async getCarById(carId: string): Promise<CarWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (
            id,
            name,
            logo_url,
            country
          ),
          car_models (
            id,
            name,
            brand_id
          ),
          car_categories (
            id,
            name,
            slug
          ),
          car_images (
            id,
            image_url,
            is_primary,
            display_order,
            caption
          ),
          car_specifications (
            *
          ),
          users (
            id,
            username,
            full_name,
            seller_rating,
            seller_type,
            phone_number,
            city
          )
        `)
        .eq('id', carId)
        .single();

      if (error) {
        console.error('Error fetching car by ID:', error);
        throw error;
      }

      // Increment view count
      if (data) {
        await this.incrementViewCount(carId);
      }

      return data;
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