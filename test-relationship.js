// test-relationship.js
const https = require('https');

const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MDc3MiwiZXhwIjoyMDc0OTE2NzcyfQ.exrHxjmf4CkBqt0vi4wp599Ec1jvAkeL4GUy0v5lt4Q';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ymviwplncjfvddqiuhgr.supabase.co',
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
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

async function testRelationships() {
  console.log('🔍 Testing trade-in relationships...');

  try {
    // Test 1: Check if cars table exists and has the referenced car IDs
    console.log('\n1. Testing cars table access...');
    const carsResponse = await makeRequest('cars?select=id,title,price&limit=5');
    console.log('Cars table status:', carsResponse.status);
    if (carsResponse.status === 200) {
      console.log('Cars data sample:', carsResponse.data.slice(0, 2));
    }

    // Test 2: Check trade_in_images table
    console.log('\n2. Testing trade_in_images table...');
    const imagesResponse = await makeRequest('trade_in_images?select=*&limit=5');
    console.log('Images table status:', imagesResponse.status);
    if (imagesResponse.status === 200) {
      console.log('Images data sample:', imagesResponse.data);
    }

    // Test 3: Test the exact query used in LayananTradeIn.ts
    console.log('\n3. Testing the exact query from LayananTradeIn.ts...');
    const queryPath = 'trade_in_requests?select=*,new_car:cars(id,title,price,brand_id,model_id,year),trade_in_images(*).order(created_at.desc)&limit=5';
    const complexResponse = await makeRequest(queryPath);
    console.log('Complex query status:', complexResponse.status);
    if (complexResponse.status === 200) {
      console.log('Complex query works! Data length:', complexResponse.data.length);
      console.log('Sample record structure:', Object.keys(complexResponse.data[0] || {}));
    } else {
      console.log('❌ Complex query failed');
      console.log('Response:', complexResponse.data);
    }

    // Test 4: Try a simpler query without relationships
    console.log('\n4. Testing simpler query...');
    const simpleResponse = await makeRequest('trade_in_requests?select=*&order=created_at.desc&limit=5');
    console.log('Simple query status:', simpleResponse.status);
    if (simpleResponse.status === 200) {
      console.log('Simple query works! Data length:', simpleResponse.data.length);
    }

    // Test 5: Check specific car IDs from trade-in requests
    console.log('\n5. Checking specific car IDs from trade-ins...');
    const tradeInResponse = await makeRequest('trade_in_requests?select=new_car_id&limit=3');
    if (tradeInResponse.status === 200) {
      const carIds = tradeInResponse.data.map(item => item.new_car_id);
      console.log('Car IDs from trade-ins:', carIds);

      for (const carId of carIds) {
        const carResponse = await makeRequest(`cars?id=eq.${carId}&select=id,title,price`);
        console.log(`Car ${carId}:`, carResponse.status === 200 ? 'Found' : 'Not found');
        if (carResponse.status === 200 && carResponse.data.length > 0) {
          console.log('  Car data:', carResponse.data[0]);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRelationships();