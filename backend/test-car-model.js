require('dotenv').config();
const Car = require('./src/models/supabase/Car');
const User = require('./src/models/supabase/User');

console.log('🚗 Testing Car model with Supabase...\n');

async function testCarModel() {
  let testUser = null;
  let testCar = null;

  try {
    // Buat user test terlebih dahulu (sebagai seller)
    console.log('👤 Creating test user (seller)...');
    testUser = await User.create({
      username: 'seller_' + Date.now(),
      email: 'seller_' + Date.now() + '@example.com',
      password: 'testpassword123',
      fullName: 'Test Seller',
      phoneNumber: '081234567890',
      role: 'seller'
    });
    console.log('✅ Test user created:', testUser.username);

    // Test 1: Creating a new car
    console.log('\n📝 Test 1: Creating a new car...');
    const carData = {
      sellerId: testUser.id,
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 300000000,
      condition: 'used',
      mileage: 50000,
      color: 'Silver',
      transmission: 'automatic',
      fuelType: 'gasoline',
      engineCapacity: 2500,
      description: 'Well maintained Toyota Camry',
      features: ['ABS', 'Airbags', 'AC'],
      location: 'Jakarta',
      status: 'available'
    };

    testCar = await Car.create(carData);
    console.log('✅ Car created successfully:', {
      id: testCar.id,
      brand: testCar.brand,
      model: testCar.model,
      price: testCar.price
    });

    // Test 2: Finding car by ID
    console.log('\n🔍 Test 2: Finding car by ID...');
    const foundCar = await Car.findById(testCar.id);
    if (foundCar) {
      console.log('✅ Car found by ID:', foundCar.brand + ' ' + foundCar.model);
    } else {
      console.log('❌ Car not found by ID');
    }

    // Test 3: Finding cars by seller ID
    console.log('\n👤 Test 3: Finding cars by seller ID...');
    const sellerCars = await Car.findBySellerId(testUser.id);
    console.log('✅ Found cars by seller:', sellerCars.length);

    // Test 4: Search cars
    console.log('\n🔍 Test 4: Searching cars...');
    const searchResults = await Car.searchCars({
      brand: 'Toyota',
      minPrice: 400000000,
      maxPrice: 500000000
    });
    console.log('✅ Search results:', searchResults.length);

    // Test 5: Find available cars
    console.log('\n📋 Test 5: Finding available cars...');
    const availableCars = await Car.findAvailable();
    console.log('✅ Available cars:', availableCars.length);

    // Test 6: Update car
    console.log('\n✏️ Test 6: Updating car...');
    testCar.price = 425000000;
    testCar.description = 'Updated: Toyota Camry 2022 - Price reduced!';
    await testCar.save();
    console.log('✅ Car updated successfully:', {
      newPrice: testCar.price,
      description: testCar.description.substring(0, 50) + '...'
    });

    // Test 7: Add view
    console.log('\n👁️ Test 7: Adding view to car...');
    const initialViews = testCar.viewCount;
    await testCar.incrementViewCount();
    console.log('✅ View added:', `${initialViews} -> ${testCar.viewCount}`);

    // Test 8: Approve car
    console.log('\n✅ Test 8: Approving car...');
    await testCar.approve();
    console.log('✅ Car approved, status:', testCar.status);

    // Test 9: Count cars
    console.log('\n🔢 Test 9: Counting cars...');
    const totalCars = await Car.count();
    console.log('✅ Total cars:', totalCars);

    // Test 10: Find all cars with pagination
    console.log('\n📋 Test 10: Finding all cars with pagination...');
    const allCars = await Car.findAll({ limit: 5, offset: 0 });
    console.log('✅ Found cars (paginated):', allCars.length);
    allCars.forEach(car => {
      console.log(`  - ${car.brand} ${car.model} (${car.year}) - Rp ${car.price.toLocaleString()}`);
    });

    console.log('\n🎉 All Car model tests completed successfully!');
    console.log('✅ Database connection and Car CRUD operations are working');

  } catch (error) {
    console.error('\n❌ Car model test failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    // Cleanup: Delete test data
    try {
      if (testCar) {
        console.log('\n🧹 Cleaning up: Deleting test car...');
        await testCar.delete();
        console.log('✅ Test car deleted');
      }
      
      if (testUser) {
        console.log('🧹 Cleaning up: Deleting test user...');
        await testUser.delete();
        console.log('✅ Test user deleted');
      }
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
  }
}

// Run the test
testCarModel().catch(console.error);