import { supabase } from './supabase';

/**
 * Admin Service - Helper functions untuk operasi admin
 * Fungsi-fungsi ini memastikan operasi admin berjalan dengan benar
 */

export const adminService = {
  /**
   * Update user data (admin only)
   */
  updateUser: async (userId: string, updateData: any) => {
    try {
      console.log('🔄 Admin updating user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();  // ← HAPUS .single()

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ User updated successfully');
      return { data: data?.[0] || null, error: null };  // ← Ambil index 0
    } catch (error: any) {
      console.error('❌ Admin update failed:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete user (admin only - hard delete)
   */
  deleteUser: async (userId: string) => {
    try {
      console.log('🗑️ Admin deleting user:', userId);
      
      // Hard delete dari database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ User deleted successfully');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Admin delete failed:', error);
      return { error };
    }
  },

  /**
   * Update user status (activate/deactivate)
   */
  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      console.log(`🔄 Setting user ${userId} status to: ${status}`);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          account_status: status,
          is_active: status === 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Status updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Status update failed:', error);
      return { data: null, error };
    }
  },

  /**
   * Update user verification status
   */
  updateUserVerification: async (userId: string, isVerified: boolean) => {
    try {
      console.log(`🔄 Setting user ${userId} verification to: ${isVerified}`);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          is_verified: isVerified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Verification updated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Verification update failed:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error);
      return { data: null, error };
    }
  }
};