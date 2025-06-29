const router = require('express').Router();
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/authMiddleware'); // Import our protect middleware

// @route   POST /api/playlists
// @desc    Create a new playlist
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, description } = req.body;

  try {
    const playlist = await Playlist.create({
      name,
      description,
      user: req.user._id, // Get the user ID from the middleware
      songs: [],
    });
    res.status(201).json(playlist);
  } catch (error) {
    console.error(error); // This will log the real error if something goes wrong
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/playlists
// @desc    Get all playlists for a logged-in user
// @access  Private
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
// @desc    Add a song to a playlist
// @access  Private
router.post('/:id/songs', protect, async (req, res) => {
  const { videoId, title, thumbnail, duration } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Make sure the logged-in user owns this playlist
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const newSong = { videoId, title, thumbnail, duration };
    playlist.songs.push(newSong);
    await playlist.save();

    res.status(200).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;