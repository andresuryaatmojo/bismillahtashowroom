// listingService.ts
import { supabase } from '../lib/supabase';

export interface ListingPackage {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  max_photos: number;
  is_featured: boolean;
  is_highlighted: boolean;
  priority_level: number;
  allows_refresh: boolean;
  refresh_count: number;
  allows_badge: boolean;
  badge_text: string | null;
  features: any;
  is_active: boolean;
  display_order: number;
}

export interface ListingPayment {
  id: string;
  car_id: string;
  seller_id: string;
  package_id: number;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'refunded';
  reference_code: string;
  proof_of_payment?: string;
  verified_by?: string;
  verified_at?: string;
  activated_at?: string;
  expires_at?: string;
  notes?: string;
}

class ListingService {
  /**
   * Get all active packages
   */
  async getPackages(): Promise<ListingPackage[]> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      return [];
    }
  }

  /**
   * Get package by ID
   */
  async getPackageById(packageId: number): Promise<ListingPackage | null> {
    try {
      const { data, error } = await supabase
        .from('listing_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching package:', error);
      return null;
    }
  }

  /**
   * Create listing payment
   */
  async createListingPayment(
    carId: string,
    packageId: number,
    sellerId: string,
    paymentMethod: string = 'bank_transfer'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get package info
      const packageData = await this.getPackageById(packageId);
      if (!packageData) {
        return { success: false, error: 'Paket tidak ditemukan' };
      }

      // Generate reference code
      const refCode = `LP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const { data, error } = await supabase
        .from('listing_payments')
        .insert([{
          car_id: carId,
          seller_id: sellerId,
          package_id: packageId,
          amount: packageData.price,
          payment_method: paymentMethod,
          payment_status: packageData.price === 0 ? 'success' : 'pending',
          reference_code: refCode
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        return { success: false, error: error.message };
      }

      // If free package, auto-activate
      if (packageData.price === 0) {
        await this.updateCarPackage(carId, packageId, packageData.duration_days);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in createListingPayment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if storage bucket exists
   */
  async checkPaymentProofsBucket(): Promise<{ exists: boolean; error?: string }> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return { exists: false, error: listError.message };
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'payment-proofs');
      return { exists: bucketExists };
    } catch (error: any) {
      console.error('Error in checkPaymentProofsBucket:', error);
      return { exists: false, error: error.message };
    }
  }

  /**
   * Get payment proof URL with proper error handling
   */
  async getPaymentProofUrl(proofPath: string | null): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!proofPath) {
        return { success: false, error: 'Bukti pembayaran belum diupload' };
      }

      // Extract filename from full URL if needed
      let fileName = proofPath;
      if (proofPath.includes('/payment-proofs/')) {
        fileName = proofPath.split('/payment-proofs/')[1];
      }

      // Get public URL directly - let Supabase handle the bucket existence
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error in getPaymentProofUrl:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(
    paymentId: string,
    file: File,
    userId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Generate filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${paymentId}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading payment proof:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update payment record
      const { error: updateError } = await supabase
        .from('listing_payments')
        .update({
          proof_of_payment: fileName, // Store just the filename, not full URL
          payment_status: 'processing'
        })
        .eq('id', paymentId);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Error in uploadPaymentProof:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update car with package info
   */
  async updateCarPackage(
    carId: string,
    packageId: number,
    durationDays: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const { error } = await supabase
        .from('cars')
        .update({
          package_id: packageId,
          listing_start_date: startDate.toISOString(),
          listing_end_date: endDate.toISOString(),
          status: 'pending' // Admin will approve
        })
        .eq('id', carId);

      if (error) {
        console.error('Error updating car package:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in updateCarPackage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's payments
   */
  async getUserPayments(userId: string): Promise<ListingPayment[]> {
    try {
      const { data, error } = await supabase
        .from('listing_payments')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<ListingPayment | null> {
    try {
      const { data, error } = await supabase
        .from('listing_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  }

  /**
   * Manual refresh listing (called by user)
   */
  async refreshListing(carId: string): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('manual_refresh_listing', {
        car_id_param: carId
      });

      if (error) {
        console.error('Error refreshing listing:', error);
        return { success: false, message: 'Gagal refresh iklan', error: error.message };
      }

      return {
        success: data.success,
        message: data.message,
        data: {
          refresh_count: data.refresh_count,
          total_allowed: data.total_allowed
        }
      };
    } catch (error: any) {
      console.error('Error in refreshListing:', error);
      return { success: false, message: 'Terjadi kesalahan', error: error.message };
    }
  }

  /**
   * Get seller's cars with package info
   */
  async getSellerCars(sellerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url),
          car_models (id, name),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          listing_packages (
            id, name, slug, price, duration_days, 
            is_featured, allows_refresh, refresh_count, badge_text
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching seller cars:', error);
      return [];
    }
  }

  /**
   * Get listing statistics for seller
   */
  async getSellerStatistics(sellerId: string): Promise<any> {
    try {
      const { data: cars, error } = await supabase
        .from('cars')
        .select('status, view_count, contact_count, wishlist_count, package_id')
        .eq('seller_id', sellerId);

      if (error) throw error;

      const stats = {
        total: cars?.length || 0,
        active: cars?.filter(c => c.status === 'available').length || 0,
        pending: cars?.filter(c => c.status === 'pending').length || 0,
        sold: cars?.filter(c => c.status === 'sold').length || 0,
        total_views: cars?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0,
        total_contacts: cars?.reduce((sum, c) => sum + (c.contact_count || 0), 0) || 0,
        total_wishlists: cars?.reduce((sum, c) => sum + (c.wishlist_count || 0), 0) || 0,
        with_package: cars?.filter(c => c.package_id).length || 0,
        free_listings: cars?.filter(c => !c.package_id).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching seller statistics:', error);
      return {
        total: 0, active: 0, pending: 0, sold: 0,
        total_views: 0, total_contacts: 0, total_wishlists: 0,
        with_package: 0, free_listings: 0
      };
    }
  }

  /**
   * Check if user is in seller mode
   */
  async checkSellerMode(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('current_mode')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.current_mode === 'seller';
    } catch (error) {
      console.error('Error checking seller mode:', error);
      return false;
    }
  }

  /**
   * Get all payments (admin)
   */
  async getAllPayments(): Promise<ListingPayment[]> {
      try {
          const { data, error } = await supabase
              .from('listing_payments')
              .select('*')
              .order('created_at', { ascending: false });
  
          if (error) throw error;
          return data || [];
      } catch (error) {
          console.error('Error fetching all payments:', error);
          return [];
      }
  }

  /**
   * Get payments by car ID
   */
  async getPaymentsByCarId(carId: string): Promise<ListingPayment[]> {
      try {
          const { data, error } = await supabase
              .from('listing_payments')
              .select('*')
              .eq('car_id', carId)
              .order('created_at', { ascending: false });
  
          if (error) throw error;
          return data || [];
      } catch (error) {
          console.error('Error fetching payments by car:', error);
          return [];
      }
  }

  /**
   * Update payment status and activate listing package if success
   */
  async updatePaymentStatus(
      paymentId: string,
      status: 'success' | 'failed' | 'processing',
      adminId?: string
  ): Promise<{ success: boolean; error?: string }> {
      try {
          // Update payment status
          const { data: paymentData, error: selErr } = await supabase
              .from('listing_payments')
              .select('*')
              .eq('id', paymentId)
              .single();
  
          if (selErr) {
              console.error('Error selecting payment:', selErr);
              return { success: false, error: selErr.message };
          }
  
          const nowIso = new Date().toISOString();
  
          const { error: updErr } = await supabase
              .from('listing_payments')
              .update({
                  payment_status: status,
                  verified_by: adminId || null,
                  verified_at: status === 'success' ? nowIso : null
              })
              .eq('id', paymentId);
  
          if (updErr) {
              console.error('Error updating payment status:', updErr);
              return { success: false, error: updErr.message };
          }
  
          // If success, activate the package on the car and set activation window
          if (status === 'success') {
              // Get package duration
              const pkg = await this.getPackageById(paymentData.package_id);
              if (!pkg) {
                  return { success: false, error: 'Paket tidak ditemukan saat aktivasi' };
              }
  
              // Activate listing on car
              const startDate = new Date();
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + pkg.duration_days);
  
              // Update car with package
              const { error: carErr } = await supabase
                  .from('cars')
                  .update({
                      package_id: paymentData.package_id,
                      listing_start_date: startDate.toISOString(),
                      listing_end_date: endDate.toISOString(),
                      status: 'pending' // tetap menunggu approve admin
                  })
                  .eq('id', paymentData.car_id);
  
              if (carErr) {
                  console.error('Error activating package on car:', carErr);
                  return { success: false, error: carErr.message };
              }
  
              // Update payment activation window
              const { error: payUpdErr } = await supabase
                  .from('listing_payments')
                  .update({
                      activated_at: startDate.toISOString(),
                      expires_at: endDate.toISOString()
                  })
                  .eq('id', paymentId);
  
              if (payUpdErr) {
                  console.error('Error updating payment activation window:', payUpdErr);
                  return { success: false, error: payUpdErr.message };
              }
          }
  
          return { success: true };
      } catch (error: any) {
          console.error('Error in updatePaymentStatus:', error);
          return { success: false, error: error.message };
      }
  }
}

export const listingService = new ListingService();
export default listingService;