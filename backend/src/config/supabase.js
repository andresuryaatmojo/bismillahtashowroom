require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

// Membuat Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper functions untuk database operations
const supabaseHelpers = {
  // Generic select function
  async select(table, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending !== false });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error selecting from ${table}:`, error);
      throw error;
    }
  },

  // Generic insert function
  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        throw error;
      }
      
      return result;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  },

  // Generic update function
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return result;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  },

  // Generic delete function
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  },

  // Find by ID
  async findById(table, id) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error finding ${table} by ID:`, error);
      throw error;
    }
  },

  // Count records
  async count(table, where = {}) {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return count;
    } catch (error) {
      console.error(`Error counting ${table}:`, error);
      throw error;
    }
  }
};

// Test connection function
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  supabaseHelpers,
  testConnection
};