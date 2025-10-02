const { Client } = require('pg');

// Konfigurasi berdasarkan command psql yang diberikan user
const config = {
  host: 'db.ymviwplncjfvddqiuhgr.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'kucinghitam48', // Dari .env file
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

async function testPsqlConnection() {
  console.log('🚀 Testing psql-style connection to Supabase...');
  console.log('📍 Host:', config.host);
  console.log('🔌 Port:', config.port);
  console.log('🗄️ Database:', config.database);
  console.log('👤 User:', config.user);
  console.log('🔐 SSL:', config.ssl.require ? 'Required' : 'Optional');
  
  const client = new Client(config);
  
  try {
    console.log('\n🔌 Attempting connection...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test basic queries
    console.log('\n📊 Running test queries...');
    
    // 1. Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('🐘 PostgreSQL Version:', versionResult.rows[0].version.substring(0, 80) + '...');
    
    // 2. Check current time
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Current Time:', timeResult.rows[0].current_time);
    
    // 3. Check database name
    const dbResult = await client.query('SELECT current_database()');
    console.log('🗄️ Current Database:', dbResult.rows[0].current_database);
    
    // 4. Check user
    const userResult = await client.query('SELECT current_user');
    console.log('👤 Current User:', userResult.rows[0].current_user);
    
    // 5. List available schemas
    const schemaResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    console.log('📁 Available Schemas:', schemaResult.rows.map(row => row.schema_name).join(', '));
    
    // 6. Check if we can create tables (test write permissions)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_connection_check (
          id SERIAL PRIMARY KEY,
          test_message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await client.query(`
        INSERT INTO test_connection_check (test_message) 
        VALUES ('Connection test successful')
      `);
      
      const testResult = await client.query('SELECT COUNT(*) as count FROM test_connection_check');
      console.log('📝 Write Test: SUCCESS - Records in test table:', testResult.rows[0].count);
      
      // Clean up
      await client.query('DROP TABLE test_connection_check');
      console.log('🧹 Test table cleaned up');
      
    } catch (writeError) {
      console.log('⚠️ Write Test: FAILED -', writeError.message);
      console.log('   (This might be expected if using read-only credentials)');
    }
    
    await client.end();
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Your Supabase connection is working properly.');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('🔍 Error code:', error.code);
    
    // Provide specific troubleshooting based on error
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if the hostname is correct');
      console.log('2. Verify internet connection');
      console.log('3. Try using a different DNS server');
    } else if (error.code === 'XX000' || error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Verify the project ID in the hostname');
      console.log('2. Check if the Supabase project is active');
      console.log('3. Confirm the database password is correct');
      console.log('4. Try regenerating the database password in Supabase dashboard');
    } else if (error.code === '28P01') {
      console.log('\n🔧 Authentication failed - check your password');
    }
    
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return false;
  }
}

// Run the test
testPsqlConnection().catch(console.error);