import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// ===== INTERFACE UPDATED sesuai struktur tabel baru =====
export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  profile_picture?: string;
  
  // Role & Mode System
  role: 'user' | 'admin' | 'owner';
  current_mode: 'buyer' | 'seller';
  
  // Seller-specific attributes
  seller_type?: 'showroom' | 'external' | null;
  seller_verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  seller_rating: number;
  seller_total_sales: number;
  
  // Account status
  account_status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  
  // Gamification
  user_level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total_transactions: number;
  buyer_rating: number;
  
  // Preferences
  preferences?: any;
  
  // Timestamps
  registered_at: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Interface untuk user lengkap (gabungan auth + profile)
export interface User extends UserProfile {
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  switchMode: (newMode: 'buyer' | 'seller') => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===== FIXED: Wrap getPermissionsByRole dengan useCallback =====
  const getPermissionsByRole = useCallback((role: string): string[] => {
    const rolePermissions: { [key: string]: string[] } = {
      'owner': [
        'view_dashboard',
        'manage_inventory',
        'manage_users',
        'view_reports',
        'manage_system',
        'view_analytics',
        'export_data',
        'manage_partnerships',
        'manage_finances',
        'manage_credit_params',
        'approve_sellers',
        'system_admin'
      ],
      'admin': [
        'view_dashboard',
        'manage_inventory',
        'manage_users',
        'moderate_listings',
        'process_transactions',
        'handle_test_drives',
        'moderate_reviews',
        'manage_content',
        'live_chat_support',
        'manage_payments',
        'view_reports'
      ],
      'user': [
        'view_cars',
        'buy_cars',
        'sell_cars',
        'create_listings',
        'chat',
        'save_favorites',
        'view_history',
        'request_test_drive',
        'trade_in',
        'simulate_credit',
        'write_reviews'
      ]
    };
    
    return rolePermissions[role] || rolePermissions['user'];
  }, []);

  // ===== FIXED: Wrap loadUserProfile dengan useCallback =====
  const loadUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        return null;
      }

      if (profile) {
        const userWithPermissions: User = {
          ...profile,
          permissions: getPermissionsByRole(profile.role)
        };
        
        // Update last_login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('auth_user_id', authUser.id);
        
        return userWithPermissions;
      }

      return null;
    } catch (error) {
      console.error('❌ Error in loadUserProfile:', error);
      return null;
    }
  }, [getPermissionsByRole]);

  // ===== FIXED: useEffect dengan dependency yang benar =====
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        if (session?.user) {
          console.log('✅ Session found, loading profile...');
          const profile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(profile);
            console.log('✅ User profile loaded:', profile?.username);
          }
        } else {
          console.log('ℹ️ No active session');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔔 Auth state changed:', event);
        
        // PENTING: Skip loadUserProfile saat SIGNED_IN dari signup
        // Biar fungsi register yang handle profile loading
        if (event === 'SIGNED_IN') {
          console.log('ℹ️ SIGNED_IN event detected, skipping profile load (handled by register function)');
          setSession(session);
          if (mounted) {
            setIsLoading(false);
          }
          return; // Skip loadUserProfile
        }
        
        setSession(session);
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(profile);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // ===== FUNGSI REGISTER DENGAN DATABASE TRIGGER - FIXED =====
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚀 [1/3] Starting registration for:', userData.email);
      
      // Step 1: SIGNUP KE SUPABASE AUTH (trigger akan auto-create profile)
      console.log('📝 [2/3] Creating auth account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username,
            phone_number: userData.phoneNumber
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        
        // Handle specific errors
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          return { 
            success: false, 
            error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' 
          };
        }
        
        if (authError.message.includes('Invalid email')) {
          return { 
            success: false, 
            error: 'Format email tidak valid.' 
          };
        }
        
        if (authError.message.includes('Password')) {
          return { 
            success: false, 
            error: 'Password terlalu lemah. Minimal 6 karakter.' 
          };
        }
        
        return { 
          success: false, 
          error: authError.message || 'Gagal membuat akun. Silakan coba lagi.' 
        };
      }

      if (!authData.user) {
        console.error('❌ No user returned from auth');
        return { 
          success: false, 
          error: 'Gagal membuat akun. Tidak ada user data.' 
        };
      }

      console.log('✅ Auth account created:', authData.user.id);

      // Step 2: TUNGGU TRIGGER SELESAI (polling method dengan timeout yang benar)
      console.log('⏳ [3/3] Waiting for database trigger to complete...');
      
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 8; // 8 attempts x 400ms = 3.2 seconds max
      
      while (!profileCreated && attempts < maxAttempts) {
        attempts++;
        
        // Wait sebelum check (kecuali attempt pertama)
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        console.log(`⏳ Checking profile... attempt ${attempts}/${maxAttempts}`);
        
        try {
          const { data: profile, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          if (profile && profile.id) {
            profileCreated = true;
            console.log('✅ Profile created by database trigger');
            break;
          }
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.warn('⚠️ Error checking profile:', checkError.message);
            // Jangan throw error, lanjutkan polling
          }
        } catch (checkError) {
          console.warn('⚠️ Exception while checking profile:', checkError);
          // Lanjutkan polling
        }
      }
      
      if (!profileCreated) {
        console.warn('⚠️ Profile check timeout, but auth successful');
        // Auth berhasil, anggap registrasi sukses meskipun tidak bisa confirm profile
        // User bisa langsung login
      }

      console.log('🎉 Registration complete!');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Unexpected registration error:', error);
      return { 
        success: false, 
        error: error?.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi.' 
      };
    }
  };

  // ===== FUNGSI LOGIN =====
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login for:', email);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Auth successful, loading profile...');
        const profile = await loadUserProfile(data.user);
        
        if (!profile) {
          console.error('❌ Profile not found');
          setIsLoading(false);
          return { success: false, error: 'Profil pengguna tidak ditemukan' };
        }
        
        // Cek status akun
        if (profile.account_status === 'suspended') {
          setIsLoading(false);
          return { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi admin.' };
        }
        
        if (profile.account_status === 'inactive') {
          setIsLoading(false);
          return { success: false, error: 'Akun Anda tidak aktif. Hubungi admin.' };
        }
        
        setUser(profile);
        console.log('✅ Login successful for:', profile.username);
      }

      setIsLoading(false);
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Terjadi kesalahan saat login' };
    }
  };

  // ===== FUNGSI LOGOUT =====
  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // ===== FUNGSI SWITCH MODE BUYER/SELLER =====
  const switchMode = async (newMode: 'buyer' | 'seller'): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }

    // Jika switch ke seller, cek apakah sudah verifikasi
    if (newMode === 'seller') {
      if (user.seller_verification_status === 'unverified') {
        return { 
          success: false, 
          error: 'Anda perlu verifikasi sebagai penjual terlebih dahulu' 
        };
      }
      
      if (user.seller_verification_status === 'rejected') {
        return { 
          success: false, 
          error: 'Verifikasi penjual Anda ditolak. Hubungi admin.' 
        };
      }
      
      if (user.seller_verification_status === 'pending') {
        return { 
          success: false, 
          error: 'Verifikasi penjual Anda masih dalam proses' 
        };
      }
    }

    try {
      console.log(`🔄 Switching mode to: ${newMode}`);
      
      const { error } = await supabase
        .from('users')
        .update({ current_mode: newMode })
        .eq('auth_user_id', user.auth_user_id);

      if (error) {
        console.error('❌ Error switching mode:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setUser({ ...user, current_mode: newMode });
      console.log(`✅ Mode switched to: ${newMode}`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Switch mode error:', error);
      return { success: false, error: error.message };
    }
  };

  // ===== HELPER FUNCTIONS =====
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
    switchMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;