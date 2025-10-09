import { createClient } from '@supabase/supabase-js';

// ===== CREATE REACT APP Environment Variables =====
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug log (PENTING untuk troubleshooting)
console.log('🔧 Environment Check:');
console.log('  - REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  - REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

// Validasi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Expected in .env file:');
  console.error('  REACT_APP_SUPABASE_URL=https://xxx.supabase.co');
  console.error('  REACT_APP_SUPABASE_ANON_KEY=your-key');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

console.log('✅ Supabase client created successfully');

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
          role: 'user' | 'admin' | 'owner';
          current_mode: 'buyer' | 'seller';
          seller_type?: 'showroom' | 'external';
          seller_verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
          seller_rating: number;
          seller_total_sales: number;
          account_status: 'active' | 'inactive' | 'suspended';
          is_verified: boolean;
          user_level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          total_transactions: number;
          buyer_rating: number;
          preferences?: any;
          profile_picture?: string;
          registered_at: string;
          created_at: string;
          updated_at: string;
          last_login?: string;
        };
        Insert: {
          auth_user_id: string;
          username: string;
          email: string;
          full_name: string;
          phone_number?: string;
          role?: 'user' | 'admin' | 'owner';
          current_mode?: 'buyer' | 'seller';
          seller_type?: 'showroom' | 'external';
          seller_verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          seller_rating?: number;
          seller_total_sales?: number;
          account_status?: 'active' | 'inactive' | 'suspended';
          is_verified?: boolean;
          user_level?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
          total_transactions?: number;
          buyer_rating?: number;
          preferences?: any;
          registered_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          phone_number?: string;
          address?: string;
          city?: string;
          province?: string;
          postal_code?: string;
          current_mode?: 'buyer' | 'seller';
          seller_type?: 'showroom' | 'external';
          preferences?: any;
          profile_picture?: string;
          last_login?: string;
          updated_at?: string;
        };
      };
    };
  };
}