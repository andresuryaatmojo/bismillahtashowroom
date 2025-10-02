require('dotenv').config();
const { Client } = require('pg');

// Test dengan berbagai konfigurasi
const testConfigurations = [
  {
    name: 'Original URL',
    connectionString: 'postgresql://postgres:kucinghitam48@db.ymviwplncjfvddqiuhgr.supabase.co:5432/postgres'
  },
  {
    name: 'Direct Config',
    host: 'db.ymviwplncjfvddqiuhgr.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'kucinghitam48',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Alternative Host Format',
    connectionString: 'postgresql://postgres:kucinghitam48@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  }
];

async function testConnection(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  
  const client = new Client(config);
  
  try {
    console.log('🔌 Connecting...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.substring(0, 50) + '...');
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Supabase PostgreSQL connections...\n');
  
  for (const config of testConfigurations) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 Found working configuration: ${config.name}`);
      break;
    }
  }
  
  console.log('\n✅ Test completed!');
}

runTests().catch(console.error);