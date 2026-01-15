const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// TÜM FİLMLERİ GETİR (GET /api/movies)
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// YENİ FİLM EKLE (POST /api/movies)
router.post('/', async (req, res) => {
  const { title, year, director, poster, genre, imdb, country, city, lat, lng, addedBy } = req.body;

  try {
    const newMovie = new Movie({
      title, year, director, poster, genre, imdb, country, city, addedBy,
      coordinates: { lat, lng }, // Frontend için
      location: { type: 'Point', coordinates: [lng, lat] } // GIS analizi için GeoJSON
    });

    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// FİLM SİL (DELETE /api/movies/:id)
router.delete('/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Film silindi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FİLM GÜNCELLE (PUT /api/movies/:id)
router.put('/:id', async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MEDYA EKLE (POST /api/movies/:id/media)
router.post('/:id/media', async (req, res) => {
  try {
    const { type, url, addedBy } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film bulunamadı" });

    movie.media.push({ type, url, addedBy });
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;