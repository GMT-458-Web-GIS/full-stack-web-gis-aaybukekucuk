const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String },
  director: { type: String },
  poster: { type: String },
  genre: { type: String },
  imdb: { type: String },
  country: { type: String },
  city: { type: String },
  addedBy: { type: String }, // Filmi ekleyen kullanıcı
  
  // Frontend'in beklediği format (App.js ile uyumlu olması için)
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  // GIS Ödevi için Gerekli Olan GeoJSON formatı (Spatial Query için)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [Longitude, Latitude] sırası önemlidir
  },

  // Medya (Kanıtlar) alanı
  media: [{
    type: { type: String, enum: ['image', 'video'] },
    url: String,
    addedBy: String
  }],

  createdAt: { type: Date, default: Date.now }
});

// Spatial Index (Coğrafi sorgular için gerekli - Ödevin Indexing maddesi)
MovieSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Movie', MovieSchema);