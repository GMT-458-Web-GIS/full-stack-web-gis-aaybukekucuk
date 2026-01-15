// server/benchmark.js
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webgis_db';

const runBenchmark = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(" Benchmark başlıyor...\n");

        // 1. İndeksleri Kaldır (Sıfır durum testi)
        await Movie.collection.dropIndexes();
        console.log("   İndeksler kaldırıldı. Sorgu yapılıyor (INDEX: YOK)...");

        // $geoWithin, indeks olmadan da çalışır (Full Scan yapar - YAVAŞTIR)
        // İstanbul merkezli (28.97, 41.00) 3000 km yarıçapındaki filmleri ara
        const query = {
            location: {
                $geoWithin: {
                    $centerSphere: [ [28.97, 41.00], 3000 / 6378.1 ] // Radyan cinsinden (km / dünya yarıçapı)
                }
            }
        };

        let start = performance.now();
        const resultsNoIndex = await Movie.find(query);
        let end = performance.now();
        console.log(`   İndekssiz Sorgu Süresi: ${(end - start).toFixed(2)} ms`);
        console.log(`   Bulunan Film Sayısı: ${resultsNoIndex.length}`);

        // 2. İndeksi Oluştur
        console.log("\n İndeks oluşturuluyor (2dsphere)...");
        await Movie.collection.createIndex({ location: "2dsphere" });
        
        // İndeksin oluşmasını bekle
        await new Promise(r => setTimeout(r, 2000));

        console.log(" İndeks eklendi. Sorgu yapılıyor (INDEX: VAR)...");
        
        start = performance.now();
        const resultsIndex = await Movie.find(query);
        end = performance.now();
        console.log(`   İndeksli Sorgu Süresi: ${(end - start).toFixed(2)} ms`);
        console.log(`   Bulunan Film Sayısı: ${resultsIndex.length}`);

        console.log("\n Test başarıyla tamamlandı.");
        
        process.exit();
    } catch (error) {
        console.error(" Hata oluştu:", error);
        process.exit(1);
    }
};

runBenchmark();