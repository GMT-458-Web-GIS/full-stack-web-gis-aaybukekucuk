const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./db'); // Az önce oluşturduğumuz db.js'i buraya çağırdık

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı Bağlantılarını Başlat
connectMongoDB();

// Ana Sayfa Rotası
app.get('/', (req, res) => {
  res.send('Cinemap Backend Sunucusu ve Veritabanları Aktif!');
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde yayında.`);
});