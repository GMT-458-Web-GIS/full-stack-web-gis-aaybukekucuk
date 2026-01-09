// server/seed.js
const mongoose = require('mongoose');
require('dotenv').config();

// Film Şeması
const MovieSchema = new mongoose.Schema({
    title: String,
    director: String,
    year: Number,
    genre: String,
    imdb: Number,
    country: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
});

const Movie = mongoose.model('Movie', MovieSchema);

// Test Verileri
const sampleMovies = [
    {
        title: "The Godfather",
        director: "Francis Ford Coppola",
        year: 1972,
        genre: "Suç, Drama",
        imdb: 9.2,
        country: "ABD",
        city: "New York",
        coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
        genre: "Bilim Kurgu",
        imdb: 8.8,
        country: "Japonya",
        city: "Tokyo",
        coordinates: { lat: 35.6762, lng: 139.6503 } // Filmin son sahnesi
    },
    {
        title: "Skyfall",
        director: "Sam Mendes",
        year: 2012,
        genre: "Aksiyon",
        imdb: 7.8,
        country: "Türkiye",
        city: "İstanbul",
        coordinates: { lat: 41.0082, lng: 28.9784 }
    }
];

// Veritabanına Bağlan ve Kaydet
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Veritabanına bağlanıldı...");
        
        // Önce temizle (Eski verileri sil)
        await Movie.deleteMany({});
        console.log("Eski veriler temizlendi.");

        // Yeni verileri ekle
        await Movie.insertMany(sampleMovies);
        console.log("✅ 3 Adet Test Filmi Başarıyla Eklendi!");
        
        process.exit();
    })
    .catch(err => {
        console.error("Hata:", err);
        process.exit(1);
    });