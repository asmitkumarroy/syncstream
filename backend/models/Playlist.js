const mongoose = require('mongoose');
const SongSchema = require('./SongSchema'); // 1. Import the reusable schema

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a playlist name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  songs: [SongSchema], // 2. Use the imported schema here
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;