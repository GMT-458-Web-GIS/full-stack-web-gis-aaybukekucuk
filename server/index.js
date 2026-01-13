const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// --- MAIL SETTINGS (Kendi bilgilerini buraya yaz) ---
const EMAIL_USER = "aaybukekucuk@gmail.com"; 
const EMAIL_PASS = "kgzg oyjw ditc rbeb"; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT'] }));
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`📩 REQUEST: ${req.method} ${req.url}`);
    next();
});

// Database
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.error("❌ DB Error:", err));

// --- MODELS ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Viewer', enum: ['Admin', 'Cinephile', 'Viewer'] },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }] 
});
const User = mongoose.model('User', UserSchema);

const MovieSchema = new mongoose.Schema({
    title: String, director: String, year: Number, genre: String, imdb: Number,
    poster: String, country: String, city: String, coordinates: { lat: Number, lng: Number },
    addedBy: String
});
const Movie = mongoose.model('Movie', MovieSchema);

const JWT_SECRET = "secret_key_123";

// --- ROUTES ---

// REGISTER
app.post('/api/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.isVerified) return res.status(400).json({ error: "User exists." });
            else await User.deleteOne({ _id: existingUser._id });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'Viewer', verificationCode: code, isVerified: false, favorites: [] });
        await newUser.save();
        
        await transporter.sendMail({
            from: 'Cinemap Security', to: email, subject: 'Cinemap Code',
            html: `<h3>Code: <span style="color:red">${code}</span></h3>`
        });
        res.status(201).json({ message: "Code sent." });
    } catch (err) { res.status(500).json({ error: "Register failed." }); }
});

// VERIFY
app.post('/api/verify', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.verificationCode !== code) return res.status(400).json({ error: "Invalid Code" });
        user.isVerified = true; user.verificationCode = null;
        await user.save();
        res.json({ message: "Verified" });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: "Invalid password" });
        if (!user.isVerified) return res.status(400).json({ error: "Not verified" });
        
        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET);
        
        res.json({ 
            token, 
            user: { 
                _id: user._id, 
                username: user.username, 
                role: user.role, 
                email: user.email,
                favorites: user.favorites 
            } 
        }); 
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// --- FAVORİ EKLE / ÇIKAR (DÜZELTİLDİ) ---
app.post('/api/users/:id/favorites', async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        
        // HATA ÇÖZÜMÜ: ID'leri String'e çevirerek karşılaştır
        // Böylece ObjectId("123") ile "123" aynı kabul edilir.
        const strFavorites = user.favorites.map(id => id.toString());

        if (strFavorites.includes(movieId)) {
            // VARSA ÇIKAR
            user.favorites = user.favorites.filter(id => id.toString() !== movieId);
        } else {
            // YOKSA EKLE
            user.favorites.push(movieId);
        }
        
        await user.save();
        res.json({ message: "Updated", favorites: user.favorites });
        
    } catch (err) {
        console.error("Fav Error:", err);
        res.status(500).json({ error: "Could not update favorites" });
    }
});

app.get('/api/users/:id/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user.favorites);
    } catch (err) { res.status(500).json({ error: "Error" }); }
});


// MOVIE ROUTES
app.get('/api/movies', async (req, res) => { const m = await Movie.find(); res.json(m); });
app.post('/api/movies', async (req, res) => { try { const n = new Movie(req.body); await n.save(); res.json(n); } catch(e){ res.status(500).json({error:e.message})} });
app.delete('/api/movies/:id', async (req, res) => { try { await Movie.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); } catch(e){ res.status(500).json({error:"Error"})} });
app.put('/api/movies/:id', async (req, res) => {
    try { const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updatedMovie); } 
    catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// ADMIN ROUTES
app.get('/api/users', async (req, res) => {
    try { const users = await User.find({}, '-password -verificationCode'); res.json(users); } 
    catch (err) { res.status(500).json({ error: "Error" }); }
});
app.delete('/api/users/:id', async (req, res) => {
    try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User banned" }); }
    catch (err) { res.status(500).json({ error: "Error" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));