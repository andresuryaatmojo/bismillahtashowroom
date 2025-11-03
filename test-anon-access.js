// test-anon-access.js
// Test access using ANON key (same as frontend)
const https = require('https');

const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDA3NzIsImV4cCI6MjA3NDkxNjc3Mn0.Xs0QRss4KJ-pNkJSoC5YhR5SxJXcwTBfaTmL_cOgffA';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ymviwplncjfvddqiuhgr.supabase.co',
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

async function testAnonAccess() {
  console.log('🔍 Testing ANON key access to trade_in_requests...');

  try {
    // Test 1: Simple query
    console.log('\n1. Testing simple query with ANON key...');
    const simpleResponse = await makeRequest('trade_in_requests?select=id,old_car_brand,status&limit=3');
    console.log('Simple query status:', simpleResponse.status);
    if (simpleResponse.status === 200) {
      console.log('✅ Simple query works! Data:', simpleResponse.data);
    } else {
      console.log('❌ Simple query failed:', simpleResponse.data);
    }

    // Test 2: The exact query from LayananTradeIn.ts
    console.log('\n2. Testing the exact query from frontend (with relationships)...');
    const complexQuery = 'trade_in_requests?select=*,new_car:cars(id,title,price,brand_id,model_id,year),trade_in_images(*).order(created_at.desc)&limit=3';
    const complexResponse = await makeRequest(complexQuery);
    console.log('Complex query status:', complexResponse.status);

    if (complexResponse.status === 200) {
      console.log('✅ Complex query works!');
      console.log('Data length:', complexResponse.data.length);
      if (complexResponse.data.length > 0) {
        console.log('Sample record keys:', Object.keys(complexResponse.data[0]));
        console.log('First record:', complexResponse.data[0]);
      }
    } else {
      console.log('❌ Complex query failed');
      console.log('Response:', complexResponse.data);
      console.log('Headers:', complexResponse.headers);
    }

    // Test 3: Check if RLS is blocking access
    console.log('\n3. Testing RLS permissions...');
    const rlsTestResponse = await makeRequest('trade_in_requests?select=count');
    console.log('RLS test status:', rlsTestResponse.status);
    console.log('RLS test data:', rlsTestResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnonAccess();