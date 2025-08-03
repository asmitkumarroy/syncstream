import React, { useRef, useEffect, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, VolumeIcon, HeartIcon, HeartFilledIcon } from '../icons';

const Player = () => {
  console.log('Player component rendered');
  // Get global state, but not volume
  const { playerState, setPlayerState, currentSong, syncState, setIsPlaying, playNext, playPrev, room } = usePlayer();
  console.log('Current song:', currentSong);
  console.log('Player state:', playerState);
  const { isPlaying, progress, duration } = playerState;

  // NEW: Volume is now a local state within the Player component itself
  const [volume, setVolume] = useState(0.75);

  const { likedSongs, addLikedSong, removeLikedSong } = useContext(AuthContext);
  const audioRef = useRef(null);
  const socket = useSocket();
  const location = useLocation();
  const params = useParams();

  const playerStateRef = useRef(playerState);
  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  const inRoom = location.pathname.includes('/room/');
  const roomId = inRoom ? params.id : null;
  const isHost = socket?.id === room.hostId;

  // This effect no longer sends volume in the playerState
  useEffect(() => {
    if (isHost && inRoom && socket) {
      socket.emit('player_state_change', { roomId, state: playerState });
    }
  }, [playerState, isHost, inRoom, roomId, socket]);

  // This effect listens for events (no changes here)
  useEffect(() => {
    if (socket) {
      const handleSync = (state) => { if (!isHost) syncState(state); };
      const handleGetState = (targetSocketId) => {
        if (isHost) socket.emit('send_player_state_to_new_user', { state: playerStateRef.current, targetSocketId });
      };
      socket.on('sync_player_state', handleSync);
      socket.on('get_current_player_state', handleGetState);
      return () => {
        socket.off('sync_player_state', handleSync);
        socket.off('get_current_player_state', handleGetState);
      };
    }
  }, [socket, isHost, syncState]);

  // This effect controls the audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => {});
      else audioRef.current.pause();
      
      // Volume is now set from the local state, which every user controls individually
      audioRef.current.volume = volume;

      if (!isHost && inRoom && Math.abs(audioRef.current.currentTime - progress) > 2) {
        audioRef.current.currentTime = progress;
      }
    }
  }, [isPlaying, currentSong, volume, progress, isHost, inRoom]);

  // ... (handlers are mostly the same)
  const handleTimeUpdate = () => { if (isHost || !inRoom) setPlayerState(prev => ({...prev, progress: audioRef.current?.currentTime || 0})); };
  const handleLoadedMetadata = () => { if (isHost || !inRoom) setPlayerState(prev => ({...prev, duration: audioRef.current?.duration || 0})); };
  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = newProgress;
    if (isHost || !inRoom) setPlayerState(prev => ({ ...prev, progress: newProgress }));
  };
  const isCurrentSongLiked = currentSong ? likedSongs.has(currentSong.videoId || currentSong.id) : false;
  const handleLikeClick = () => {
    if (!currentSong) return;
    const songId = currentSong.videoId || currentSong.id;
    if (isCurrentSongLiked) removeLikedSong(songId);
    else {
      const songData = { id: songId, title: currentSong.title, thumbnail: currentSong.thumbnail, duration: currentSong.duration };
      addLikedSong(songData);
    }
  };
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={`http://localhost:5001/api/stream/${currentSong.videoId || currentSong.id}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={isHost || !inRoom ? playNext : undefined}
      />
      <footer className="player-footer">
        <div className="song-info">
          <img src={currentSong.thumbnail} alt={currentSong.title} className="song-thumbnail" />
          <div className="song-details">
            <span className="song-title">{currentSong.title}</span>
          </div>
          <button onClick={handleLikeClick} className="control-button like-button">
            {isCurrentSongLiked ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
        </div>
        <div className="player-center">
          <div className="player-controls">
            <button onClick={playPrev} disabled={inRoom && !isHost} className="control-button"><PrevIcon /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} disabled={inRoom && !isHost} className="control-button play-button">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={playNext} disabled={inRoom && !isHost} className="control-button"><NextIcon /></button>
          </div>
          <div className="progress-container">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              disabled={inRoom && !isHost}
              className="progress-bar"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="player-right">
          <div className="volume-container">
            <button className="control-button" /* No longer disabled */><VolumeIcon /></button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              // THE FIX: The disabled prop is REMOVED so everyone can control it
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Player;