import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import '../App.css'; 
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, PlusIcon } from '../icons'; // Import PlusIcon
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import AddToPlaylistModal from '../components/AddToPlaylistModal'; // Import the new modal

export default function HomePage() { 
  // ... all the existing state variables ...
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // NEW: State for the "Add to Playlist" modal
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const { isAuthenticated } = useContext(AuthContext); // Check if user is logged in
  const audioRef = useRef(null);
  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;

  // NEW: Function to open the modal
  const handleOpenAddToPlaylistModal = (song) => {
    setSelectedSong(song);
    setIsAddToPlaylistModalOpen(true);
  };

  // ... all other existing functions (useEffect, handleSearch, etc.) remain the same ...
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Play error:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setSongs([]);
    setCurrentSongIndex(null);
    try {
      const response = await axios.get(`http://localhost:5001/api/search?q=${searchTerm}`);
      setSongs(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      alert('Failed to fetch search results.');
    }
    setIsLoading(false);
  };

  const handleSongClick = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };

  const handleNextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePreviousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };
  
  const handleSeek = (e) => {
    audioRef.current.currentTime = e.target.value;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
     <div className="app-container">
      {/* ... audio element remains the same ... */}
      <audio
        ref={audioRef}
        src={currentSong ? `http://localhost:5001/api/stream/${currentSong.id}` : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNextSong}
      />
      <div className="main-content">
        {/* ... header remains the same ... */}
        <header className="app-header">
          <h1>SyncStream</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for artists, songs, or podcasts..." required />
            <button type="submit" disabled={isLoading}>{isLoading ? '...' : 'Search'}</button>
          </form>
        </header>

        <div className="results-grid">
          {songs.map((song, index) => (
            <div className="song-card" key={song.id}>
              {/* This part of the card now handles playing the song */}
              <div className="clickable-area" onClick={() => handleSongClick(index)}>
                <div className="thumbnail-container">
                  <img src={song.thumbnail} alt={song.title} />
                  <div className="play-icon-overlay"><PlayIcon /></div>
                </div>
                <p className="song-title">{song.title}</p>
                <p className="song-duration">{song.duration}</p>
              </div>
              {/* NEW: Add to Playlist button, only shown if logged in */}
              {isAuthenticated && (
                <button className="add-to-playlist-btn" onClick={() => handleOpenAddToPlaylistModal(song)}>
                  <PlusIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ... player footer remains the same ... */}
       {currentSong && (
        <footer className="player-footer">
          <div className="song-info">
            <img src={currentSong.thumbnail} alt={currentSong.title} />
            <div>
              <p className="title">{currentSong.title}</p>
              <p className="artist">SyncStream</p>
            </div>
          </div>
          <div className="player-center">
            <div className="control-buttons">
              <button onClick={handlePreviousSong} disabled={currentSongIndex === 0}><PrevIcon /></button>
              <button onClick={handlePlayPause} className="play-pause-btn">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button onClick={handleNextSong} disabled={currentSongIndex === songs.length - 1}><NextIcon /></button>
            </div>
            <div className="seek-bar-container">
              <span>{formatTime(progress)}</span>
              <input type="range" min="0" max={duration || 0} value={progress} onChange={handleSeek} className="seek-bar" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="player-right"></div>
        </footer>
      )}

      {/* NEW: Conditionally render the "Add to Playlist" modal */}
      {isAddToPlaylistModalOpen && (
        <AddToPlaylistModal
          song={selectedSong}
          onClose={() => setIsAddToPlaylistModalOpen(false)}
        />
      )}
    </div>
  );
}