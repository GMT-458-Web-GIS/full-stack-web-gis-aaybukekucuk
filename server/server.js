// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Swagger İmportları
const { swaggerUi, specs } = require('./swagger'); 

// Rota Dosyaları
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const User = require('./models/User'); // User modelini en başta çağırıyoruz

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- GÜVENLİK AYARLARI (CSP) ---
// Tarayıcının Swagger ve Harita eklentilerini engellememesi için
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// --- CHROME DEVTOOLS HATASI İÇİN KUKLA ROTA ---
// Chrome'un arka planda attığı isteği yakalayıp 200 OK dönüyoruz.
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});

// --- SWAGGER DOKÜMANTASYON ROTASI ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- MONGODB BAĞLANTISI ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webgis_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// --- API ROTALARI ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// --- EKSTRA KULLANICI ROTALARI (App.js uyumluluğu için) ---

// Tüm Kullanıcıları Getir
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Şifreleri gizle
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kullanıcının Favorilerini Getir
app.get('/api/users/:id/favorites', async (req, res) => {
    try {
       const user = await User.findById(req.params.id);
       res.json(user ? (user.favorites || []) : []);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Favori Ekleme/Çıkarma İşlemi (Toggle)
app.post('/api/users/:id/favorites', async (req, res) => {
    try {
        const { movieId } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user.favorites) user.favorites = [];

        const index = user.favorites.indexOf(movieId);
        if (index === -1) {
            user.favorites.push(movieId); // Ekle
        } else {
            user.favorites.splice(index, 1); // Çıkar
        }
        
        await user.save();
        res.json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kullanıcı Yasaklama (Silme)
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Kullanıcı yasaklandı" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUNUCUYU BAŞLAT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
});