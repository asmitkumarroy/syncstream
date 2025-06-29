import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from '../icons';

const Player = () => {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrev, queue } = usePlayer();
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

  const handleTimeUpdate = () => setProgress(audioRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(audioRef.current?.duration || 0);
  const handleSeek = (e) => {
    if (audioRef.current) audioRef.current.currentTime = e.target.value;
  };
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) return null; // Don't render the player if no song is loaded

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
        <div className="song-info">
          <img src={currentSong.thumbnail} alt={currentSong.title} />
          <div>
            <p className="title">{currentSong.title}</p>
          </div>
        </div>
        <div className="player-center">
          <div className="control-buttons">
            <button onClick={playPrev} disabled={queue.length <= 1}><PrevIcon /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={playNext} disabled={queue.length <= 1}><NextIcon /></button>
          </div>
          <div className="seek-bar-container">
            <span>{formatTime(progress)}</span>
            <input type="range" min="0" max={duration} value={progress} onChange={handleSeek} className="seek-bar" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="player-right">
          {/* Volume slider will go here next! */}
        </div>
      </footer>
    </>
  );
};

export default Player;
