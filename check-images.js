// check-images.js
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

async function checkImages() {
  console.log('🔍 Checking trade-in images data...');

  try {
    // Get all trade-in requests with their images
    const response = await makeRequest('trade_in_requests?select=id,old_car_brand,old_car_model,trade_in_images(*)');

    if (response.status === 200) {
      console.log('✅ Got trade-in data with images:');
      response.data.forEach((item, index) => {
        console.log(`${index + 1}. Trade-in ID: ${item.id}`);
        console.log(`   Car: ${item.old_car_brand} ${item.old_car_model}`);
        console.log(`   Images count: ${item.trade_in_images?.length || 0}`);

        if (item.trade_in_images && item.trade_in_images.length > 0) {
          item.trade_in_images.forEach((img, imgIndex) => {
            console.log(`   ${imgIndex + 1}. ${img.image_url}`);
          });
        } else {
          console.log('   No images found');
        }
        console.log('');
      });
    } else {
      console.log('❌ Failed to get data:', response.data);
    }

    // Also check images table directly
    console.log('📁 Checking trade_in_images table directly...');
    const imagesResponse = await makeRequest('trade_in_images?select=*&limit=10');

    if (imagesResponse.status === 200) {
      console.log(`Total images in table: ${imagesResponse.data.length}`);
      imagesResponse.data.forEach((img, index) => {
        console.log(`${index + 1}. ID: ${img.id}, Trade-in ID: ${img.trade_in_id}`);
        console.log(`   URL: ${img.image_url}`);
        console.log(`   Type: ${img.image_type}, Caption: ${img.caption}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkImages();