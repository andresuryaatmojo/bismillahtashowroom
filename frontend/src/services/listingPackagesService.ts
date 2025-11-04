import { supabase } from '../lib/supabase';
import {
  ListingPackage,
  ListingPackageWithStats,
  CreateListingPackageRequest,
  UpdateListingPackageRequest,
  ListingPackageFilters,
  ListingPackageStats,
  PackageUsageAnalytics
} from '../types/listing-packages';

class ListingPackagesService {
  private static instance: ListingPackagesService;

  private constructor() {}

  public static getInstance(): ListingPackagesService {
    if (!ListingPackagesService.instance) {
      ListingPackagesService.instance = new ListingPackagesService();
    }
    return ListingPackagesService.instance;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Get all listing packages with optional filters
   */
  async getListingPackages(filters?: ListingPackageFilters): Promise<{ data: ListingPackage[] | null; error: any }> {
    try {
      let query = supabase
        .from('listing_packages')
        .select('*')
        .order('display_order', { ascending: true });

      // Apply filters
      if (filters) {
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters.is_highlighted !== undefined) {
          query = query.eq('is_highlighted', filters.is_highlighted);
        }
        if (filters.min_price !== undefined) {
          query = query.gte('price', filters.min_price);
        }
        if (filters.max_price !== undefined) {
          query = query.lte('price', filters.max_price);
        }
        if (filters.min_duration !== undefined) {
          query = query.gte('duration_days', filters.min_duration);
        }
        if (filters.max_duration !== undefined) {
          query = query.lte('duration_days', filters.max_duration);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.sort_by) {
          const ascending = filters.sort_order !== 'desc';
          query = query.order(filters.sort_by, { ascending });
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching listing packages:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in getListingPackages:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single listing package by ID
   */
  async getListingPackageById(id: number): Promise<{ data: ListingPackage | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching listing package:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in getListingPackageById:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a listing package by slug
   */
  async getListingPackageBySlug(slug: string): Promise<{ data: ListingPackage | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching listing package by slug:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in getListingPackageBySlug:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new listing package
   */
  async createListingPackage(packageData: CreateListingPackageRequest): Promise<{ data: ListingPackage | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .insert([{
          ...packageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating listing package:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in createListingPackage:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing listing package
   */
  async updateListingPackage(packageData: UpdateListingPackageRequest): Promise<{ data: ListingPackage | null; error: any }> {
    try {
      const { id, ...updateData } = packageData;

      const { data, error } = await supabase
        .from('listing_packages')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating listing package:', error);
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'Paket tidak ditemukan' } };
        }
        return { data: null, error: { message: error.message || 'Gagal memperbarui paket' } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in updateListingPackage:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a listing package
   */
  async deleteListingPackage(id: number): Promise<{ success: boolean; error: any }> {
    try {
      // Check if package is being used by any active listings
      const { data: activeListings, error: checkError } = await supabase
        .from('cars')
        .select('id')
        .eq('package_id', id)
        .in('status', ['available', 'pending']);

      if (checkError) {
        console.error('Error checking active listings:', checkError);
        return { success: false, error: checkError };
      }

      if (activeListings && activeListings.length > 0) {
        return {
          success: false,
          error: { message: 'Cannot delete package: It is being used by active listings' }
        };
      }

      const { error } = await supabase
        .from('listing_packages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing package:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error in deleteListingPackage:', error);
      return { success: false, error };
    }
  }

  /**
   * Toggle package active status
   */
  async togglePackageStatus(id: number, isActive: boolean): Promise<{ data: ListingPackage | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling package status:', error);
        return { data: null, error: { message: error.message || 'Failed to update package status' } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in togglePackageStatus:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  // ==================== ANALYTICS AND STATISTICS ====================

  /**
   * Get listing package statistics
   */
  async getListingPackageStats(): Promise<{ data: ListingPackageStats | null; error: any }> {
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('listing_packages')
        .select('*');

      if (packagesError) {
        return { data: null, error: packagesError };
      }

      const { data: listings, error: listingsError } = await supabase
        .from('cars')
        .select('package_id, price, status')
        .not('package_id', 'is', null);

      if (listingsError) {
        return { data: null, error: listingsError };
      }

      const activePackages = packages?.filter(p => p.is_active) || [];
      const featuredPackages = packages?.filter(p => p.is_featured) || [];
      const activeListings = listings?.filter(l => l.status === 'available') || [];

      const totalRevenue = listings?.reduce((sum, listing) => sum + (listing.price || 0), 0) || 0;
      const averagePrice = packages && packages.length > 0
        ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length
        : 0;

      const packageUsage = listings?.reduce((acc, listing) => {
        if (listing.package_id) {
          acc[listing.package_id] = (acc[listing.package_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>) || {};

      const mostPopularPackageId = Object.entries(packageUsage)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      const mostPopularPackage = mostPopularPackageId
        ? packages?.find(p => p.id === parseInt(mostPopularPackageId))?.name || null
        : null;

      const stats: ListingPackageStats = {
        total_packages: packages?.length || 0,
        active_packages: activePackages.length,
        featured_packages: featuredPackages.length,
        average_price: Math.round(averagePrice),
        most_popular_package: mostPopularPackage,
        total_revenue: totalRevenue,
        active_listings: activeListings.length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Unexpected error in getListingPackageStats:', error);
      return { data: null, error };
    }
  }

  /**
   * Get package usage analytics
   */
  async getPackageUsageAnalytics(): Promise<{ data: PackageUsageAnalytics[] | null; error: any }> {
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('listing_packages')
        .select('*')
        .order('name');

      if (packagesError) {
        return { data: null, error: packagesError };
      }

      const analytics: PackageUsageAnalytics[] = [];

      for (const pkg of packages || []) {
        const { data: listings, error: listingsError } = await supabase
          .from('cars')
          .select('id, price, status, created_at, listing_start_date, listing_end_date')
          .eq('package_id', pkg.id);

        if (listingsError) {
          console.error(`Error fetching listings for package ${pkg.id}:`, listingsError);
          continue;
        }

        const currentUsage = listings?.filter(l => l.status === 'available').length || 0;
        const totalUsage = listings?.length || 0;

        // Calculate revenue (mock calculation - in real implementation, this would come from payments table)
        const revenueThisMonth = listings?.filter(l => {
          const listingDate = new Date(l.created_at);
          const now = new Date();
          return listingDate.getMonth() === now.getMonth() &&
                 listingDate.getFullYear() === now.getFullYear();
        }).reduce((sum, l) => sum + pkg.price, 0) || 0;

        const revenueTotal = totalUsage * pkg.price;

        // Calculate usage trend (mock calculation)
        const recentListings = listings?.filter(l => {
          const listingDate = new Date(l.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return listingDate >= thirtyDaysAgo;
        }).length || 0;

        const olderListings = totalUsage - recentListings;
        const usageTrend = recentListings > olderListings ? 'increasing' :
                          recentListings < olderListings ? 'decreasing' : 'stable';

        // Calculate conversion rate (mock calculation)
        const conversionRate = totalUsage > 0 ? (currentUsage / totalUsage) * 100 : 0;

        analytics.push({
          package_id: pkg.id,
          package_name: pkg.name,
          current_usage: currentUsage,
          total_usage: totalUsage,
          revenue_this_month: revenueThisMonth,
          revenue_total: revenueTotal,
          usage_trend: usageTrend as 'increasing' | 'decreasing' | 'stable',
          conversion_rate: Math.round(conversionRate * 100) / 100,
          average_duration_before_renewal: pkg.duration_days
        });
      }

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Unexpected error in getPackageUsageAnalytics:', error);
      return { data: null, error };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate unique slug for package name
   */
  async generateUniqueSlug(name: string): Promise<string> {
    try {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const { data, error } = await supabase
          .from('listing_packages')
          .select('slug')
          .eq('slug', slug)
          .single();

        if (error && error.code === 'PGRST116') {
          // No existing record found, slug is unique
          break;
        }

        if (error) {
          console.error('Error checking slug uniqueness:', error);
          return baseSlug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return slug;
    } catch (error) {
      console.error('Unexpected error in generateUniqueSlug:', error);
      return name.toLowerCase().replace(/\s+/g, '-');
    }
  }

  /**
   * Validate package data before saving
   */
  validatePackageData(packageData: CreateListingPackageRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!packageData.name || packageData.name.trim().length < 3) {
      errors.push('Nama paket harus minimal 3 karakter');
    }

    if (!packageData.slug || packageData.slug.trim().length < 3) {
      errors.push('Slug paket harus minimal 3 karakter');
    }

    if (packageData.price === null || packageData.price === undefined || packageData.price < 0) {
      errors.push('Harga harus berupa angka non-negatif (0 atau lebih)');
    }

    if (!packageData.duration_days || packageData.duration_days < 1) {
      errors.push('Durasi harus minimal 1 hari');
    }

    if (packageData.max_photos !== undefined && packageData.max_photos < 1) {
      errors.push('Maksimal foto harus minimal 1');
    }

    if (packageData.priority_level !== undefined && packageData.priority_level < 0) {
      errors.push('Tingkat prioritas tidak boleh negatif');
    }

    if (packageData.refresh_count !== undefined && packageData.refresh_count < 0) {
      errors.push('Jumlah refresh tidak boleh negatif');
    }

    if (packageData.display_order !== undefined && packageData.display_order < 0) {
      errors.push('Urutan tampilan tidak boleh negatif');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ListingPackagesService.getInstance();