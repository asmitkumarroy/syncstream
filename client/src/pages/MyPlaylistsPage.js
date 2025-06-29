import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import useAxios from '../hooks/useAxios';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import './MyPlaylistsPage.css';

const MyPlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const api = useAxios();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPlaylists = async () => {
        try {
          const { data } = await api.get('/playlists');
          setPlaylists(data);
        } catch (error) {
          console.error('Failed to fetch playlists', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlaylists();
    }
  }, [isAuthenticated, api]);

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists([...playlists, newPlaylist]);
    setIsModalOpen(false);
  };
  
  if (isLoading) return <p className="loading-text">Loading playlists...</p>;

  return (
    <div className="playlists-page-container">
      <div className="playlists-header">
        <h1>My Playlists</h1>
        <button onClick={() => setIsModalOpen(true)} className="create-playlist-btn">Create Playlist</button>
      </div>

      <div className="playlists-grid">
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <div key={playlist._id} className="playlist-card">
              <div className="playlist-card-art">
                {/* We can show song thumbnails here later */}
                <span>🎵</span>
              </div>
              <p className="playlist-name">{playlist.name}</p>
              <p className="song-count">{playlist.songs.length} songs</p>
            </div>
          ))
        ) : (
          <p>You haven't created any playlists yet.</p>
        )}
      </div>
      
      {isModalOpen && (
        <CreatePlaylistModal 
          onClose={() => setIsModalOpen(false)} 
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default MyPlaylistsPage;