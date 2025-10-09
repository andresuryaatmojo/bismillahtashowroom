const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseAuth() {
  console.log('🚀 Testing Supabase Auth Integration...\n');

  try {
    // Test 1: Register new user
    console.log('1. Testing user registration...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'TestPassword123',
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser',
          phone_number: '+6281234567890',
          role: 'buyer'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Registration error:', signUpError.message);
    } else {
      console.log('✅ Registration successful');
      console.log('   User ID:', signUpData.user?.id);
      console.log('   Email:', signUpData.user?.email);
    }

    // Test 2: Check if profile was created
    if (signUpData.user) {
      console.log('\n2. Checking if profile was created...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile check error:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
        console.log('   Profile:', profile);
      }
    }

    // Test 3: Login
    console.log('\n3. Testing user login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'TestPassword123'
    });

    if (signInError) {
      console.log('❌ Login error:', signInError.message);
    } else {
      console.log('✅ Login successful');
      console.log('   Session:', !!signInData.session);
      console.log('   User:', signInData.user?.email);
    }

    // Test 4: Logout
    console.log('\n4. Testing logout...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.log('❌ Logout error:', signOutError.message);
    } else {
      console.log('✅ Logout successful');
    }

    console.log('\n🎉 Supabase Auth integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabaseAuth();