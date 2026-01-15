const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies'); // YENİ EKLENDİ

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webgis_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); // YENİ EKLENDİ - Artık /api/movies çalışacak

// Users endpoint (App.js'de fetchUsers var, onun için basit bir users rotası)
const User = require('./models/User'); // Model dosyanın yerini kontrol et
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Şifreleri gönderme
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Favorites endpoint (App.js'de fetchFavorites var)
app.get('/api/users/:id/favorites', async (req, res) => {
    try {
       // Bu kısım User modeline favorites alanı eklendikten sonra çalışır
       // Şimdilik boş dizi dönelim hata vermesin
       const user = await User.findById(req.params.id);
       res.json(user.favorites || []);
    } catch (err) {
        res.status(500).json([]);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});