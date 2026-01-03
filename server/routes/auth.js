const express = require('express');
const router = express.Router();
const User = require('../models/User');

// KAYIT OLMA (SIGN-UP) ROTASI
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });

    // Yeni kullanıcı oluştur
    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GİRİŞ YAPMA (LOGIN) ROTASI
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı." });

    // Şifre kontrolü (Şimdilik düz metin, ileride şifreleyeceğiz)
    if (user.password !== password) {
      return res.status(400).json({ message: "Hatalı şifre." });
    }

    res.status(200).json({ 
      message: "Giriş başarılı!", 
      user: { username: user.username, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;