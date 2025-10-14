// wishlistService.ts
// Service untuk operasi wishlist dengan Supabase
import { supabase } from '../lib/supabase';
import type { CarWithRelations } from './carService';

// ==================== INTERFACES ====================
export interface WishlistItem {
  id: string;
  user_id: string;
  car_id: string;
  notes?: string;
  priority: number;
  is_active: boolean;
  is_notification_enabled: boolean;
  notify_on_price_drop: boolean;
  saved_price: number;
  current_price: number;
  added_at: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItemWithCar extends WishlistItem {
  cars: CarWithRelations;
}

// ==================== WISHLIST SERVICE ====================
class WishlistService {
  /**
   * Get user's wishlist
   */
  async getUserWishlist(userId: string): Promise<WishlistItemWithCar[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          cars (
            *,
            car_brands (id, name, logo_url),
            car_models (id, name),
            car_categories (id, name, slug),
            car_images (id, image_url, is_primary, display_order),
            users (id, username, full_name, seller_rating)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserWishlist:', error);
      return [];
    }
  }

  /**
   * Add car to wishlist
   */
  async addToWishlist(userId: string, carId: string, notes?: string): Promise<boolean> {
    try {
      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('car_id', carId)
        .eq('is_active', true)
        .single();

      if (existing) {
        console.log('Car already in wishlist');
        return false;
      }

      // Get car price for saved_price
      const { data: car } = await supabase
        .from('cars')
        .select('price')
        .eq('id', carId)
        .single();

      if (!car) {
        throw new Error('Car not found');
      }

      // Insert to wishlist
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: userId,
          car_id: carId,
          notes: notes || null,
          priority: 1,
          is_active: true,
          is_notification_enabled: false,
          notify_on_price_drop: false,
          saved_price: car.price,
          current_price: car.price
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in addToWishlist:', error);
      return false;
    }
  }

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(userId: string, carId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('car_id', carId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromWishlist:', error);
      return false;
    }
  }

  /**
   * Check if car is in user's wishlist
   */
  async isInWishlist(userId: string, carId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('car_id', carId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking wishlist:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isInWishlist:', error);
      return false;
    }
  }

  /**
   * Get wishlist count for user
   */
  async getWishlistCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error getting wishlist count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getWishlistCount:', error);
      return 0;
    }
  }

  /**
   * Update wishlist notes
   */
  async updateNotes(userId: string, carId: string, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlists')
        .update({ notes })
        .eq('user_id', userId)
        .eq('car_id', carId);

      if (error) {
        console.error('Error updating notes:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateNotes:', error);
      return false;
    }
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();
export default wishlistService;