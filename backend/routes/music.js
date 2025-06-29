const router = require('express').Router();
const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');

// --- Search Endpoint ---
// @route   GET /api/search?q=...
// @desc    Search for music on YouTube
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // UPDATED: Use `safe: true` to prevent crashes on unknown item types.
    // We also fetch more items (limit: 20) to ensure we get enough videos
    // even if some non-video items are filtered out.
    const searchResults = await ytsr(q, { safe: true, limit: 20 });

    // The ytsr library has a different result structure, so we adapt.
    // We first filter to ensure we only have items of type 'video'.
    // Then we slice to take only the first 10 videos.
    const formattedResults = searchResults.items
      .filter(item => item.type === 'video')
      .slice(0, 10)
      .map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnails[0]?.url,
        duration: video.duration,
      }));

    res.json(formattedResults);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'An error occurred during the search.' });
  }
});


// --- Stream Endpoint (This part remains the same) ---
// @route   GET /api/stream/:videoId
// @desc    Stream the audio of a YouTube video
// @access  Public
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }
    
    if (!ytdl.validateID(videoId)) {
      return res.status(400).json({ message: 'Invalid Video ID' });
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');

    ytdl(videoId, {
      filter: 'audioonly', 
      quality: 'highestaudio',
    }).pipe(res);

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ message: 'An error occurred while trying to stream the audio.' });
  }
});


module.exports = router;