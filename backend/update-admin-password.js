const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminPassword() {
  try {
    console.log('🔍 Updating admin password...');
    
    // Generate correct hash for admin123
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('New password hash:', hashedPassword);
    
    // Update admin user password
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', 'admin@mobilindo.com')
      .select();

    if (error) {
      console.error('❌ Error updating admin password:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Admin password updated successfully!');
      
      // Verify the new password
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log('Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('❌ No admin user found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAdminPassword();