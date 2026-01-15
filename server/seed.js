const mongoose = require('mongoose');
const Movie = require('./models/Movie');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webgis_db';
const OMDB_API_KEY = 'fff2b072'; // Senin Key'in

// Filmlerin İsimleri ve SADECE Bizim Belirlediğimiz Konum Bilgileri
// Detaylar (Poster, Yıl, Yönetmen vs.) OMDb'den gelecek.
const targetMovies = [
    {
        queryTitle: "The Godfather",
        country: "USA",
        city: "New York",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Pulp Fiction",
        country: "USA",
        city: "Los Angeles",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Parasite",
        country: "South Korea",
        city: "Seoul",
        coordinates: { lat: 37.5665, lng: 126.9780 },
        addedBy: "Cinephile"
    },
    {
        queryTitle: "Amélie",
        country: "France",
        city: "Paris",
        coordinates: { lat: 48.8841, lng: 2.3322 },
        addedBy: "Admin"
    },
    {
        queryTitle: "City of God",
        country: "Brazil",
        city: "Rio de Janeiro",
        coordinates: { lat: -22.9068, lng: -43.1729 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Spirited Away",
        country: "Japan",
        city: "Tokyo",
        coordinates: { lat: 35.6762, lng: 139.6503 },
        addedBy: "Cinephile"
    },
    {
        queryTitle: "The Dark Knight",
        country: "USA",
        city: "Chicago",
        coordinates: { lat: 41.8781, lng: -87.6298 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Slumdog Millionaire",
        country: "India",
        city: "Mumbai",
        coordinates: { lat: 19.0760, lng: 72.8777 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Skyfall",
        country: "Turkey",
        city: "Istanbul",
        coordinates: { lat: 41.0082, lng: 28.9784 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Roma",
        country: "Mexico",
        city: "Mexico City",
        coordinates: { lat: 19.4326, lng: -99.1332 },
        addedBy: "Cinephile"
    },
    {
        queryTitle: "The Lord of the Rings: The Return of the King",
        country: "New Zealand",
        city: "Wellington",
        coordinates: { lat: -41.2865, lng: 174.7762 },
        addedBy: "Admin"
    },
    {
        queryTitle: "Inglourious Basterds",
        country: "Germany",
        city: "Berlin",
        coordinates: { lat: 52.5200, lng: 13.4050 },
        addedBy: "Admin"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("🔌 Veritabanına bağlanıldı...");

        // ÖNCEKİ VERİLERİ SİL
        await Movie.deleteMany({});
        console.log("🗑️  Eski veriler temizlendi. OMDb API'den güncel veriler çekiliyor...");

        const moviesToSave = [];

        // Her bir film için OMDb API'ye istek at
        for (const movieData of targetMovies) {
            try {
                const apiUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(movieData.queryTitle)}&apikey=${OMDB_API_KEY}`;
                const response = await fetch(apiUrl);
                const apiData = await response.json();

                if (apiData.Response === "True") {
                    moviesToSave.push({
                        title: apiData.Title,
                        year: apiData.Year,
                        director: apiData.Director,
                        genre: apiData.Genre,
                        poster: apiData.Poster, // Gerçek poster URL'si buradan geliyor
                        imdb: apiData.imdbRating,
                        
                        // Bizim elimizdeki coğrafi veriler
                        country: movieData.country,
                        city: movieData.city,
                        coordinates: movieData.coordinates,
                        // GeoJSON formatı (GIS için)
                        location: { 
                            type: 'Point', 
                            coordinates: [movieData.coordinates.lng, movieData.coordinates.lat] 
                        },
                        addedBy: movieData.addedBy
                    });
                    console.log(`📥 Çekildi: ${apiData.Title}`);
                } else {
                    console.error(`❌ Bulunamadı: ${movieData.queryTitle} - ${apiData.Error}`);
                }
            } catch (err) {
                console.error(`⚠️ Hata (${movieData.queryTitle}):`, err.message);
            }
            // API'yi boğmamak için minik bir bekleme (opsiyonel)
            await new Promise(resolve => setTimeout(resolve, 200)); 
        }

        // Veritabanına Kaydet
        if (moviesToSave.length > 0) {
            await Movie.insertMany(moviesToSave);
            console.log(`\n✨ Toplam ${moviesToSave.length} adet film OMDb verileriyle başarıyla eklendi!`);
        } else {
            console.log("⚠️ Hiçbir film eklenemedi. API Key veya bağlantını kontrol et.");
        }
        
        process.exit();
    } catch (err) {
        console.error("❌ Genel Hata:", err);
        process.exit(1);
    }
};

seedDB();