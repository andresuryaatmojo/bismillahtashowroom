// reviewService.ts
// Service untuk operasi review dengan Supabase
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================
export interface Review {
  id: string;
  reviewer_id: string;
  car_id: string;
  seller_id: string;
  transaction_id?: string;
  rating_stars: number;
  rating_car_condition?: number;
  rating_seller_service?: number;
  rating_transaction_process?: number;
  review_text?: string;
  pros?: string;
  cons?: string;
  comment?: string;
  is_verified_purchase: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderated_by?: string;
  moderated_at?: string;
  moderation_reason?: string;
  status: 'active' | 'hidden' | 'deleted';
  likes_count: number;
  helpful_count: number;
  review_date: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithRelations extends Review {
  users?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  cars?: {
    id: string;
    title: string;
    brand_id: number;
    model_id: number;
    car_brands?: {
      name: string;
    };
    car_models?: {
      name: string;
    };
  };
}

export interface ReviewFilters {
  car_id?: string;
  seller_id?: string;
  reviewer_id?: string;
  min_rating?: number;
  is_verified_purchase?: boolean;
}

export interface ReviewQueryOptions {
  page?: number;
  limit?: number;
  sort_by?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface ReviewsResponse {
  data: ReviewWithRelations[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  average_rating: number;
}

// ==================== REVIEW SERVICE ====================
class ReviewService {
  /**
   * Fetch approved reviews with filters and pagination
   */
  async getReviews(
    filters: ReviewFilters = {},
    options: ReviewQueryOptions = {}
  ): Promise<ReviewsResponse> {
    try {
      const { page = 1, limit = 10, sort_by = 'newest' } = options;
      const offset = (page - 1) * limit;

      // Base query with joins
      let query = supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_reviewer_id_fkey (
            id,
            username,
            full_name
          ),
          cars!reviews_car_id_fkey (
            id,
            title,
            brand_id,
            model_id,
            car_brands (
              name
            ),
            car_models (
              name
            )
          )
        `, { count: 'exact' })
        .eq('moderation_status', 'approved')
        .eq('status', 'active');

      // Apply filters
      if (filters.car_id) {
        query = query.eq('car_id', filters.car_id);
      }

      if (filters.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }

      if (filters.reviewer_id) {
        query = query.eq('reviewer_id', filters.reviewer_id);
      }

      if (filters.min_rating) {
        query = query.gte('rating_stars', filters.min_rating);
      }

      if (filters.is_verified_purchase !== undefined) {
        query = query.eq('is_verified_purchase', filters.is_verified_purchase);
      }

      // Apply sorting
      switch (sort_by) {
        case 'oldest':
          query = query.order('review_date', { ascending: true });
          break;
        case 'rating_high':
          query = query.order('rating_stars', { ascending: false });
          break;
        case 'rating_low':
          query = query.order('rating_stars', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('review_date', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      // Calculate average rating
      let avgRating = 0;
      if (data && data.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating_stars, 0);
        avgRating = totalRating / data.length;
      }

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      return {
        data: data || [],
        total,
        page,
        limit,
        total_pages,
        average_rating: avgRating
      };
    } catch (error) {
      console.error('Error in getReviews:', error);
      throw error;
    }
  }

  /**
   * Get featured reviews (highly rated, verified purchases)
   */
  async getFeaturedReviews(limit: number = 6): Promise<ReviewWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_reviewer_id_fkey (
            id,
            username,
            full_name
          ),
          cars!reviews_car_id_fkey (
            id,
            title,
            brand_id,
            model_id,
            car_brands (
              name
            ),
            car_models (
              name
            )
          )
        `)
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .eq('is_verified_purchase', true)
        .gte('rating_stars', 4)
        .order('helpful_count', { ascending: false })
        .order('review_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedReviews:', error);
      return [];
    }
  }

  /**
   * Get latest reviews
   */
  async getLatestReviews(limit: number = 10): Promise<ReviewWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_reviewer_id_fkey (
            id,
            username,
            full_name
          ),
          cars!reviews_car_id_fkey (
            id,
            title,
            brand_id,
            model_id,
            car_brands (
              name
            ),
            car_models (
              name
            )
          )
        `)
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .order('review_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching latest reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLatestReviews:', error);
      return [];
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_reviewer_id_fkey (
            id,
            username,
            full_name
          ),
          cars!reviews_car_id_fkey (
            id,
            title,
            brand_id,
            model_id,
            car_brands (
              name
            ),
            car_models (
              name
            )
          )
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        console.error('Error fetching review:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getReviewById:', error);
      return null;
    }
  }

  /**
   * Get average rating for a car
   */
  async getCarAverageRating(carId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating_stars')
        .eq('car_id', carId)
        .eq('moderation_status', 'approved')
        .eq('status', 'active');

      if (error || !data || data.length === 0) {
        return 0;
      }

      const totalRating = data.reduce((sum, review) => sum + review.rating_stars, 0);
      return totalRating / data.length;
    } catch (error) {
      console.error('Error in getCarAverageRating:', error);
      return 0;
    }
  }

  /**
   * Create new review
   */
  async createReview(reviewData: Partial<Review>): Promise<{ success: boolean; data?: Review; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          moderation_status: 'pending',
          status: 'active',
          likes_count: 0,
          helpful_count: 0,
          review_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in createReview:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const reviewService = new ReviewService();
export default reviewService;
