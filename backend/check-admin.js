const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAdminUser() {
  try {
    const result = await pool.query('SELECT * FROM "Users" WHERE email = $1', ['admin@mobilindo.com']);
    
    console.log('Admin user found:', result.rows.length > 0 ? 'YES' : 'NO');
    
    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('Admin details:');
      console.log('- ID:', admin.id);
      console.log('- Username:', admin.username);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Full Name:', admin.fullName);
      console.log('- Is Active:', admin.isActive);
      console.log('- Is Verified:', admin.isVerified);
      console.log('- Created At:', admin.createdAt);
    } else {
      console.log('No admin user found. Need to run migration or create admin user.');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminUser();