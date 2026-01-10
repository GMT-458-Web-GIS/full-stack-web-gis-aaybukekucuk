const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Yeni Paket
require('dotenv').config();

const app = express();

// --- MAİL AYARLARI (GMAIL) ---

const EMAIL_USER = "aaybukekucuk@gmail.com"; 
const EMAIL_PASS = "kgzg oyjw ditc rbeb"; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT'] }));
app.use(express.json());

// Loglama
app.use((req, res, next) => {
    console.log(`📩 ${req.method} ${req.url}`);
    next();
});

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Bağlantısı Başarılı!"))
  .catch((err) => console.error("❌ Veritabanı Hatası:", err));

// --- MODELLER ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Ziyaretçi' },
  // YENİ GÜVENLİK ALANLARI:
  isVerified: { type: Boolean, default: false }, // Onaylı mı?
  verificationCode: { type: String } // 6 Haneli Kod
});
const User = mongoose.model('User', UserSchema);

const MovieSchema = new mongoose.Schema({
    title: String,
    director: String,
    year: Number,
    genre: String,
    imdb: Number,
    poster: String,
    country: String,
    city: String,
    coordinates: { lat: Number, lng: Number },
    addedBy: String
});
const Movie = mongoose.model('Movie', MovieSchema);

const JWT_SECRET = "cok_gizli_anahtar_123";

// --- API YOLLARI ---

// 1. KAYIT OL (Kod Gönder)
app.post('/api/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Rastgele 6 haneli kod üret
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Eski kaydı sil (Eğer onaylanmamışsa)
        await User.deleteOne({ email, isVerified: false });

        const newUser = new User({ 
            email, 
            password: hashedPassword, 
            role: role || 'Ziyaretçi',
            verificationCode: code,
            isVerified: false 
        });
        
        await newUser.save();

        // Mail Gönder
        await transporter.sendMail({
            from: 'Cinemap Güvenlik <no-reply@cinemap.com>',
            to: email,
            subject: 'Cinemap Onay Kodunuz',
            text: `Hoşgeldiniz! Giriş yapmak için onay kodunuz: ${code}`
        });

        console.log(`✉️ Mail gönderildi: ${email} -> Kod: ${code}`);
        res.status(201).json({ message: "Onay kodu maile gönderildi!" });

    } catch (err) {
        console.error("Kayıt Hatası:", err);
        res.status(500).json({ error: "Mail gönderilemedi veya kullanıcı zaten var." });
    }
});

// 2. KODU DOĞRULA (Verify)
app.post('/api/verify', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Kullanıcı bulunamadı." });

        if (user.verificationCode === code) {
            user.isVerified = true;
            user.verificationCode = null; // Kodu temizle
            await user.save();
            res.json({ message: "Hesap onaylandı! Giriş yapabilirsiniz." });
        } else {
            res.status(400).json({ error: "Hatalı Kod!" });
        }
    } catch (err) {
        res.status(500).json({ error: "Doğrulama hatası." });
    }
});

// 3. GİRİŞ YAP (Sadece Onaylıysa)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Kullanıcı bulunamadı!" });

        // Şifre Kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Hatalı şifre!" });

        // ONAY KONTROLÜ
        if (!user.isVerified) {
            return res.status(400).json({ error: "Lütfen önce mailinize gelen kod ile hesabınızı doğrulayın." });
        }

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET);
        res.json({ token, user: { username: user.email, role: user.role } }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Diğer API'ler (Movies)
app.get('/api/movies', async (req, res) => { const m = await Movie.find(); res.json(m); });
app.post('/api/movies', async (req, res) => { try { const n = new Movie(req.body); await n.save(); res.json(n); } catch(e){ res.status(500).json({error:e.message})} });
app.delete('/api/movies/:id', async (req, res) => { try { await Movie.findByIdAndDelete(req.params.id); res.json({msg:"Silindi"}); } catch(e){ res.status(500).json({error:"Hata"})} });

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor...`));