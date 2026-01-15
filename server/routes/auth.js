// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Şifreleme için
const jwt = require('jsonwebtoken'); // Token oluşturmak için
const User = require('../models/User');

// KAYIT OL (REGISTER)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış." });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Yeni kullanıcı oluştur (Rol verisiyle beraber)
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'Ziyaretçi' // Frontend boş yollarsa varsayılan Ziyaretçi olsun
    });

    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu." });

  } catch (error) {
    res.status(500).json({ message: "Kayıt sırasında hata oluştu.", error });
  }
});

// GİRİŞ YAP (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Hatalı şifre." });

    // Token oluştur (Rol bilgisini token içine gömüyoruz)
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      'GIZLI_ANAHTAR_BURAYA', // .env dosyasında saklanmalı
      { expiresIn: '1h' }
    );

    res.status(200).json({ result: user, token });

  } catch (error) {
    res.status(500).json({ message: "Giriş sırasında hata oluştu.", error });
  }
});

module.exports = router;