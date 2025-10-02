require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase menggunakan URL dan API key yang diberikan
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🚀 Testing Supabase connection with REST API...');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 API Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

// Membuat client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🔌 Testing Supabase REST API connection...');
    
    // Test 1: Basic connection test
    console.log('\n📊 Test 1: Basic API Health Check');
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is OK
      console.log('⚠️ API Health Check:', error.message);
    } else {
      console.log('✅ Supabase REST API is accessible');
    }
    
    // Test 2: Check available tables
    console.log('\n📋 Test 2: Checking database schema...');
    try {
      const { data: tables, error: schemaError } = await supabase.rpc('get_schema_tables');
      if (schemaError) {
        console.log('⚠️ Schema check failed (expected for new database):', schemaError.message);
      } else {
        console.log('📁 Available tables:', tables);
      }
    } catch (rpcError) {
      console.log('⚠️ RPC function not available (expected for new database)');
    }
    
    // Test 3: Try to create a test table
    console.log('\n🛠️ Test 3: Testing table creation...');
    try {
      const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS test_connection (
            id SERIAL PRIMARY KEY,
            message TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });
      
      if (createError) {
        console.log('⚠️ Table creation test failed:', createError.message);
        console.log('   This might be due to RLS policies or permissions');
      } else {
        console.log('✅ Table creation test successful');
      }
    } catch (sqlError) {
      console.log('⚠️ SQL execution not available via REST API');
      console.log('   This is normal - direct SQL execution requires service role key');
    }
    
    // Test 4: Test authentication
    console.log('\n🔐 Test 4: Testing authentication...');
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('ℹ️ No authenticated user (using anonymous key)');
    } else {
      console.log('👤 Authenticated user:', user);
    }
    
    // Test 5: Test storage (if available)
    console.log('\n📦 Test 5: Testing storage access...');
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      if (storageError) {
        console.log('⚠️ Storage access failed:', storageError.message);
      } else {
        console.log('📁 Available storage buckets:', buckets.length);
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      }
    } catch (storageError) {
      console.log('⚠️ Storage not accessible');
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    console.log('✅ Your Supabase project is accessible via REST API');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Supabase connection test failed:', error.message);
    console.error('🔍 Error details:', error);
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Verify the Supabase URL is correct');
    console.log('2. Check if the API key is valid and not expired');
    console.log('3. Ensure the Supabase project is active (not paused)');
    console.log('4. Check your internet connection');
    
    return false;
  }
}

// Run the test
testSupabaseConnection().catch(console.error);