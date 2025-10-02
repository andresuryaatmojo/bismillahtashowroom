require('dotenv').config();
const { User } = require('./src/models/supabase');

async function testUserModel() {
  console.log('🚀 Testing User model with Supabase...\n');
  
  try {
    // Test 1: Create a new user
    console.log('📝 Test 1: Creating a new user...');
    const userData = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'testpassword123',
      fullName: 'Test User',
      phoneNumber: '081234567890',
      role: 'buyer'
    };
    
    const newUser = await User.create(userData);
    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    // Test 2: Find user by ID
    console.log('\n🔍 Test 2: Finding user by ID...');
    const foundUser = await User.findById(newUser.id);
    if (foundUser) {
      console.log('✅ User found by ID:', foundUser.username);
    } else {
      console.log('❌ User not found by ID');
    }
    
    // Test 3: Find user by email
    console.log('\n📧 Test 3: Finding user by email...');
    const userByEmail = await User.findByEmail(userData.email);
    if (userByEmail) {
      console.log('✅ User found by email:', userByEmail.username);
    } else {
      console.log('❌ User not found by email');
    }
    
    // Test 4: Verify password
    console.log('\n🔐 Test 4: Testing password verification...');
    const isValidPassword = await foundUser.verifyPassword('testpassword123');
    const isInvalidPassword = await foundUser.verifyPassword('wrongpassword');
    console.log('✅ Valid password check:', isValidPassword);
    console.log('✅ Invalid password check:', !isInvalidPassword);
    
    // Test 5: Update user
    console.log('\n✏️ Test 5: Updating user...');
    foundUser.fullName = 'Updated Test User';
    foundUser.phoneNumber = '087654321098';
    await foundUser.save();
    
    const updatedUser = await User.findById(newUser.id);
    console.log('✅ User updated successfully:', {
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber
    });
    
    // Test 6: List all users
    console.log('\n📋 Test 6: Listing all users...');
    const allUsers = await User.findAll({ limit: 5 });
    console.log('✅ Found users:', allUsers.length);
    
    // Test 7: Count users
    console.log('\n🔢 Test 7: Counting users...');
    const userCount = await User.count();
    console.log('✅ Total users:', userCount);
    
    // Test 8: Delete user
    console.log('\n🗑️ Test 8: Deleting test user...');
    await foundUser.delete();
    
    const deletedUser = await User.findById(newUser.id);
    if (!deletedUser) {
      console.log('✅ User deleted successfully');
    } else {
      console.log('❌ User deletion failed');
    }
    
    console.log('\n🎉 All User model tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ User model test failed:', error.message);
    console.error('🔍 Error details:', error);
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Make sure you have run the create-tables.sql script in Supabase');
    console.log('2. Check if the users table exists in your database');
    console.log('3. Verify RLS policies allow the operations');
    console.log('4. Check your Supabase URL and API key configuration');
  }
}

// Run the test
testUserModel().catch(console.error);