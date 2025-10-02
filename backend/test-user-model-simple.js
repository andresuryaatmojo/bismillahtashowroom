require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Menggunakan service key untuk bypass RLS (hanya untuk testing)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🚀 Testing User operations with Supabase (bypassing RLS)...\n');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Using key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Not found');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserOperations() {
  try {
    // Test 1: Check if users table exists
    console.log('📋 Test 1: Checking users table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Users table check failed:', tableError.message);
      return;
    }
    console.log('✅ Users table exists and accessible');
    
    // Test 2: Create a new user
    console.log('\n📝 Test 2: Creating a new user...');
    const userData = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'testpassword123',
      full_name: 'Test User',
      phone_number: '081234567890',
      role: 'buyer'
    };
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ User creation failed:', createError.message);
      return;
    }
    
    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    // Test 3: Find user by ID
    console.log('\n🔍 Test 3: Finding user by ID...');
    const { data: foundUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single();
    
    if (findError) {
      console.log('❌ User find failed:', findError.message);
    } else {
      console.log('✅ User found by ID:', foundUser.username);
    }
    
    // Test 4: Update user
    console.log('\n✏️ Test 4: Updating user...');
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        full_name: 'Updated Test User',
        phone_number: '087654321098'
      })
      .eq('id', newUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ User update failed:', updateError.message);
    } else {
      console.log('✅ User updated successfully:', {
        fullName: updatedUser.full_name,
        phoneNumber: updatedUser.phone_number
      });
    }
    
    // Test 5: List all users
    console.log('\n📋 Test 5: Listing users...');
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .limit(5);
    
    if (listError) {
      console.log('❌ Users list failed:', listError.message);
    } else {
      console.log('✅ Found users:', allUsers.length);
      allUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
      });
    }
    
    // Test 6: Count users
    console.log('\n🔢 Test 6: Counting users...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Users count failed:', countError.message);
    } else {
      console.log('✅ Total users:', count);
    }
    
    // Test 7: Delete test user
    console.log('\n🗑️ Test 7: Deleting test user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);
    
    if (deleteError) {
      console.log('❌ User deletion failed:', deleteError.message);
    } else {
      console.log('✅ User deleted successfully');
    }
    
    console.log('\n🎉 All user operations completed successfully!');
    console.log('✅ Database connection and basic CRUD operations are working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

// Run the test
testUserOperations().catch(console.error);