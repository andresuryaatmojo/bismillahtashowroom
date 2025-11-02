// Types for cars table in Supabase
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
  market_price: number | null;
  condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
  color: string;
  mileage: number | null;
  transmission: 'manual' | 'automatic' | 'cvt' | 'dct' | 'amt';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'phev';
  engine_capacity: number | null;
  description: string | null;
  location_city: string;
  location_province: string | null;
  location_address: string | null;
  status: 'pending' | 'available' | 'sold' | 'reserved' | 'rejected';
  seller_type: 'showroom' | 'external';
  is_verified: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderated_by: string | null;
  moderated_at: string | null;
  rejection_reason: string | null;
  is_featured: boolean;
  featured_until: string | null;
  view_count: number;
  contact_count: number;
  wishlist_count: number;
  average_rating: number;
  total_reviews: number;
  posted_at: string;
  sold_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  package_id: number | null;
  listing_start_date: string | null;
  listing_end_date: string | null;
  last_refreshed_at: string | null;
  refresh_count: number;
  total_refreshes_allowed: number;
  seat_capacity: number | null;
  registration_type: string | null;
  registration_date: string | null;
  has_spare_key: boolean;
  has_warranty: boolean;
  has_service_record: boolean;
  stnk_expiry_date: string | null;
  vin_number: string | null;
  rating: number;
}

// Extended type with related data for UI display
export interface CarWithDetails extends Car {
  car_brands?: {
    name: string;
  };
  car_models?: {
    name: string;
  };
  car_categories?: {
    name: string;
  };
  seller?: {
    email: string;
    full_name?: string;
    phone?: string;
  };
}

// Simplified type for dropdown options
export interface CarOption {
  id: string;
  title: string;
  brand_name: string;
  model_name: string;
  year: number;
  price: number;
  location_city: string;
  display_name: string;
}

// Type for car search filters
export interface CarSearchFilters {
  search?: string;
  brand_id?: number;
  model_id?: number;
  category_id?: number;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  condition?: Car['condition'];
  transmission?: Car['transmission'];
  fuel_type?: Car['fuel_type'];
  location_city?: string;
  status?: Car['status'];
  moderation_status?: Car['moderation_status'];
  seller_type?: Car['seller_type'];
  is_verified?: boolean;
  limit?: number;
  offset?: number;
  sort_by?: 'price' | 'year' | 'posted_at' | 'view_count';
  sort_order?: 'asc' | 'desc';
}

// Type for car statistics
export interface CarStats {
  total_cars: number;
  available_cars: number;
  sold_cars: number;
  average_price: number;
  most_common_brand: string | null;
  average_year: number;
}