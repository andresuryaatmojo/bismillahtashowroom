const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'testuser_api',
  email: 'testuser_api@example.com',
  password: 'testpassword123',
  fullName: 'Test User API'
};

const testCar = {
  brand: 'Toyota',
  model: 'Camry',
  year: 2020,
  price: 350000000,
  mileage: 25000,
  transmission: 'automatic',
  fuelType: 'gasoline',
  description: 'Mobil sedan mewah dalam kondisi sangat baik',
  location: 'Jakarta'
};

let authToken = '';
let userId = '';
let carId = '';

async function testAPIEndpoints() {
  console.log('🚀 Starting API Endpoints Testing...\n');

  try {
    // Test 1: Register User
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (registerResponse.data.success) {
      console.log('✅ User registration successful');
      authToken = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      console.log(`   User ID: ${userId}`);
    } else {
      throw new Error('Registration failed');
    }

    // Test 2: Login User
    console.log('\n2. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResponse.data.success) {
      console.log('✅ User login successful');
      authToken = loginResponse.data.data.token; // Update token
      console.log(`   New Token: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('Login failed');
    }

    // Test 3: Get User Profile
    console.log('\n3. Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (profileResponse.data.success) {
      console.log('✅ Get profile successful');
      console.log(`   Username: ${profileResponse.data.data.username}`);
      console.log(`   Email: ${profileResponse.data.data.email}`);
    } else {
      throw new Error('Get profile failed');
    }

    // Test 4: Create Car
    console.log('\n4. Testing Create Car...');
    const createCarResponse = await axios.post(`${BASE_URL}/cars`, testCar, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (createCarResponse.data.success) {
      console.log('✅ Car creation successful');
      carId = createCarResponse.data.data.id;
      console.log(`   Car ID: ${carId}`);
      console.log(`   Brand: ${createCarResponse.data.data.brand}`);
      console.log(`   Model: ${createCarResponse.data.data.model}`);
    } else {
      throw new Error('Car creation failed');
    }

    // Test 5: Get All Cars
    console.log('\n5. Testing Get All Cars...');
    const getAllCarsResponse = await axios.get(`${BASE_URL}/cars?page=1&limit=5`);
    
    if (getAllCarsResponse.data.success) {
      console.log('✅ Get all cars successful');
      console.log(`   Total cars found: ${getAllCarsResponse.data.data.cars.length}`);
      console.log(`   Current page: ${getAllCarsResponse.data.data.pagination.currentPage}`);
    } else {
      throw new Error('Get all cars failed');
    }

    // Test 6: Get Car by ID
    console.log('\n6. Testing Get Car by ID...');
    const getCarResponse = await axios.get(`${BASE_URL}/cars/${carId}`);
    
    if (getCarResponse.data.success) {
      console.log('✅ Get car by ID successful');
      console.log(`   Car: ${getCarResponse.data.data.brand} ${getCarResponse.data.data.model}`);
      console.log(`   View count: ${getCarResponse.data.data.viewCount}`);
    } else {
      throw new Error('Get car by ID failed');
    }

    // Test 7: Update Car
    console.log('\n7. Testing Update Car...');
    const updateCarData = {
      price: 340000000,
      description: 'Updated description - Mobil sedan mewah dengan harga terbaik'
    };
    
    const updateCarResponse = await axios.put(`${BASE_URL}/cars/${carId}`, updateCarData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (updateCarResponse.data.success) {
      console.log('✅ Car update successful');
      console.log(`   New price: ${updateCarResponse.data.data.price}`);
      console.log(`   New description: ${updateCarResponse.data.data.description}`);
    } else {
      throw new Error('Car update failed');
    }

    // Test 8: Get Cars by Seller
    console.log('\n8. Testing Get Cars by Seller...');
    const getCarsBySellerResponse = await axios.get(`${BASE_URL}/cars/seller/${userId}`);
    
    if (getCarsBySellerResponse.data.success) {
      console.log('✅ Get cars by seller successful');
      console.log(`   Cars by seller: ${getCarsBySellerResponse.data.data.cars.length}`);
    } else {
      throw new Error('Get cars by seller failed');
    }

    // Test 9: Search Cars
    console.log('\n9. Testing Search Cars...');
    const searchResponse = await axios.get(`${BASE_URL}/cars/search?q=Toyota`);
    
    if (searchResponse.data.success) {
      console.log('✅ Search cars successful');
      console.log(`   Search results: ${searchResponse.data.data.cars.length}`);
    } else {
      throw new Error('Search cars failed');
    }

    // Test 10: Get Car Statistics
    console.log('\n10. Testing Get Car Statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/cars/stats`);
    
    if (statsResponse.data.success) {
      console.log('✅ Get car statistics successful');
      console.log(`   Total cars: ${statsResponse.data.data.totalCars}`);
      console.log(`   Available cars: ${statsResponse.data.data.availableCars}`);
    } else {
      throw new Error('Get car statistics failed');
    }

    // Test 11: Update User Profile
    console.log('\n11. Testing Update User Profile...');
    const updateProfileData = {
      fullName: 'Updated Test User API',
      phoneNumber: '081234567890'
    };
    
    const updateProfileResponse = await axios.put(`${BASE_URL}/users/profile`, updateProfileData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (updateProfileResponse.data.success) {
      console.log('✅ Update user profile successful');
      console.log(`   New full name: ${updateProfileResponse.data.data.fullName}`);
      console.log(`   New phone: ${updateProfileResponse.data.data.phoneNumber}`);
    } else {
      throw new Error('Update user profile failed');
    }

    // Test 12: Get User Statistics
    console.log('\n12. Testing Get User Statistics...');
    const userStatsResponse = await axios.get(`${BASE_URL}/users/profile/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (userStatsResponse.data.success) {
      console.log('✅ Get user statistics successful');
      console.log(`   Total cars: ${userStatsResponse.data.data.totalCars}`);
      console.log(`   Available cars: ${userStatsResponse.data.data.availableCars}`);
    } else {
      throw new Error('Get user statistics failed');
    }

    // Test 13: Approve Car (Admin function)
    console.log('\n13. Testing Approve Car...');
    const approveCarResponse = await axios.put(`${BASE_URL}/cars/${carId}/approve`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (approveCarResponse.data.success) {
      console.log('✅ Car approval successful');
      console.log(`   Car approved: ${approveCarResponse.data.data.isApproved}`);
    } else {
      throw new Error('Car approval failed');
    }

    console.log('\n🧹 Cleaning up test data...');

    // Cleanup: Delete Car
    console.log('   Deleting test car...');
    const deleteCarResponse = await axios.delete(`${BASE_URL}/cars/${carId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (deleteCarResponse.data.success) {
      console.log('   ✅ Test car deleted successfully');
    }

    // Cleanup: Delete User
    console.log('   Deleting test user...');
    const deleteUserResponse = await axios.delete(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (deleteUserResponse.data.success) {
      console.log('   ✅ Test user deleted successfully');
    }

    console.log('\n🎉 All API endpoint tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }

    // Attempt cleanup even if tests failed
    if (carId && authToken) {
      try {
        console.log('\n🧹 Attempting cleanup after failure...');
        await axios.delete(`${BASE_URL}/cars/${carId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ✅ Test car cleaned up');
      } catch (cleanupError) {
        console.log('   ⚠️ Could not clean up test car');
      }
    }

    if (authToken) {
      try {
        await axios.delete(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ✅ Test user cleaned up');
      } catch (cleanupError) {
        console.log('   ⚠️ Could not clean up test user');
      }
    }

    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5000/');
    if (response.data.success) {
      console.log('✅ Server is running and accessible');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('   Please make sure the backend server is running on port 5000');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server status...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await testAPIEndpoints();
  } else {
    process.exit(1);
  }
}

main();