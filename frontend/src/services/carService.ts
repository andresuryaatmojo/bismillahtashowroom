// carService.ts
// Service untuk operasi CRUD mobil dengan Supabase
import { supabase } from '../lib/supabase';

// ==================== INTERACES ====================
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

      // Base query dengan join tables
      let query = supabase
        .from('cars')
        .select(`
          *,
          car_brands!inner (
            id,
            name,
            logo_url,
            country
          ),
          car_models!inner (
            id,
            name,
            brand_id
          ),
          car_categories!inner (
            id,
            name,
            slug
          ),
          car_images (
            id,
            image_url,
            is_primary,
            display_order
          ),
          users!inner (
            id,
            username,
            full_name,
            seller_rating,
            seller_type
          )
        `, { count: 'exact' })
        .eq('status', 'available'); // Only show available cars

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
          query = query.order('posted_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching cars:', error);
        throw error;
      }

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      return {
        data: data || [],
        total,
        page,
        limit,
        total_pages
      };
    } catch (error) {
      console.error('Error in getCars:', error);
      throw error;
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
        supabase.from('car_specifications').select('*').eq('car_id', car.id).maybeSingle(),
        supabase.from('users').select('id, username, full_name, seller_rating, seller_type').eq('id', car.seller_id).single()
      ]);

      // Combine all data
      const result = {
        ...car,
        car_brands: brand.data || null,
        car_models: model.data || null,
        car_categories: category.data || null,
        car_images: images.data || [],
        car_specifications: specs.data || null,
        users: seller.data || null
      };

      return result;
    } catch (error) {
      console.error('Error in getCarById:', error);
      return null;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(carId: string): Promise<void> {
    try {
      await supabase.rpc('increment_view_count', { car_id: carId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Increment contact count
   */
  async incrementContactCount(carId: string): Promise<void> {
    try {
      await supabase.rpc('increment_contact_count', { car_id: carId });
    } catch (error) {
      console.error('Error incrementing contact count:', error);
    }
  }

  /**
   * Get featured cars
   */
  async getFeaturedCars(limit: number = 6): Promise<CarWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url, country),
          car_models (id, name, brand_id),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          users (id, username, full_name, seller_rating, seller_type)
        `)
        .eq('status', 'available')
        .eq('is_featured', true)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured cars:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedCars:', error);
      return [];
    }
  }

  /**
   * Get latest cars
   */
  async getLatestCars(limit: number = 12): Promise<CarWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url, country),
          car_models (id, name, brand_id),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          users (id, username, full_name, seller_rating, seller_type)
        `)
        .eq('status', 'available')
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching latest cars:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLatestCars:', error);
      return [];
    }
  }

  /**
   * Get brands
   */
  async getBrands(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_brands')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching brands:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBrands:', error);
      return [];
    }
  }

  /**
   * Get active brands only (for regular users)
   */
  async getActiveBrands(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active brands:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveBrands:', error);
      return [];
    }
  }

  /**
   * Get models by brand (all models including inactive)
   */
  async getModelsByBrand(brandId: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', brandId)
        .order('name');

      if (error) {
        console.error('Error fetching models:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getModelsByBrand:', error);
      return [];
    }
  }

  /**
   * Get active models by brand (for regular users)
   */
  async getActiveModelsByBrand(brandId: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active models:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveModelsByBrand:', error);
      return [];
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * Get active categories only (for regular users)
   */
  async getActiveCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('car_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveCategories:', error);
      return [];
    }
  }

  /**
   * Get price range for filters
   */
  async getPriceRange(): Promise<{ min: number; max: number }> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('price')
        .eq('status', 'available')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching price range:', error);
        return { min: 0, max: 0 };
      }

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

  // ==================== ADMIN CRUD FUNCTIONS ====================

  /**
   * Create new car (Admin only)
   */
  async createCar(carData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // HAPUS specifications dari carData
      const { specifications, ...cleanCarData } = carData;

      const { data, error } = await supabase
        .from('cars')
        .insert([{
          ...cleanCarData,
          view_count: 0,
          contact_count: 0,
          wishlist_count: 0,
          average_rating: 0,
          total_reviews: 0,
          posted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating car:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in createCar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update car (Admin only)
   */
  async updateCar(carId: string, carData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // HAPUS specifications dari carData
      const { specifications, ...cleanCarData } = carData;

      const { data, error } = await supabase
        .from('cars')
        .update({
          ...cleanCarData,
          updated_at: new Date().toISOString()
        })
        .eq('id', carId)
        .select()
        .single();

      if (error) {
        console.error('Error updating car:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in updateCar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete car (Admin only)
   */
  async deleteCar(carId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete images from storage first
      const { data: images } = await supabase
        .from('car_images')
        .select('image_url')
        .eq('car_id', carId);

      if (images && images.length > 0) {
        for (const img of images) {
          await this.deleteImageFromStorage(img.image_url);
        }
      }

      // Delete car (will cascade delete car_images via FK)
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) {
        console.error('Error deleting car:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteCar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload car image to Supabase Storage
   */
  async uploadCarImage(file: File, carId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${carId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error in uploadCarImage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save car image to database
   */
  async saveCarImageToDb(carId: string, imageUrl: string, isPrimary: boolean = false, displayOrder: number = 0): Promise<{ success: boolean; error?: string }> {
    try {
      // If setting as primary, unset other primary images first
      if (isPrimary) {
        await supabase
          .from('car_images')
          .update({ is_primary: false })
          .eq('car_id', carId);
      }

      const { error } = await supabase
        .from('car_images')
        .insert([{
          car_id: carId,
          image_url: imageUrl,
          is_primary: isPrimary,
          display_order: displayOrder
        }]);

      if (error) {
        console.error('Error saving image to db:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in saveCarImageToDb:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete car image
   */
  async deleteCarImage(imageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get image URL first
      const { data: image } = await supabase
        .from('car_images')
        .select('image_url')
        .eq('id', imageId)
        .single();

      if (image) {
        await this.deleteImageFromStorage(image.image_url);
      }

      // Delete from database
      const { error } = await supabase
        .from('car_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteCarImage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete image from storage
   */
  private async deleteImageFromStorage(imageUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const path = imageUrl.split('/car-images/')[1];
      if (path) {
        await supabase.storage
          .from('car-images')
          .remove([path]);
      }
    } catch (error) {
      console.error('Error deleting from storage:', error);
    }
  }

  /**
   * Get all cars for admin (including all statuses)
   */
  async getAllCarsAdmin(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url),
          car_models (id, name),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          users (id, username, full_name, seller_rating, seller_type)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,brand_id.ilike.%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.year_min) {
        query = query.gte('year', parseInt(filters.year_min));
      }
      if (filters.year_max) {
        query = query.lte('year', parseInt(filters.year_max));
      }
      if (filters.price_min) {
        query = query.gte('price', parseFloat(filters.price_min));
      }
      if (filters.price_max) {
        query = query.lte('price', parseFloat(filters.price_max));
      }
      // PENTING: Filter berdasarkan seller_type
      if (filters.seller_type) {
        query = query.eq('seller_type', filters.seller_type);
      }

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in getAllCarsAdmin:', error);
      return { data: [], total: 0, page: 1, limit: 20, total_pages: 0 };
    }
  }

  /**
   * Upload multiple car images
   */
  async uploadCarImages(carId: string, files: File[]): Promise<{ success: boolean; error?: string }> {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadResult = await this.uploadCarImage(file, carId);
        
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }

        const saveResult = await this.saveCarImageToDb(
          carId, 
          uploadResult.url!, 
          i === 0, // First image is primary
          i
        );

        if (!saveResult.success) {
          return { success: false, error: saveResult.error };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create car specifications
   */
  async createCarSpecifications(carId: string, specifications: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('car_specifications')
        .insert([{
          car_id: carId,
          ...specifications
        }]);

      if (error) {
        console.error('Error creating specifications:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in createCarSpecifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update car specifications
   */
  async updateCarSpecifications(carId: string, specifications: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if specifications exist
      const { data: existing } = await supabase
        .from('car_specifications')
        .select('id')
        .eq('car_id', carId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('car_specifications')
          .update(specifications)
          .eq('car_id', carId);

        if (error) {
          console.error('Error updating specifications:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Create new if not exists
        return await this.createCarSpecifications(carId, specifications);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in updateCarSpecifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find or create brand by name
   */
  async findOrCreateBrand(brandName: string, isAdmin: boolean = false): Promise<number | null> {
      try {
          const name = brandName.trim();
          if (!name) return null;
  
          // Cek brand yang sudah ada (aktif dan nonaktif)
          const { data: existing } = await supabase
              .from('car_brands')
              .select('id, is_active')
              .ilike('name', name)
              .maybeSingle();
  
          if (existing?.id) {
              // Jika brand ada dan aktif, return ID
              if (existing.is_active) {
                  return existing.id;
              }
              
              // Jika brand ada tapi nonaktif, hanya admin yang bisa reaktivasi
              if (isAdmin) {
                  const { error: updateError } = await supabase
                      .from('car_brands')
                      .update({ is_active: true })
                      .eq('id', existing.id);
                  
                  if (updateError) {
                      console.error('Error reactivating brand:', updateError);
                      return null;
                  }
              }
              return existing.id;
          }
  
          // Create new brand - admin membuat dengan is_active=true, user biasa dengan is_active=false
          const { data: newBrand, error } = await supabase
              .from('car_brands')
              .insert([{ name, is_active: isAdmin }])
              .select('id')
              .single();
  
          if (error) {
              console.error('Error creating brand:', error);
              return null;
          }
  
          return newBrand?.id ?? null;
      } catch (error) {
          console.error('Error in findOrCreateBrand:', error);
          return null;
      }
  }

  /**
   * Make slug from string
   */
  private makeSlug(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }

  /**
   * Find or create category by name
   */
  async findOrCreateCategory(categoryName: string, isAdmin: boolean = false): Promise<number | null> {
      try {
          const name = categoryName.trim();
          if (!name) return null;

          // Cek kategori yang sudah ada (aktif dan nonaktif)
          const { data: existing } = await supabase
              .from('car_categories')
              .select('id, is_active')
              .ilike('name', name)
              .maybeSingle();

          if (existing?.id) {
              // Jika kategori ada dan aktif, return ID
              if (existing.is_active) {
                  return existing.id;
              }
              
              // Jika kategori ada tapi nonaktif, hanya admin yang bisa reaktivasi
              if (isAdmin) {
                  const { error: updateError } = await supabase
                      .from('car_categories')
                      .update({ is_active: true })
                      .eq('id', existing.id);
                  
                  if (updateError) {
                      console.error('Error reactivating category:', updateError);
                      return null;
                  }
              }
              return existing.id;
          }

          // Buat slug dari nama kategori
          const slug = this.makeSlug(name);

          // Create new category - admin membuat dengan is_active=true, user biasa dengan is_active=false
          const { data: newCategory, error } = await supabase
              .from('car_categories')
              .insert([{ name, slug, is_active: isAdmin }])
              .select('id')
              .single();

          if (error) {
              console.error('Error creating category:', error);
              return null;
          }

          return newCategory?.id ?? null;
      } catch (error) {
          console.error('Error in findOrCreateCategory:', error);
          return null;
      }
  }

  /**
   * Find or create model by name and brand
   */
  async findOrCreateModel(modelName: string, brandId: number, categoryId?: number, isAdmin: boolean = false): Promise<number | null> {
      try {
          const name = modelName.trim();
          if (!name || !brandId) return null;
  
          // Cek model yang sudah ada (aktif dan nonaktif)
          const { data: existing } = await supabase
              .from('car_models')
              .select('id, is_active')
              .eq('brand_id', brandId)
              .ilike('name', name)
              .maybeSingle();
  
          if (existing?.id) {
              // Jika model ada dan aktif, return ID
              if (existing.is_active) {
                  return existing.id;
              }
              
              // Jika model ada tapi nonaktif, hanya admin yang bisa reaktivasi
              if (isAdmin) {
                  const { error: updateError } = await supabase
                      .from('car_models')
                      .update({ is_active: true })
                      .eq('id', existing.id);
                  
                  if (updateError) {
                      console.error('Error reactivating model:', updateError);
                      return null;
                  }
              }
              return existing.id;
          }
  
          // Create new model - admin membuat dengan is_active=true, user biasa dengan is_active=false
          const { data: newModel, error } = await supabase
              .from('car_models')
              .insert([{ 
                  name, 
                  brand_id: brandId,
                  category_id: categoryId || null,
                  is_active: isAdmin 
              }])
              .select('id')
              .single();
  
          if (error) {
              console.error('Error creating model:', error);
              return null;
          }
  
          return newModel?.id ?? null;
      } catch (error) {
          console.error('Error in findOrCreateModel:', error);
          return null;
      }
  }

  // ===== BRAND MANAGEMENT =====
  async updateBrandName(brandId: number, newName: string): Promise<boolean> {
    try {
      const name = newName.trim();
      if (!brandId || !name) return false;
      const { error } = await supabase
        .from('car_brands')
        .update({ name })
        .eq('id', brandId);
      if (error) { console.error('Error updating brand name:', error); return false; }
      return true;
    } catch (e) { console.error('Error in updateBrandName:', e); return false; }
  }

  async deactivateBrand(brandId: number): Promise<boolean> {
    try {
      if (!brandId) return false;
      const { error } = await supabase
        .from('car_brands')
        .update({ is_active: false })
        .eq('id', brandId);
      if (error) { console.error('Error deactivating brand:', error); return false; }
      return true;
    } catch (e) { console.error('Error in deactivateBrand:', e); return false; }
  }

  async reassignCarsBrand(fromBrandId: number, toBrandId: number): Promise<boolean> {
    try {
      if (!fromBrandId || !toBrandId || fromBrandId === toBrandId) return false;
      const { error } = await supabase
        .from('cars')
        .update({ brand_id: toBrandId })
        .eq('brand_id', fromBrandId);
      if (error) { console.error('Error reassigning cars brand:', error); return false; }
      // Optional: nonaktifkan entri lama setelah reassign
      await this.deactivateBrand(fromBrandId);
      return true;
    } catch (e) { console.error('Error in reassignCarsBrand:', e); return false; }
  }

  // ===== MODEL MANAGEMENT =====
  async updateModelName(modelId: number, newName: string): Promise<boolean> {
    try {
      const name = newName.trim();
      if (!modelId || !name) return false;
      const { error } = await supabase
        .from('car_models')
        .update({ name })
        .eq('id', modelId);
      if (error) { console.error('Error updating model name:', error); return false; }
      return true;
    } catch (e) { console.error('Error in updateModelName:', e); return false; }
  }

  async deactivateModel(modelId: number): Promise<boolean> {
    try {
      if (!modelId) return false;
      const { error } = await supabase
        .from('car_models')
        .update({ is_active: false })
        .eq('id', modelId);
      if (error) { console.error('Error deactivating model:', error); return false; }
      return true;
    } catch (e) { console.error('Error in deactivateModel:', e); return false; }
  }

  async reassignCarsModel(fromModelId: number, toModelId: number): Promise<boolean> {
    try {
      if (!fromModelId || !toModelId || fromModelId === toModelId) return false;
      const { error } = await supabase
        .from('cars')
        .update({ model_id: toModelId })
        .eq('model_id', fromModelId);
      if (error) { console.error('Error reassigning cars model:', error); return false; }
      await this.deactivateModel(fromModelId);
      return true;
    } catch (e) { console.error('Error in reassignCarsModel:', e); return false; }
  }

  // ===== CATEGORY MANAGEMENT =====
  async updateCategoryName(categoryId: number, newName: string): Promise<boolean> {
    try {
      const name = newName.trim();
      if (!categoryId || !name) return false;
      const slug = this.makeSlug(name);
      const { error } = await supabase
        .from('car_categories')
        .update({ name, slug })
        .eq('id', categoryId);
      if (error) { console.error('Error updating category name:', error); return false; }
      return true;
    } catch (e) { console.error('Error in updateCategoryName:', e); return false; }
  }

  async deactivateCategory(categoryId: number): Promise<boolean> {
    try {
      if (!categoryId) return false;
      const { error } = await supabase
        .from('car_categories')
        .update({ is_active: false })
        .eq('id', categoryId);
      if (error) { console.error('Error deactivating category:', error); return false; }
      return true;
    } catch (e) { console.error('Error in deactivateCategory:', e); return false; }
  }

  async reassignCarsCategory(fromCategoryId: number, toCategoryId: number): Promise<boolean> {
    try {
      if (!fromCategoryId || !toCategoryId || fromCategoryId === toCategoryId) return false;
      const { error } = await supabase
        .from('cars')
        .update({ category_id: toCategoryId })
        .eq('category_id', fromCategoryId);
      if (error) { console.error('Error reassigning cars category:', error); return false; }
      await this.deactivateCategory(fromCategoryId);
      return true;
    } catch (e) { console.error('Error in reassignCarsCategory:', e); return false; }
  }

  // Reactivation methods
  async reactivateBrand(brandId: number): Promise<boolean> {
    try {
      if (!brandId) return false;
      const { error } = await supabase
        .from('car_brands')
        .update({ is_active: true })
        .eq('id', brandId);
      if (error) { console.error('Error reactivating brand:', error); return false; }
      return true;
    } catch (e) { console.error('Error in reactivateBrand:', e); return false; }
  }

  async reactivateModel(modelId: number): Promise<boolean> {
    try {
      if (!modelId) return false;
      const { error } = await supabase
        .from('car_models')
        .update({ is_active: true })
        .eq('id', modelId);
      if (error) { console.error('Error reactivating model:', error); return false; }
      return true;
    } catch (e) { console.error('Error in reactivateModel:', e); return false; }
  }

  async reactivateCategory(categoryId: number): Promise<boolean> {
    try {
      if (!categoryId) return false;
      const { error } = await supabase
        .from('car_categories')
        .update({ is_active: true })
        .eq('id', categoryId);
      if (error) { console.error('Error reactivating category:', error); return false; }
      return true;
    } catch (e) { console.error('Error in reactivateCategory:', e); return false; }
  }
}

// Export singleton instance
export const carService = new CarService();
export default carService;