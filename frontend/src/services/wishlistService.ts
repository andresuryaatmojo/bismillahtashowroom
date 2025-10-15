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
     console.log('Fetching wishlist for user:', userId);

     // Fetch wishlist items first
     const { data: wishlistItems, error: wishlistError } = await supabase
       .from('wishlists')
       .select('*')
       .eq('user_id', userId)
       .eq('is_active', true)
       .order('added_at', { ascending: false });

     if (wishlistError) {
       console.error('Error fetching wishlist:', wishlistError);
       throw wishlistError;
     }

     console.log('Wishlist items:', wishlistItems);

     if (!wishlistItems || wishlistItems.length === 0) {
       return [];
     }

     // Fetch car details for each wishlist item SEPARATELY
     const itemsWithCars = await Promise.all(
       wishlistItems.map(async (item) => {
         // Fetch car data
         const { data: car } = await supabase
           .from('cars')
           .select('*')
           .eq('id', item.car_id)
           .single();

         if (!car) return null;

         // Fetch related data
         const [brand, model, category, images] = await Promise.all([
           supabase.from('car_brands').select('*').eq('id', car.brand_id).single(),
           supabase.from('car_models').select('*').eq('id', car.model_id).single(),
           supabase.from('car_categories').select('*').eq('id', car.category_id).single(),
           supabase.from('car_images').select('*').eq('car_id', car.id).order('display_order')
         ]);

         return {
           ...item,
           cars: {
             ...car,
             car_brands: brand.data || { id: 0, name: 'Unknown' },
             car_models: model.data || { id: 0, name: 'Unknown' },
             car_categories: category.data || { id: 0, name: 'Unknown' },
             car_images: images.data || []
           }
         };
       })
     );

     // Filter out null items
     const validItems = itemsWithCars.filter(item => item !== null);

     console.log('Items with car details:', validItems);

     return validItems as WishlistItemWithCar[];
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
      console.log('Adding to wishlist:', { userId, carId });

      // Check if already exists (termasuk yang inactive)
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('car_id', carId)
        .maybeSingle();

      // Jika sudah ada dan aktif
      if (existing && existing.is_active) {
        console.log('Car already in active wishlist');
        return false;
      }

      // Jika sudah ada tapi INACTIVE, reaktivasi
      if (existing && !existing.is_active) {
        console.log('Reactivating existing wishlist item');
        
        // Get current car price
        const { data: car } = await supabase
          .from('cars')
          .select('price')
          .eq('id', carId)
          .single();

        const { error: updateError } = await supabase
          .from('wishlists')
          .update({
            is_active: true,
            current_price: car?.price || 0,
            notes: notes || null,
            added_at: new Date().toISOString() // Update waktu ditambahkan
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error reactivating wishlist:', updateError);
          throw updateError;
        }

        return true;
      }

      // Jika belum ada sama sekali, INSERT baru
      console.log('Creating new wishlist item');
      
      const { data: car } = await supabase
        .from('cars')
        .select('price')
        .eq('id', carId)
        .single();

      if (!car) {
        throw new Error('Car not found');
      }

      const { error: insertError } = await supabase
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

      if (insertError) {
        console.error('Error adding to wishlist:', insertError);
        throw insertError;
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