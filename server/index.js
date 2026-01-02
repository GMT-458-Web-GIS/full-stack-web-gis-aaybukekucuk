const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware (Ara Yazılımlar)
app.use(cors());
app.use(express.json());

// Temel Test Rotası
app.get('/', (req, res) => {
  res.send('Cinemap Backend Sunucusu Hazır!');
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});