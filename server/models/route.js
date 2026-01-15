const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Rota Adı
  description: { type: String }, // Açıklama
  addedBy: { type: String, default: 'Anonymous' },
  color: { type: String, default: '#E50914' }, // Varsayılan Kırmızı
  
  // --- GEOJSON LINESTRING (ÇİZGİ) ---
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]], // [[boylam, enlem], [boylam, enlem]]
      required: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);