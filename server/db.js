const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. PostgreSQL (PostGIS) Bağlantısı
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Bağlantıyı test etmek için küçük bir sorgu gönderiyoruz
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL bağlantı hatası:', err.message);
  } else {
    console.log('✅ PostgreSQL (PostGIS) bağlantısı başarılı!');
  }
});

// 2. MongoDB (NoSQL) Bağlantısı
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB (NoSQL) bağlantısı başarılı!');
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
  }
};

module.exports = { pool, connectMongoDB };