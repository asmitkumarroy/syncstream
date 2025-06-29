const mongoose = require('mongoose');

// This defines the structure for songs within a playlist
const SongSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: false },
});

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
  // This links the playlist to a specific user
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // This refers to our 'User' model
    required: true,
  },
  songs: [SongSchema], // A playlist contains an array of songs
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist;