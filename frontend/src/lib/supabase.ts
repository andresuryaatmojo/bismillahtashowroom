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
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
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
      articles: {
        Row: {
          id: string;
          category_id: number;
          author_id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          featured_image_alt: string | null;
          gallery_images: any | null;
          meta_title: string | null;
          meta_description: string | null;
          seo_keywords: string | null;
          status: 'draft' | 'review' | 'published' | 'archived' | 'deleted';
          is_featured: boolean | null;
          is_pinned: boolean | null;
          visibility: 'public' | 'private' | 'members_only' | null;
          view_count: number | null;
          share_count: number | null;
          like_count: number | null;
          comment_count: number | null;
          reading_time_minutes: number | null;
          published_at: string | null;
          scheduled_publish_at: string | null;
          related_car_brands: any | null;
          related_car_models: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category_id: number;
          author_id: string;
          title: string;
          slug?: string;
          excerpt?: string | null;
          content: string;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          gallery_images?: any | null;
          meta_title?: string | null;
          meta_description?: string | null;
          seo_keywords?: string | null;
          status?: 'draft' | 'review' | 'published' | 'archived' | 'deleted';
          is_featured?: boolean | null;
          is_pinned?: boolean | null;
          visibility?: 'public' | 'private' | 'members_only' | null;
          view_count?: number | null;
          share_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          reading_time_minutes?: number | null;
          published_at?: string | null;
          scheduled_publish_at?: string | null;
          related_car_brands?: any | null;
          related_car_models?: any | null;
        };
        Update: {
          category_id?: number;
          author_id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          gallery_images?: any | null;
          meta_title?: string | null;
          meta_description?: string | null;
          seo_keywords?: string | null;
          status?: 'draft' | 'review' | 'published' | 'archived' | 'deleted';
          is_featured?: boolean | null;
          is_pinned?: boolean | null;
          visibility?: 'public' | 'private' | 'members_only' | null;
          view_count?: number | null;
          share_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          reading_time_minutes?: number | null;
          published_at?: string | null;
          scheduled_publish_at?: string | null;
          related_car_brands?: any | null;
          related_car_models?: any | null;
          updated_at?: string;
        };
      };
      article_categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          parent_id: number | null;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: number | null;
          display_order?: number | null;
          is_active?: boolean | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          parent_id?: number | null;
          display_order?: number | null;
          is_active?: boolean | null;
          updated_at?: string;
        };
      };
      article_tags: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          usage_count: number | null;
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          usage_count?: number | null;
          is_active?: boolean | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          usage_count?: number | null;
          is_active?: boolean | null;
        };
      };
      article_tags_relation: {
        Row: {
          article_id: string;
          tag_id: number;
          created_at: string;
        };
        Insert: {
          article_id: string;
          tag_id: number;
        };
        Update: {
          article_id?: string;
          tag_id?: number;
        };
      };
      cars: {
        Row: {
          id: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          mileage?: number;
          color?: string;
          transmission?: string;
          fuel_type?: string;
          description?: string;
          images?: string[];
          status?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          brand: string;
          model: string;
          year: number;
          price: number;
          mileage?: number;
          color?: string;
          transmission?: string;
          fuel_type?: string;
          description?: string;
          images?: string[];
          status?: string;
        };
        Update: {
          brand?: string;
          model?: string;
          year?: number;
          price?: number;
          mileage?: number;
          color?: string;
          transmission?: string;
          fuel_type?: string;
          description?: string;
          images?: string[];
          status?: string;
          updated_at?: string;
        };
      };
      test_drive_requests: {
        Row: {
          id: string;
          user_id: string;
          car_id: string;
          scheduled_date: string;
          scheduled_time: string;
          status: 'pending' | 'confirmed' | 'rescheduled' | 'reschedule_requested' | 'completed' | 'cancelled' | 'no_show';
          user_notes?: string;
          admin_notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          car_id: string;
          scheduled_date: string;
          scheduled_time: string;
          status?: 'pending' | 'confirmed' | 'rescheduled' | 'reschedule_requested' | 'completed' | 'cancelled' | 'no_show';
          user_notes?: string;
          admin_notes?: string;
        };
        Update: {
          scheduled_date?: string;
          scheduled_time?: string;
          status?: 'pending' | 'confirmed' | 'rescheduled' | 'reschedule_requested' | 'completed' | 'cancelled' | 'no_show';
          user_notes?: string;
          admin_notes?: string;
          updated_at?: string;
        };
      };
    };
  };
}