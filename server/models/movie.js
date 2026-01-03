const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  year: Number,
  country: { type: String, required: true }, // Merak ettiğin ülke bilgisi burada!
  genre: String,
  imdbRating: Number,
  posterUrl: String, // Filmin afiş linki
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', movieSchema);