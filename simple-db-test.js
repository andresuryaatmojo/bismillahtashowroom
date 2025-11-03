// simple-db-test.js
const https = require('https');

// Simple test to check Supabase REST API
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

async function testTradeInTable() {
  console.log('🔍 Testing trade_in_requests table...');

  try {
    // Test basic table access
    const response = await makeRequest('trade_in_requests?select=id&limit=1');
    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Table exists and is accessible');
      console.log('Data:', response.data);

      // Get count
      const countResponse = await makeRequest('trade_in_requests?select=count');
      console.log('Count response:', countResponse);

      // Get actual data
      const dataResponse = await makeRequest('trade_in_requests?select=*&order=created_at.desc&limit=5');
      console.log('Sample data:');
      console.log(JSON.stringify(dataResponse.data, null, 2));

    } else if (response.status === 406) {
      console.log('✅ Table exists but no data');
    } else {
      console.log('❌ Table access failed');
      console.log('Response:', response.data);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testTradeInTable();