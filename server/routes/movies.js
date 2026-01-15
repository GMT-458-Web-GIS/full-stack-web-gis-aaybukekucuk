const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - coordinates
 *       properties:
 *         title:
 *           type: string
 *           description: Filmin başlığı
 *         year:
 *           type: string
 *           description: Yapım yılı
 *         director:
 *           type: string
 *         poster:
 *           type: string
 *         genre:
 *           type: string
 *         imdb:
 *           type: number
 *         country:
 *           type: string
 *         city:
 *           type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               example: 35.6762
 *             lng:
 *               type: number
 *               example: 139.6503
 *         location:
 *           type: object
 *           description: GeoJSON Point
 *           properties:
 *             type:
 *               type: string
 *               example: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               example: [139.6503, 35.6762]
 *       example:
 *         title: Inception
 *         year: "2010"
 *         director: Christopher Nolan
 *         country: USA
 *         city: Los Angeles
 *         coordinates:
 *           lat: 35.6762
 *           lng: 139.6503
 *         location:
 *           type: Point
 *           coordinates: [139.6503, 35.6762]
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Tüm filmleri getirir
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Film listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Yeni bir film ekler (GeoJSON destekli)
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Film başarıyla oluşturuldu
 */
router.post('/', async (req, res) => {
  const {
    title,
    year,
    director,
    poster,
    genre,
    imdb,
    country,
    city,
    lat,
    lng,
    addedBy
  } = req.body;

  try {
    const newMovie = new Movie({
      title,
      year,
      director,
      poster,
      genre,
      imdb,
      country,
      city,
      addedBy,
      coordinates: { lat, lng },
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });

    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Bir filmi siler
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Film silindi
 */
router.delete('/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: "Film silindi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Bir filmi günceller
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Film güncellendi
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/movies/{id}/media:
 *   post:
 *     summary: Filme medya ekler
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               url:
 *                 type: string
 *               addedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medya eklendi
 */
router.post('/:id/media', async (req, res) => {
  try {
    const { type, url, addedBy } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Film bulunamadı" });
    }

    movie.media.push({ type, url, addedBy });
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;