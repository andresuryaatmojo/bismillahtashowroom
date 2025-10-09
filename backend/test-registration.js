const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const testData = {
      fullName: 'Test User',
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      phoneNumber: '081234567890',
      password: 'TestPassword123',
      role: 'buyer'
    };
    
    console.log('Sending data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testData);
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
}

testRegistration();