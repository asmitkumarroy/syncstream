import React, { useRef, useEffect, useState, useContext } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, VolumeIcon, HeartIcon, HeartFilledIcon } from '../icons';

const Player = () => {
  // From PlayerContext
  const { 
    currentSong, 
    isPlaying, 
    setIsPlaying, 
    playNext, 
    playPrev, 
    queue, 
    currentSongIndex, 
    volume, 
    setVolume 
  } = usePlayer();
  
  // From AuthContext
  const { likedSongs, addLikedSong, removeLikedSong } = useContext(AuthContext);
  
  // Local state for this component
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Check if the currently playing song is in the user's liked songs
  const isCurrentSongLiked = currentSong ? likedSongs.has(currentSong.videoId || currentSong.id) : false;

  // Effect to handle playing/pausing the audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);


  // Event Handlers
  const handleTimeUpdate = () => setProgress(audioRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(audioRef.current?.duration || 0);
  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
    }
  };

  const handleLikeClick = () => {
    if (!currentSong) return;
    const songId = currentSong.videoId || currentSong.id;
    if (isCurrentSongLiked) {
      removeLikedSong(songId);
    } else {
      const songData = { id: songId, title: currentSong.title, thumbnail: currentSong.thumbnail, duration: currentSong.duration };
      addLikedSong(songData);
    }
  };

  // Helper function to format time from seconds to MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // If there is no song, render nothing.
  if (!currentSong) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={`http://localhost:5001/api/stream/${currentSong.videoId || currentSong.id}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        autoPlay
      />
      <footer className="player-footer">
        {/* --- Column 1: Song Info --- */}
        <div className="song-info">
          <img src={currentSong.thumbnail} alt={currentSong.title} />
          <div className="title-wrapper">
            <p className="title">{currentSong.title}</p>
          </div>
          <button onClick={handleLikeClick} className="control-button like-button">
            {isCurrentSongLiked ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
        </div>

        {/* --- Column 2: Player Controls --- */}
        <div className="player-center">
          <div className="control-buttons">
            <button onClick={playPrev} disabled={currentSongIndex === 0}>
              <PrevIcon />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={playNext} disabled={!queue || currentSongIndex === queue.length - 1}>
              <NextIcon />
            </button>
          </div>
          <div className="seek-bar-container">
            <span>{formatTime(progress)}</span>
            <input type="range" min="0" max={duration} value={progress} onChange={handleSeek} className="seek-bar" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* --- Column 3: Volume Controls --- */}
        <div className="player-right">
          <div className="volume-container">
            <button className="control-button"><VolumeIcon /></button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Player;