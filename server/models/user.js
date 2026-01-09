// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Sinefil', 'Ziyaretçi'], // Ödevdeki 3 Rol Zorunluluğu
    default: 'Ziyaretçi' 
  }
});

module.exports = mongoose.model('User', UserSchema);