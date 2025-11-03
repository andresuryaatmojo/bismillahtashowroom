// test-query-relationship.js
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
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (err) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testQueryRelationships() {
  console.log('🔍 Testing query relationships for trade-in with images...');

  try {
    // Test the exact query used in LayananTradeIn.ts
    console.log('\n1. Testing exact query from LayananTradeIn.ts:');
    const complexQuery = 'trade_in_requests?select=*,new_car:cars(id,title,price,brand_id,model_id,year),trade_in_images(*).order(created_at.desc)';
    const response = await makeRequest(complexQuery);

    if (response.status === 200) {
      console.log('✅ Query successful!');
      console.log(`Found ${response.data.length} records:`);

      response.data.forEach((item, index) => {
        console.log(`\n${index + 1}. Trade-in ID: ${item.id}`);
        console.log(`   Car: ${item.old_car_brand} ${item.old_car_model}`);
        console.log(`   Status: ${item.status}`);
        console.log(`   New car: ${item.new_car?.title || 'N/A'}`);
        console.log(`   Images count: ${item.trade_in_images?.length || 0}`);

        if (item.trade_in_images && item.trade_in_images.length > 0) {
          console.log('   Images:');
          item.trade_in_images.forEach((img, imgIndex) => {
            console.log(`     ${imgIndex + 1}. ${img.caption} - ${img.image_url}`);
          });
        } else {
          console.log('   No images');
        }
      });
    } else {
      console.log('❌ Query failed:', response.data);
    }

    // Test alternative query with explicit relationship
    console.log('\n\n2. Testing alternative query approach:');
    const altQuery = 'trade_in_requests?select=*,new_car:cars(id,title,price),trade_in_images!inner(*)';
    const altResponse = await makeRequest(altQuery);

    if (altResponse.status === 200) {
      console.log('✅ Alternative query successful!');
      console.log(`Found ${altResponse.data.length} records (only those with images)`);

      altResponse.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.old_car_brand} ${item.old_car_model} - ${item.trade_in_images?.length || 0} images`);
      });
    } else {
      console.log('❌ Alternative query failed:', altResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQueryRelationships();