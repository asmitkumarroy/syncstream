import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // We'll share the main App.css
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from '../icons';

// The function name is now HomePage
export default function HomePage() { 
  // All the state and functions you had in App.js are here
  const [searchTerm, setSearchTerm] = useState('');
  // ... and so on
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;

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

  // The entire return (...) JSX from your old App.js goes here
  return (
     <div className="app-container">
      <audio
        ref={audioRef}
        src={currentSong ? `http://localhost:5001/api/stream/${currentSong.id}` : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNextSong}
      />
      <div className="main-content">
        <header className="app-header">
          <h1>SyncStream</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for artists, songs, or podcasts..." required />
            <button type="submit" disabled={isLoading}>{isLoading ? '...' : 'Search'}</button>
          </form>
        </header>

        <div className="results-grid">
          {songs.map((song, index) => (
            <div className="song-card" key={song.id} onClick={() => handleSongClick(index)}>
              <div className="thumbnail-container">
                <img src={song.thumbnail} alt={song.title} />
                <div className="play-icon-overlay">
                  <PlayIcon />
                </div>
              </div>
              <p className="song-title">{song.title}</p>
              <p className="song-duration">{song.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {currentSong && (
        <footer className="player-footer">
          <div className="song-info">
            <img src={currentSong.thumbnail} alt={currentSong.title} />
            <div>
              <p className="title">{currentSong.title}</p>
              <p className="artist">SyncStream</p>
            </div>
          </div>
          
          {/* CORRECTED STRUCTURE: Wrapper div for center column */}
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
          
          <div className="player-right">
            {/* Volume controls can go here in the future */}
          </div>
        </footer>
      )}
    </div>
  );
}