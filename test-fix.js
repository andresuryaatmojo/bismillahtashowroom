// test-fix.js
// Test to verify that the admin service key fix works
const https = require('https');

const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MDc3MiwiZXhwIjoyMDc0OTE2NzcyfQ.exrHxjmf4CkBqt0vi4wp599Ec1jvAkeL4GUy0v5lt4Q';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ymviwplncjfvddqiuhgr.supabase.co',
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (err) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testFix() {
  console.log('🔧 Testing service key fix for trade-in requests...');
  console.log('This simulates what the frontend will do with supabaseAdmin');

  try {
    // Test the exact query that HalamanKelolaTradeIn will use
    console.log('\n1. Testing admin query with relationships...');
    const complexQuery = 'trade_in_requests?select=*,new_car:cars(id,title,price,brand_id,model_id,year),trade_in_images(*).order(created_at.desc)&limit=10';
    const response = await makeRequest(complexQuery);

    console.log('Status:', response.status);
    console.log('Content-Range header:', response.headers['content-range']);

    if (response.status === 200) {
      console.log('✅ SUCCESS! Admin query works!');
      console.log('Data length:', response.data.length);
      console.log('Sample data:');

      if (response.data.length > 0) {
        const sample = response.data[0];
        console.log('- ID:', sample.id);
        console.log('- Brand:', sample.old_car_brand);
        console.log('- Model:', sample.old_car_model);
        console.log('- Status:', sample.status);
        console.log('- New car:', sample.new_car?.title || 'N/A');
        console.log('- Images count:', sample.trade_in_images?.length || 0);
        console.log('- Created at:', sample.created_at);

        console.log('\n📊 Full data structure available:');
        console.log('Available fields:', Object.keys(sample));
      }

      console.log('\n🎉 HalamanKelolaTradeIn should now display data correctly!');
      console.log('📱 The admin page will show', response.data.length, 'trade-in requests');

    } else {
      console.log('❌ Query failed');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFix();