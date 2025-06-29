const mongoose = require('mongoose');

// This defines the structure for a single song
const SongSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: false },
});

module.exports = SongSchema;