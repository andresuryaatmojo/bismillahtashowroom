// Types for listing_packages table in Supabase
export interface ListingPackage {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_days: number;
  max_photos: number | null;
  is_featured: boolean | null;
  is_highlighted: boolean | null;
  priority_level: number | null;
  allows_refresh: boolean | null;
  refresh_count: number | null;
  allows_badge: boolean | null;
  badge_text: string | null;
  features: Record<string, any> | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Extended type for UI display
export interface ListingPackageWithStats extends ListingPackage {
  active_listings_count?: number;
  total_listings_count?: number;
  revenue_generated?: number;
  popularity_score?: number;
}

// Type for creating new package
export interface CreateListingPackageRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  duration_days: number;
  max_photos?: number;
  is_featured?: boolean;
  is_highlighted?: boolean;
  priority_level?: number;
  allows_refresh?: boolean;
  refresh_count?: number;
  allows_badge?: boolean;
  badge_text?: string;
  features?: Record<string, any>;
  is_active?: boolean;
  display_order?: number;
}

// Type for updating package
export interface UpdateListingPackageRequest extends Partial<CreateListingPackageRequest> {
  id: number;
}

// Type for package filters
export interface ListingPackageFilters {
  is_active?: boolean;
  is_featured?: boolean;
  is_highlighted?: boolean;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  search?: string;
  sort_by?: 'name' | 'price' | 'duration_days' | 'display_order' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Type for package statistics
export interface ListingPackageStats {
  total_packages: number;
  active_packages: number;
  featured_packages: number;
  average_price: number;
  most_popular_package: string | null;
  total_revenue: number;
  active_listings: number;
}

// Type for package usage analytics
export interface PackageUsageAnalytics {
  package_id: number;
  package_name: string;
  current_usage: number;
  total_usage: number;
  revenue_this_month: number;
  revenue_total: number;
  usage_trend: 'increasing' | 'decreasing' | 'stable';
  conversion_rate: number;
  average_duration_before_renewal: number;
}