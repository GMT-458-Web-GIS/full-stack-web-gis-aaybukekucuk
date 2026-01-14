const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  year: { type: String, required: true },
  genre: { type: String },
  poster: { type: String },
  city: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  addedBy: { type: String, default: 'Anonymous' },
  imdb: { type: String },
  
  // --- YENİ EKLENEN KISIM: MEDYA GALERİSİ ---
  media: [
    {
      type: { type: String, enum: ['image', 'video'], default: 'image' }, // Resim mi video mu?
      url: { type: String, required: true }, // Link
      addedBy: { type: String }, // Kim ekledi?
      createdAt: { type: Date, default: Date.now } // Ne zaman eklendi?
    }
  ],
  // -------------------------------------------

}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);