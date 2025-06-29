const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/user/liked-songs
// @desc    Get all liked songs for the logged-in user
// @access  Private
router.get('/liked-songs', protect, async (req, res) => {
    try {
        // req.user is populated by our 'protect' middleware
        res.status(200).json(req.user.likedSongs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/user/liked-songs
// @desc    Add a song to liked songs
// @access  Private
router.post('/liked-songs', protect, async (req, res) => {
    const { id, title, thumbnail, duration } = req.body;
    try {
        const user = req.user;
        const newLikedSong = { videoId: id, title, thumbnail, duration };

        // Check if song is already liked to prevent duplicates
        const songExists = user.likedSongs.some(song => song.videoId === id);
        if (songExists) {
            return res.status(400).json({ message: 'Song already in liked songs' });
        }

        user.likedSongs.push(newLikedSong);
        await user.save();
        res.status(200).json(user.likedSongs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/user/liked-songs/:videoId
// @desc    Remove a song from liked songs
// @access  Private
router.delete('/liked-songs/:videoId', protect, async (req, res) => {
    try {
        const user = req.user;
        // Filter out the song to be removed
        user.likedSongs = user.likedSongs.filter(
            (song) => song.videoId !== req.params.videoId
        );
        
        await user.save();
        res.status(200).json(user.likedSongs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;