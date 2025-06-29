import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import { usePlayer } from '../context/PlayerContext';
import './PlaylistDetailPage.css'; // We can reuse the same styles
import { PlayIcon,HeartIcon } from '../icons';

const LikedSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = useAxios();
  const { loadQueue } = usePlayer();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const { data } = await api.get('/user/liked-songs');
        setSongs(data);
      } catch (error) {
        console.error('Failed to fetch liked songs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [api]);
  
  const handlePlaySong = (index) => {
      loadQueue(songs, index);
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="playlist-detail-page">
      <div className="playlist-detail-header">
        <div className="playlist-art" style={{background: 'linear-gradient(135deg, #450af5, #c4efd9)'}}>
            <HeartIcon />
        </div>
        <div className="playlist-info">
          <p style={{fontSize: '0.9rem', fontWeight: 'bold'}}>PLAYLIST</p>
          <h1>Liked Songs</h1>
          <span>{songs.length} songs</span>
        </div>
      </div>
      <div className="song-list">
        {songs.map((song, index) => (
          <div className="song-row" key={song.videoId} onDoubleClick={() => handlePlaySong(index)}>
            <div className="song-index" onClick={() => handlePlaySong(index)}>
                <span className="index-number">{index + 1}</span>
                <span className="index-play-icon"><PlayIcon /></span>
            </div>
            <div className="song-title-artist">
              <img src={song.thumbnail} alt={song.title} />
              <span>{song.title}</span>
            </div>
            <div className="song-duration">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedSongsPage;