import { supabase } from '../lib/supabase';
import {
  Car,
  CarWithDetails,
  CarOption,
  CarSearchFilters,
  CarStats
} from '../types/cars';

// Fetch available cars for credit simulation
export const fetchAvailableCars = async (
  limit: number = 100
): Promise<CarOption[]> => {
  try {
    // First, let's check if there's any data at all
    const { data: allData, error: allError } = await supabase
      .from('cars')
      .select('count')
      .limit(1);

    if (allError) {
      console.error('Error checking total cars:', allError);
    } else {
      console.log('Total cars in database:', allData);
    }

    // Try with minimal filters first
    const { data, error } = await supabase
      .from('cars')
      .select(`
        id,
        title,
        year,
        price,
        location_city,
        status,
        moderation_status
      `)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Raw cars data with status:', data); // Debug log

    // If no data with minimal filters, try to debug what statuses exist
    if (!data || data.length === 0) {
      console.log('No data found with minimal query, trying to fetch all cars...');

      const { data: allCarsData, error: allCarsError } = await supabase
        .from('cars')
        .select('id, title, year, price, location_city, status, moderation_status')
        .limit(5);

      if (!allCarsError && allCarsData) {
        console.log('Sample cars from database:', allCarsData);
        console.log('Available statuses:', [...new Set(allCarsData.map(c => c.status))]);
        console.log('Available moderation statuses:', [...new Set(allCarsData.map(c => c.moderation_status))]);
      }
    }

    // Filter client-side to see what we have
    const availableCars = (data || []).filter(car => {
      // For debugging, let's be more flexible
      return true; // Return all cars for now to see what we have
    });

    console.log('Filtered cars:', availableCars); // Debug log

    return availableCars.map((car: any) => ({
      id: car.id,
      title: car.title,
      brand_name: 'Brand', // Placeholder since we're not fetching brands
      model_name: 'Model', // Placeholder since we're not fetching models
      year: car.year,
      price: car.price,
      location_city: car.location_city,
      display_name: `${car.year} ${car.title} - ${car.location_city}`
    }));
  } catch (error) {
    console.error('Error fetching available cars:', error);
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

// Fetch cars with filtering options
export const fetchCars = async (
  filters: CarSearchFilters
): Promise<CarWithDetails[]> => {
  try {
    let query = supabase
      .from('cars')
      .select(`
        *,
        car_brands!cars_brand_id_fkey (
          name
        ),
        car_models!cars_model_id_fkey (
          name
        ),
        car_categories!cars_category_id_fkey (
          name
        ),
        seller:users (
          email,
          full_name,
          phone
        )
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.moderation_status) {
      query = query.eq('moderation_status', filters.moderation_status);
    }
    if (filters.seller_type) {
      query = query.eq('seller_type', filters.seller_type);
    }
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }
    if (filters.brand_id) {
      query = query.eq('brand_id', filters.brand_id);
    }
    if (filters.model_id) {
      query = query.eq('model_id', filters.model_id);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.year_min) {
      query = query.gte('year', filters.year_min);
    }
    if (filters.year_max) {
      query = query.lte('year', filters.year_max);
    }
    if (filters.price_min) {
      query = query.gte('price', filters.price_min);
    }
    if (filters.price_max) {
      query = query.lte('price', filters.price_max);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    if (filters.fuel_type) {
      query = query.eq('fuel_type', filters.fuel_type);
    }
    if (filters.location_city) {
      query = query.ilike('location_city', `%${filters.location_city}%`);
    }
    if (filters.search) {
      query = query.or(`
        title.ilike.%${filters.search}%,
        description.ilike.%${filters.search}%
      `);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'posted_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    } else {
      query = query.limit(filters.limit || 20);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
};

// Fetch car by ID
export const fetchCarById = async (
  id: string
): Promise<CarWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        car_brands!cars_brand_id_fkey (
          name
        ),
        car_models!cars_model_id_fkey (
          name
        ),
        car_categories!cars_category_id_fkey (
          name
        ),
        seller:users (
          email,
          full_name,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
};

// Search cars for simulation dropdown
export const searchCarsForSimulation = async (
  search: string,
  limit: number = 20
): Promise<CarOption[]> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select(`
        id,
        title,
        year,
        price,
        location_city
      `)
      .eq('status', 'available')
      .eq('moderation_status', 'approved')
      .or(`
        title.ilike.%${search}%
      `)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }

    console.log('Search results:', data); // Debug log

    return (data || []).map((car: any) => ({
      id: car.id,
      title: car.title,
      brand_name: 'Brand',
      model_name: 'Model',
      year: car.year,
      price: car.price,
      location_city: car.location_city,
      display_name: `${car.year} ${car.title} - ${car.location_city}`
    }));
  } catch (error) {
    console.error('Error searching cars for simulation:', error);
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

// Get car statistics
export const getCarStats = async (
  filters?: {
    status?: Car['status'];
    seller_type?: Car['seller_type'];
    location_city?: string;
  }
): Promise<CarStats> => {
  try {
    let query = supabase
      .from('cars')
      .select(`
        price,
        year,
        status,
        car_brands!cars_brand_id_fkey (
          name
        )
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.seller_type) {
      query = query.eq('seller_type', filters.seller_type);
    }
    if (filters?.location_city) {
      query = query.eq('location_city', filters.location_city);
    }

    const { data, error } = await query;

    if (error) throw error;

    const cars = data || [];
    const totalCars = cars.length;
    const availableCars = cars.filter(c => c.status === 'available').length;
    const soldCars = cars.filter(c => c.status === 'sold').length;

    const averagePrice = totalCars > 0
      ? cars.reduce((sum, car) => sum + car.price, 0) / totalCars
      : 0;

    const averageYear = totalCars > 0
      ? cars.reduce((sum, car) => sum + car.year, 0) / totalCars
      : 0;

    // Find most common brand
    const brandCounts: Record<string, number> = {};
    cars.forEach(car => {
      const brand = car.car_brands as any;
      if (brand?.name) {
        brandCounts[brand.name] = (brandCounts[brand.name] || 0) + 1;
      }
    });

    const mostCommonBrand = Object.keys(brandCounts).length > 0
      ? Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      total_cars: totalCars,
      available_cars: availableCars,
      sold_cars: soldCars,
      average_price: averagePrice,
      most_common_brand: mostCommonBrand,
      average_year: averageYear
    };
  } catch (error) {
    console.error('Error getting car stats:', error);
    throw error;
  }
};

// Update car status
export const updateCarStatus = async (
  id: string,
  status: Car['status']
): Promise<Car> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating car status:', error);
    throw error;
  }
};

// Increment car view count
export const incrementCarViewCount = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_car_views', {
      car_id: id
    });

    if (error) {
      // Fallback to manual update if RPC doesn't exist
      await supabase
        .from('cars')
        .update({
          view_count: supabase.rpc('view_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }
  } catch (error) {
    console.error('Error incrementing car view count:', error);
    // Don't throw error to avoid breaking UI
  }
};