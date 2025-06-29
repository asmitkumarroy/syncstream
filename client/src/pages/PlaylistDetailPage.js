import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import { usePlayer } from '../context/PlayerContext';
import './PlaylistDetailPage.css';
import { PlayIcon } from '../icons';

const PlaylistDetailPage = () => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const api = useAxios();
  const { loadQueue } = usePlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data } = await api.get(`/playlists/${id}`);
        setPlaylist(data);
      } catch (error) {
        console.error('Failed to fetch playlist details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id, api]);
  
  const handlePlaySong = (index) => {
      loadQueue(playlist.songs, index);
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!playlist) return <p className="loading-text">Playlist not found.</p>;

  return (
    <div className="playlist-detail-page">
      <div className="playlist-detail-header">
        <div className="playlist-art">🎵</div>
        <div className="playlist-info">
          <h1>{playlist.name}</h1>
          <p>{playlist.description}</p>
          <span>{playlist.songs.length} songs</span>
        </div>
      </div>
      <div className="song-list">
        {playlist.songs.map((song, index) => (
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

export default PlaylistDetailPage;