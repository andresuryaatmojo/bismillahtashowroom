require('dotenv').config();
const { Sequelize } = require('sequelize');
const { parse } = require('pg-connection-string');

// Parse connection string untuk mendapatkan konfigurasi individual
const config = parse(process.env.DATABASE_URL);

// Konfigurasi database menggunakan Supabase PostgreSQL
const sequelize = new Sequelize({
  database: config.database,
  username: config.user,
  password: config.password,
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // Enable logging untuk debugging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Fungsi untuk test koneksi database
const testConnection = async () => {
  try {
    console.log('🚀 Menguji koneksi ke Supabase PostgreSQL...');
    console.log('📍 Host:', config.host);
    console.log('🔌 Port:', config.port);
    console.log('🗄️ Database:', config.database);
    console.log('👤 User:', config.user);
    
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil!');
    return true;
  } catch (error) {
    console.error('❌ Koneksi database gagal:', error.message);
    console.log('🔍 Periksa konfigurasi DATABASE_URL di file .env');
    return false;
  }
};

module.exports = { sequelize, testConnection };