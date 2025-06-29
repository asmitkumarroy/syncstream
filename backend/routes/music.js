const router = require('express').Router();
const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');

// Search Endpoint (No changes here)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });

    const searchResults = await ytsr(q, { safe: true, limit: 20 });
    const formattedResults = searchResults.items
      .filter(item => item.type === 'video')
      .slice(0, 12) // Get 12 results for a nice grid layout
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

// Stream Endpoint (Completely rewritten for seeking)
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!ytdl.validateID(videoId)) {
      return res.status(400).json({ message: 'Invalid Video ID' });
    }

    const videoInfo = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio', filter: 'audioonly' });
    
    if (!format) {
      return res.status(404).json({ message: 'No suitable audio format found.' });
    }

    const videoSize = format.contentLength;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mp3',
      });
      
      ytdl(videoId, {
        filter: 'audioonly',
        quality: 'highestaudio',
        range: { start, end }
      }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': videoSize,
        'Content-Type': 'audio/mp3',
        'Accept-Ranges': 'bytes'
      });
      ytdl(videoId, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ message: 'An error occurred while streaming.' });
  }
});

module.exports = router;