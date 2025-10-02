const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user via Supabase API...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@mobilindo.com');

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Admin user found!');
      console.log('Admin details:');
      console.log('- ID:', data[0].id);
      console.log('- Username:', data[0].username);
      console.log('- Email:', data[0].email);
      console.log('- Role:', data[0].role);
      console.log('- Full Name:', data[0].full_name);
      console.log('- Created At:', data[0].created_at);
    } else {
      console.log('❌ No admin user found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUser();