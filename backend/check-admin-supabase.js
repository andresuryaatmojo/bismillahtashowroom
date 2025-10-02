const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user via Supabase API...');
    
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', 'admin@mobilindo.com')
      .single();

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return;
    }

    if (data) {
      console.log('✅ Admin user found!');
      console.log('Admin details:');
      console.log('- ID:', data.id);
      console.log('- Username:', data.username);
      console.log('- Email:', data.email);
      console.log('- Role:', data.role);
      console.log('- Full Name:', data.fullName);
      console.log('- Is Active:', data.isActive);
      console.log('- Is Verified:', data.isVerified);
      console.log('- Created At:', data.createdAt);
    } else {
      console.log('❌ No admin user found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUser();