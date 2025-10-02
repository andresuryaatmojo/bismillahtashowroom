const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordHash() {
  try {
    console.log('🔍 Testing admin password hash...');
    
    // Get admin user from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@mobilindo.com')
      .single();

    if (error) {
      console.error('❌ Error getting admin user:', error.message);
      return;
    }

    if (!data) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found');
    console.log('Password hash from DB:', data.password);
    
    // Test password verification
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, data.password);
    
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    // Generate new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash for comparison:', newHash);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordHash();