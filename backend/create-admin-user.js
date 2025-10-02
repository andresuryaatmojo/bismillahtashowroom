const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminData = {
      username: 'admin',
      email: 'admin@mobilindo.com',
      password: hashedPassword,
      role: 'admin',
      full_name: 'Administrator',
      is_verified: true,
      is_active: true
    };

    const { data, error } = await supabase
      .from('users')
      .insert([adminData])
      .select();

    if (error) {
      console.error('❌ Error creating admin user:', error.message);
      return;
    }

    if (data) {
      console.log('✅ Admin user created successfully!');
      console.log('Admin details:', data[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();