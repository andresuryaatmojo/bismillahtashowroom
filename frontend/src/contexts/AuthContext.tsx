import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// ===== INTERFACES =====
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
  role: 'user' | 'admin' | 'owner';
  current_mode: 'buyer' | 'seller';
  seller_type?: 'showroom' | 'external' | null;
  seller_verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  seller_rating: number;
  seller_total_sales: number;
  account_status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  user_level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total_transactions: number;
  buyer_rating: number;
  preferences?: any;
  registered_at: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

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

  // Get permissions by role
  const getPermissionsByRole = useCallback((role: string): string[] => {
    const rolePermissions: { [key: string]: string[] } = {
      owner: [
        'view_dashboard', 'manage_inventory', 'manage_users', 'view_reports',
        'manage_system', 'view_analytics', 'export_data', 'manage_partnerships',
        'manage_finances', 'manage_credit_params', 'approve_sellers', 'system_admin'
      ],
      admin: [
        'view_dashboard', 'manage_inventory', 'manage_users', 'moderate_listings',
        'process_transactions', 'handle_test_drives', 'moderate_reviews',
        'manage_content', 'live_chat_support', 'manage_payments', 'view_reports'
      ],
      user: [
        'view_cars', 'buy_cars', 'sell_cars', 'create_listings', 'chat',
        'save_favorites', 'view_history', 'request_test_drive', 'trade_in',
        'simulate_credit', 'write_reviews'
      ]
    };
    return rolePermissions[role] || rolePermissions['user'];
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('📥 [1/3] Loading profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${authUser.id},auth_user_id.eq.${authUser.id}`)
        .maybeSingle();

      console.log('📥 [2/3] Query result:', { 
        hasData: !!profile, 
        hasError: !!error,
        errorCode: error?.code 
      });

      if (error) {
        console.error('❌ Error loading user profile:', error);
        if (error.code === 'PGRST116') {
          console.warn('⚠️ No profile found for user');
        }
        return null;
      }

      if (profile) {
        console.log('✅ [3/3] Profile loaded:', profile.username);
        
        const userWithPermissions: User = {
          ...profile,
          permissions: getPermissionsByRole(profile.role)
        };
        
        // Update last_login (non-blocking)
        (async () => {
          try {
            const { error } = await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .or(`id.eq.${authUser.id},auth_user_id.eq.${authUser.id}`);
            
            if (error) {
              console.warn('⚠️ Failed to update last_login:', error);
            } else {
              console.log('✅ Last login updated');
            }
          } catch (err) {
            console.warn('⚠️ Exception updating last_login:', err);
          }
        })();
        
        return userWithPermissions;
      }

      console.warn('⚠️ No profile data found');
      return null;
      
    } catch (error) {
      console.error('❌ Error in loadUserProfile:', error);
      return null;
    }
  }, [getPermissionsByRole]);

  // Initialize auth
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Timeout failsafe
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.error('❌ Auth initialization timeout after 8s');
            setIsLoading(false);
          }
        }, 8000);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          clearTimeout(initTimeout);
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        console.log('📦 Session:', session ? 'Found' : 'Not found');
        setSession(session);
        
        if (session?.user) {
          console.log('✅ Session found, loading profile...');
          
          try {
            const profile = await loadUserProfile(session.user);
            if (mounted) {
              setUser(profile);
              console.log('✅ User loaded:', profile ? 'Success' : 'Failed');
            }
          } catch (profileError) {
            console.error('❌ Profile load error:', profileError);
            if (mounted) setUser(null);
          }
        } else {
          console.log('ℹ️ No active session');
        }
        
        clearTimeout(initTimeout);
        
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔔 Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          console.log('ℹ️ SIGNED_IN event, skipping profile load');
          setSession(session);
          if (mounted) setIsLoading(false);
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('ℹ️ SIGNED_OUT event');
          setSession(null);
          setUser(null);
          if (mounted) setIsLoading(false);
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          try {
            const profile = await loadUserProfile(session.user);
            if (mounted) setUser(profile);
          } catch (error) {
            console.error('❌ Profile load error:', error);
            if (mounted) setUser(null);
          }
        } else {
          if (mounted) setUser(null);
        }
        
        if (mounted) setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Register function
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚀 [1/4] Starting registration for:', userData.email);
      
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
        
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Email sudah terdaftar.' };
        }
        if (authError.message.includes('Invalid email')) {
          return { success: false, error: 'Format email tidak valid.' };
        }
        if (authError.message.includes('Password')) {
          return { success: false, error: 'Password minimal 6 karakter.' };
        }
        
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Gagal membuat akun.' };
      }

      console.log('✅ [2/4] Auth account created:', authData.user.id);

      // Wait for database trigger
      console.log('⏳ [3/4] Waiting for database trigger...');
      
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 8;
      
      while (!profileCreated && attempts < maxAttempts) {
        attempts++;
        
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        console.log(`⏳ Checking profile... ${attempts}/${maxAttempts}`);
        
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('id')
            .or(`id.eq.${authData.user.id},auth_user_id.eq.${authData.user.id}`)
            .maybeSingle();
          
          if (profile?.id) {
            profileCreated = true;
            console.log('✅ Profile created');
            break;
          }
        } catch (error) {
          console.warn('⚠️ Check error:', error);
        }
      }
      
      if (!profileCreated) {
        console.warn('⚠️ Profile check timeout');
      }

      // Logout after registration
      console.log('👋 [4/4] Logging out after registration...');
      try {
        await supabase.auth.signOut();
        console.log('✅ Logged out');
      } catch (err) {
        console.warn('⚠️ Logout error:', err);
      }

      console.log('🎉 Registration complete!');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error?.message || 'Terjadi kesalahan.' };
    }
  };

  // Login function
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
          return { success: false, error: 'Profil tidak ditemukan' };
        }
        
        if (profile.account_status === 'suspended') {
          setIsLoading(false);
          return { success: false, error: 'Akun dinonaktifkan.' };
        }
        
        if (profile.account_status === 'inactive') {
          setIsLoading(false);
          return { success: false, error: 'Akun tidak aktif.' };
        }
        
        setUser(profile);
        console.log('✅ Login successful:', profile.username);
      }

      setIsLoading(false);
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      return { success: false, error: error.message || 'Terjadi kesalahan' };
    }
  };

  // Logout function
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

  // Switch mode function
  const switchMode = async (newMode: 'buyer' | 'seller'): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }

    if (newMode === 'seller') {
      if (user.seller_verification_status === 'unverified') {
        return { success: false, error: 'Perlu verifikasi penjual' };
      }
      if (user.seller_verification_status === 'rejected') {
        return { success: false, error: 'Verifikasi ditolak' };
      }
      if (user.seller_verification_status === 'pending') {
        return { success: false, error: 'Verifikasi dalam proses' };
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

      setUser({ ...user, current_mode: newMode });
      console.log(`✅ Mode switched to: ${newMode}`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Switch mode error:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper functions
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