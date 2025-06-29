import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPlaylistsPage from './pages/MyPlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import Navbar from './components/Navbar';
import { usePlayer } from './context/PlayerContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from './icons';
import './App.css';

function App() {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrev } = usePlayer();
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleSeek = (e) => {
    if (audioRef.current) audioRef.current.currentTime = e.target.value;
  };
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Router>
      <div className="app-container">
        {/* The <audio> tag is no longer here */}
        
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/playlists" element={<MyPlaylistsPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          </Routes>
        </div>

        {currentSong && (
          <footer className="player-footer">
            {/* The <audio> tag has been MOVED here. */}
            <audio
              ref={audioRef}
              src={`http://localhost:5001/api/stream/${currentSong.videoId || currentSong.id}`}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={playNext}
              autoPlay
            />
            <div className="song-info">
              <img src={currentSong.thumbnail} alt={currentSong.title} />
              <div><p className="title">{currentSong.title}</p></div>
            </div>
            <div className="player-center">
              <div className="control-buttons">
                <button onClick={playPrev}><PrevIcon /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={playNext}><NextIcon /></button>
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
      </div>
    </Router>
  );
}

export default App;