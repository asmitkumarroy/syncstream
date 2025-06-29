import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../App.css';
import { PlayIcon, PlusIcon } from '../icons';
import { AuthContext } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function HomePage() { 
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);
  const { loadQueue } = usePlayer();

  const handleSearch = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setSongs([]);
    try {
      const response = await axios.get(`http://localhost:5001/api/search?q=${searchTerm}`);
      setSongs(response.data);
    } catch (error) {
      alert('Failed to fetch search results.');
    }
    setIsLoading(false);
  };

  const handleOpenAddToPlaylistModal = (song) => {
    setSelectedSong(song);
    setIsAddToPlaylistModalOpen(true);
  };
  
  const handlePlayFromSearch = (index) => {
      loadQueue(songs, index);
  };

  return (
    // Note: The main layout div is gone, as it's now in App.js
    <>
      <header className="page-header">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="What do you want to play?" required />
        </form>
      </header>

      <div className="results-grid">
        {songs.map((song, index) => (
          <div className="song-card" key={song.id}>
            <div className="clickable-area" onClick={() => handlePlayFromSearch(index)}>
              <div className="thumbnail-container"><img src={song.thumbnail} alt={song.title} /><div className="play-icon-overlay"><PlayIcon /></div></div>
              <p className="song-title">{song.title}</p>
              <p className="song-duration">{song.duration}</p>
            </div>
            {isAuthenticated && (
              <button className="add-to-playlist-btn" onClick={() => handleOpenAddToPlaylistModal(song)}><PlusIcon /></button>
            )}
          </div>
        ))}
      </div>
      
      {isAddToPlaylistModalOpen && (
        <AddToPlaylistModal song={selectedSong} onClose={() => setIsAddToPlaylistModalOpen(false)} />
      )}
    </>
  );
}