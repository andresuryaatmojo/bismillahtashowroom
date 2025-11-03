// test-supabase-trade-in.js
// Test script to verify Supabase connection and check trade_in tables

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDA3NzIsImV4cCI6MjA3NDkxNjc3Mn0.Xs0QRss4KJ-pNkJSoC5YhR5SxJXcwTBfaTmL_cOgffA';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MDc3MiwiZXhwIjoyMDc0OTE2NzcyfQ.exrHxjmf4CkBqt0vi4wp599Ec1jvAkeL4GUy0v5lt4Q';

console.log('🔧 Supabase Connection Test');
console.log('==========================================');

// Test with anon key first
console.log('\n1. Testing connection with ANON key...');
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAnonConnection() {
  try {
    const { data, error } = await anonClient.from('users').select('count').single();
    if (error) {
      console.log('❌ Anon connection failed:', error.message);
      return false;
    }
    console.log('✅ Anon connection successful');
    return true;
  } catch (err) {
    console.log('❌ Anon connection error:', err.message);
    return false;
  }
}

// Test with service role key
console.log('\n2. Testing connection with SERVICE ROLE key...');
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testServiceConnection() {
  try {
    const { data, error } = await serviceClient.from('users').select('count').single();
    if (error) {
      console.log('❌ Service connection failed:', error.message);
      return false;
    }
    console.log('✅ Service connection successful');
    return true;
  } catch (err) {
    console.log('❌ Service connection error:', err.message);
    return false;
  }
}

// Check if table exists
async function checkTableExists(client, tableName) {
  try {
    console.log(`\n3. Checking if table '${tableName}' exists...`);

    // Try to select 1 row from the table
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`❌ Table '${tableName}' does not exist or permissions denied`);
        return { exists: false, error: error.message };
      } else {
        console.log(`❌ Error checking table '${tableName}':`, error.message);
        return { exists: false, error: error.message };
      }
    }

    console.log(`✅ Table '${tableName}' exists`);
    console.log(`   - Total records: ${count || 0}`);
    return { exists: true, count: count || 0 };
  } catch (err) {
    console.log(`❌ Exception checking table '${tableName}':`, err.message);
    return { exists: false, error: err.message };
  }
}

// Test query on trade_in_requests
async function testTradeInQuery(client) {
  try {
    console.log('\n4. Testing query on trade_in_requests table...');

    const { data, error } = await client
      .from('trade_in_requests')
      .select(`
        id,
        user_id,
        old_car_brand,
        old_car_model,
        status,
        created_at
      `)
      .limit(5);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Query successful');
    console.log(`   - Found ${data.length} sample records:`);
    data.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, Brand: ${record.old_car_brand}, Model: ${record.old_car_model}, Status: ${record.status}`);
    });

    return { success: true, data };
  } catch (err) {
    console.log('❌ Query exception:', err.message);
    return { success: false, error: err.message };
  }
}

// Check table structure
async function checkTableStructure(client, tableName) {
  try {
    console.log(`\n5. Checking structure of table '${tableName}'...`);

    // Get sample data to infer structure
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Cannot get table structure for '${tableName}':`, error.message);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`✅ Table '${tableName}' structure:`);
      const columns = Object.keys(data[0]);
      columns.forEach(column => {
        console.log(`   - ${column}: ${typeof data[0][column]}`);
      });
      return columns;
    } else {
      console.log(`ℹ️  Table '${tableName}' exists but is empty`);
      return [];
    }
  } catch (err) {
    console.log(`❌ Exception checking structure of '${tableName}':`, err.message);
    return null;
  }
}

// Test foreign key relationships
async function testTradeInRelationships(client) {
  try {
    console.log('\n6. Testing trade-in relationships...');

    const { data, error } = await client
      .from('trade_in_requests')
      .select(`
        id,
        user_id,
        new_car_id,
        users!inner(id, username, email),
        cars!inner(id, brand, model)
      `)
      .limit(2);

    if (error) {
      console.log('❌ Relationship query failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Relationship query successful');
    if (data.length > 0) {
      console.log('   Sample relationships:');
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. Trade-in ID: ${record.id}`);
        console.log(`      User: ${record.users?.username || 'N/A'} (${record.users?.email || 'N/A'})`);
        console.log(`      Car: ${record.cars?.brand || 'N/A'} ${record.cars?.model || 'N/A'}`);
      });
    } else {
      console.log('   No records with complete relationships found');
    }

    return { success: true, data };
  } catch (err) {
    console.log('❌ Relationship query exception:', err.message);
    return { success: false, error: err.message };
  }
}

// Test image table query
async function testTradeInImagesQuery(client) {
  try {
    console.log('\n7. Testing trade_in_images table query...');

    const { data, error } = await client
      .from('trade_in_images')
      .select(`
        id,
        trade_in_id,
        image_url,
        image_type,
        created_at
      `)
      .limit(5);

    if (error) {
      console.log('❌ Images query failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Images query successful');
    console.log(`   - Found ${data.length} sample images:`);
    data.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, Trade-in ID: ${record.trade_in_id}, Type: ${record.image_type}`);
    });

    return { success: true, data };
  } catch (err) {
    console.log('❌ Images query exception:', err.message);
    return { success: false, error: err.message };
  }
}

// Main test function
async function runTests() {
  const results = {
    anonConnection: false,
    serviceConnection: false,
    tradeInRequestsTable: null,
    tradeInImagesTable: null,
    queryTest: null,
    structureTest: null,
    relationshipTest: null,
    imagesQueryTest: null
  };

  try {
    // Test connections
    results.anonConnection = await testAnonConnection();
    results.serviceConnection = await testServiceConnection();

    // Use service client for remaining tests (better permissions)
    const client = results.serviceConnection ? serviceClient : anonClient;

    // Check tables exist
    results.tradeInRequestsTable = await checkTableExists(client, 'trade_in_requests');
    results.tradeInImagesTable = await checkTableExists(client, 'trade_in_images');

    if (results.tradeInRequestsTable.exists) {
      // Test queries
      results.queryTest = await testTradeInQuery(client);
      results.structureTest = await checkTableStructure(client, 'trade_in_requests');
      results.relationshipTest = await testTradeInRelationships(client);
    }

    if (results.tradeInImagesTable.exists) {
      results.imagesQueryTest = await testTradeInImagesQuery(client);
    }

  } catch (err) {
    console.log('❌ Test suite error:', err.message);
  }

  return results;
}

// Run tests and display results
runTests().then(results => {
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('==========================================');
  console.log(`Anon Connection: ${results.anonConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Service Connection: ${results.serviceConnection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Trade-in Requests Table: ${results.tradeInRequestsTable?.exists ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`Trade-in Images Table: ${results.tradeInImagesTable?.exists ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`Query Test: ${results.queryTest?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Relationship Test: ${results.relationshipTest?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Images Query Test: ${results.imagesQueryTest?.success ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n📝 DETAILED RESULTS');
  console.log('==========================================');

  if (results.tradeInRequestsTable?.error) {
    console.log('Trade-in Requests Error:', results.tradeInRequestsTable.error);
  }

  if (results.tradeInImagesTable?.error) {
    console.log('Trade-in Images Error:', results.tradeInImagesTable.error);
  }

  if (results.queryTest?.error) {
    console.log('Query Error:', results.queryTest.error);
  }

  if (results.relationshipTest?.error) {
    console.log('Relationship Error:', results.relationshipTest.error);
  }

  if (results.imagesQueryTest?.error) {
    console.log('Images Query Error:', results.imagesQueryTest.error);
  }

  console.log('\n🎯 RECOMMENDATIONS');
  console.log('==========================================');

  if (!results.serviceConnection) {
    console.log('❌ Cannot connect to Supabase. Check URL and keys.');
  } else if (!results.tradeInRequestsTable?.exists) {
    console.log('❌ trade_in_requests table does not exist. Create the table using SQL:');
    console.log(`
-- Create trade_in_requests table
CREATE TABLE trade_in_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    new_car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    old_car_brand VARCHAR(100) NOT NULL,
    old_car_model VARCHAR(100) NOT NULL,
    old_car_year INTEGER NOT NULL,
    old_car_mileage INTEGER,
    old_car_color VARCHAR(50),
    old_car_transmission VARCHAR(50),
    old_car_fuel_type VARCHAR(50),
    old_car_condition VARCHAR(100),
    old_car_plate_number VARCHAR(20),
    old_car_description TEXT,
    estimated_value DECIMAL(12,2),
    appraised_value DECIMAL(12,2),
    final_trade_in_value DECIMAL(12,2),
    price_difference DECIMAL(12,2),
    inspection_date DATE,
    inspection_time TIME,
    inspection_location TEXT,
    inspection_notes TEXT,
    inspector_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'inspecting', 'appraised', 'approved', 'rejected', 'completed', 'cancelled')),
    contract_url TEXT,
    user_notes TEXT,
    rejection_reason TEXT,
    submission_date DATE,
    inspected_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trade_in_requests_user_id ON trade_in_requests(user_id);
CREATE INDEX idx_trade_in_requests_status ON trade_in_requests(status);
CREATE INDEX idx_trade_in_requests_created_at ON trade_in_requests(created_at);
    `);
  }

  if (!results.tradeInImagesTable?.exists) {
    console.log('❌ trade_in_images table does not exist. Create the table using SQL:');
    console.log(`
-- Create trade_in_images table
CREATE TABLE trade_in_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_in_id UUID REFERENCES trade_in_requests(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20),
    display_order INTEGER DEFAULT 0,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trade_in_images_trade_in_id ON trade_in_images(trade_in_id);
CREATE INDEX idx_trade_in_images_display_order ON trade_in_images(display_order);
    `);
  }

  if (results.serviceConnection && results.tradeInRequestsTable?.exists && results.tradeInImagesTable?.exists) {
    console.log('✅ All tests passed! Supabase connection and trade-in tables are working correctly.');
  }

}).catch(error => {
  console.log('💥 FATAL ERROR:', error.message);
  process.exit(1);
});