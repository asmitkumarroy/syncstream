import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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
        setIsLoading(true);
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
            <Link to={`/playlists/${playlist._id}`} key={playlist._id} className="playlist-card-link">
              <div className="playlist-card">
                <div className="playlist-card-art">
                  <span>🎵</span>
                </div>
                <p className="playlist-name">{playlist.name}</p>
                <p className="song-count">{playlist.songs.length} songs</p>
              </div>
            </Link>
          ))
        ) : (
          <p>You haven't created any playlists yet. Click the button to create your first one!</p>
        )}
      </div>
      
      {isModalOpen && (
        <CreatePlaylistModal 
          // TYPO FIX: Changed setIsModalОpen to setIsModalOpen
          onClose={() => setIsModalOpen(false)} 
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default MyPlaylistsPage;