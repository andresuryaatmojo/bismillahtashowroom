const { testConnection } = require('./src/config/database');

console.log('🚀 Menguji koneksi ke Supabase PostgreSQL...\n');

testConnection()
  .then(() => {
    console.log('\n✅ Test koneksi selesai!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test koneksi gagal:', error);
    process.exit(1);
  });