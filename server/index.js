const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

const EMAIL_USER = "aaybukekucuk@gmail.com"; 
const EMAIL_PASS = "kgzg oyjw ditc rbeb"; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT'] }));
app.use(express.json());

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
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  
  // YENİ: OYUNLAŞTIRMA (GAMIFICATION)
  points: { type: Number, default: 0 }, // Sinefil Puanı
  rank: { type: String, default: 'Newbie 🐣' } // Rütbe
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
        
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'Viewer', verificationCode: code, isVerified: false, favorites: [], points: 0, rank: 'Newbie 🐣' });
        await newUser.save();
        
        await transporter.sendMail({ from: 'Cinemap Security', to: email, subject: 'Code', html: `<h3>${code}</h3>` });
        res.status(201).json({ message: "Code sent." });
    } catch (err) { res.status(500).json({ error: "Register failed." }); }
});

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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: "Invalid password" });
        if (!user.isVerified) return res.status(400).json({ error: "Not verified" });
        
        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET);
        // Frontend'e puan ve rütbeyi de gönderiyoruz
        res.json({ token, user }); 
    } catch (err) { res.status(500).json({ error: "Error" }); }
});

// --- FİLM EKLEME VE PUANLAMA (GÜNCELLENDİ) ---
app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();

        // KİM EKLEDİYSE ONA PUAN VER
        const user = await User.findOne({ username: req.body.addedBy });
        if (user) {
            user.points += 10; // Her film +10 XP

            // YENİ SİNEMA RÜTBELERİ
            if (user.points >= 500) user.rank = "Oscar Winner 🏆";
            else if (user.points >= 100) user.rank = "Film Critic 🧐";
            else if (user.points >= 30) user.rank = "Popcorn Lover 🍿";
            else user.rank = "Ticket Holder 🎟️";

            await user.save();
        }

        res.json({ movie: newMovie, updatedUser: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Diğer endpointler (Aynı)
app.get('/api/movies', async (req, res) => { const m = await Movie.find(); res.json(m); });
app.delete('/api/movies/:id', async (req, res) => { try { await Movie.findByIdAndDelete(req.params.id); res.json({msg:"Deleted"}); } catch(e){ res.status(500).json({error:"Error"})} });
app.put('/api/movies/:id', async (req, res) => { try { const u = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(u); } catch (err) { res.status(500).json({ error: "Update failed" }); } });

// Favorites (Aynı)
app.post('/api/users/:id/favorites', async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        const strFavorites = user.favorites.map(id => id.toString());
        if (strFavorites.includes(movieId)) user.favorites = user.favorites.filter(id => id.toString() !== movieId);
        else user.favorites.push(movieId);
        await user.save();
        res.json({ message: "Updated", favorites: user.favorites });
    } catch (err) { res.status(500).json({ error: "Error" }); }
});
app.get('/api/users/:id/favorites', async (req, res) => {
    try { const user = await User.findById(req.params.id); res.json(user.favorites); } catch (err) { res.status(500).json({ error: "Error" }); }
});
app.get('/api/users', async (req, res) => { try { const users = await User.find({}, '-password -verificationCode'); res.json(users); } catch (err) { res.status(500).json({ error: "Error" }); } });
app.delete('/api/users/:id', async (req, res) => { try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User banned" }); } catch (err) { res.status(500).json({ error: "Error" }); } });

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));