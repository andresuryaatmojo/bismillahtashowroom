require('dotenv').config();
const { Client } = require('pg');

// Test dengan berbagai format Supabase yang umum
const testConfigurations = [
  {
    name: 'Original Connection String (from user)',
    connectionString: 'postgresql://postgres:kucinghitam48@db.ymviwplncjfvddqiuhgr.supabase.co:5432/postgres'
  },
  {
    name: 'Pooler Connection',
    connectionString: 'postgresql://postgres:kucinghitam48@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  },
  {
    name: 'Direct Connection with SSL',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'kucinghitam48',
    ssl: { 
      require: true,
      rejectUnauthorized: false 
    }
  },
  {
    name: 'Connection with project reference',
    connectionString: 'postgresql://postgres.ymviwplncjfvddqiuhgr:kucinghitam48@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  }
];

async function testConnection(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  
  if (config.connectionString) {
    console.log(`🔗 Connection String: ${config.connectionString.replace(/:[^:@]*@/, ':****@')}`);
  } else {
    console.log(`🏠 Host: ${config.host}`);
    console.log(`🔌 Port: ${config.port}`);
    console.log(`🗄️ Database: ${config.database}`);
    console.log(`👤 User: ${config.user}`);
  }
  
  const client = new Client(config);
  
  try {
    console.log('🔌 Connecting...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('⏰ Current Time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL Version:', result.rows[0].version.substring(0, 50) + '...');
    
    // Test table creation (to verify write permissions)
    try {
      await client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())');
      await client.query('INSERT INTO test_connection DEFAULT VALUES');
      const testResult = await client.query('SELECT COUNT(*) as count FROM test_connection');
      console.log('📝 Test table records:', testResult.rows[0].count);
      await client.query('DROP TABLE test_connection');
      console.log('🧹 Test table cleaned up');
    } catch (testError) {
      console.log('⚠️ Write test failed (read-only access?):', testError.message);
    }
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error code:', error.code);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing various Supabase PostgreSQL connection formats...\n');
  
  let successfulConfig = null;
  
  for (const config of testConfigurations) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 Found working configuration: ${config.name}`);
      successfulConfig = config;
      break;
    }
  }
  
  if (successfulConfig) {
    console.log('\n✅ Recommended configuration for your .env file:');
    if (successfulConfig.connectionString) {
      console.log(`DATABASE_URL=${successfulConfig.connectionString}`);
    } else {
      console.log(`DB_HOST=${successfulConfig.host}`);
      console.log(`DB_PORT=${successfulConfig.port}`);
      console.log(`DB_NAME=${successfulConfig.database}`);
      console.log(`DB_USER=${successfulConfig.user}`);
      console.log(`DB_PASSWORD=${successfulConfig.password}`);
    }
  } else {
    console.log('\n❌ No working configuration found. Please check:');
    console.log('1. Supabase project is active and accessible');
    console.log('2. Database password is correct');
    console.log('3. Network connectivity to Supabase');
    console.log('4. Supabase project region and connection details');
  }
  
  console.log('\n✅ Test completed!');
}

runTests().catch(console.error);