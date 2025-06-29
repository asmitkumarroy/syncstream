const router = require('express').Router();
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/playlists
router.post('/', protect, async (req, res) => {
  const { name, description } = req.body;
  try {
    const playlist = await Playlist.create({
      name,
      description,
      user: req.user._id,
      songs: [],
    });
    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/playlists
router.get('/', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });
    res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/playlists/:id/songs
router.post('/:id/songs', protect, async (req, res) => {
  // Correctly destructure 'id' from the request body
  const { id, title, thumbnail, duration } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'User not authorized' });

    // Check if song already exists in the playlist
    const songExists = playlist.songs.some(song => song.videoId === id);
    if (songExists) return res.status(400).json({ message: 'Song already in playlist' });
    
    // Map the incoming 'id' to the 'videoId' field for the database
    const newSong = { videoId: id, title, thumbnail, duration };
    
    playlist.songs.push(newSong);
    await playlist.save();

    res.status(200).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;