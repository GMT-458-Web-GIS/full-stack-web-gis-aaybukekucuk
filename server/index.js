// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Modelleri Çağır
const User = require('./models/User'); 

const app = express();
app.use(cors());
app.use(express.json());

// Veritabanı Bağlantısı
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Bağlantısı Başarılı!"))
  .catch((err) => console.error("Bağlantı Hatası:", err));

// --- FILM MODELİ (Güncellendi) ---
const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: String,
    year: Number,
    genre: String,
    imdb: Number,
    poster: String,
    country: String,
    city: String,
    coordinates: { lat: Number, lng: Number },
    addedBy: String // Filmi ekleyen kullanıcının adı
});
const Movie = mongoose.model('Movie', MovieSchema);

// Gizli Anahtar (Bunu .env dosyasına da koyabilirsin ama şimdilik burada)
const JWT_SECRET = "cok_gizli_anahtar_123";

// --- 1. AUTH API (KAYIT OL & GİRİŞ YAP) ---

// KAYIT OL (Register)
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // Şifreyi Kriptola
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            role: role || 'Ziyaretçi' 
        });
        
        await newUser.save();
        res.status(201).json({ message: "Kullanıcı oluşturuldu!" });
    } catch (err) {
        res.status(500).json({ error: "Kayıt başarısız. Kullanıcı adı alınmış olabilir." });
    }
});

// GİRİŞ YAP (Login)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Kullanıcı bulunamadı!" });

        // Şifre Kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Hatalı şifre!" });

        // Token Oluştur (Kimlik Kartı)
        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET);
        
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. MOVIE API (CRUD İŞLEMLERİ) ---

// GET (Oku)
app.get('/api/movies', async (req, res) => {
    const movies = await Movie.find();
    res.json(movies);
});

// POST (Ekle)
app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.json(newMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE (Sil) - Ödev Gereksinimi
app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: "Film silindi." });
    } catch (err) {
        res.status(500).json({ error: "Silme hatası." });
    }
});

// Sunucuyu Başlat
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
});