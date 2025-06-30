import React, { useRef, useEffect, useContext } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, VolumeIcon, HeartIcon, HeartFilledIcon } from '../icons';

const Player = () => {
  const { playerState, setPlayerState, currentSong, syncState, setIsPlaying, playNext, playPrev, setVolume, room } = usePlayer();
  const { isPlaying, queue, currentSongIndex, progress, duration, volume } = playerState;
  const { likedSongs, addLikedSong, removeLikedSong } = useContext(AuthContext);
  const audioRef = useRef(null);
  const socket = useSocket();

  // THE FIX: isHost is now determined by global state, not the URL
  const isHost = socket?.id === room.hostId;
  const inRoom = !!room.roomId;

  // This effect now correctly sends updates from the host, no matter what page they are on
  useEffect(() => {
    if (isHost && inRoom && socket) {
      socket.emit('player_state_change', { roomId: room.roomId, state: playerState });
    }
  }, [playerState, isHost, inRoom, room.roomId, socket]);
  
  // This effect correctly listens for events
  useEffect(() => {
    if (socket) {
      const handleSync = (state) => {
        if (!isHost) syncState(state);
      };
      const handleGetState = (targetSocketId) => {
        if (isHost) {
          socket.emit('send_player_state_to_new_user', { state: playerState, targetSocketId });
        }
      };
      socket.on('sync_player_state', handleSync);
      socket.on('get_current_player_state', handleGetState);
      return () => {
        socket.off('sync_player_state', handleSync);
        socket.off('get_current_player_state', handleGetState);
      };
    }
  }, [socket, isHost, playerState, syncState]);

  // This effect controls the audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => {});
      else audioRef.current.pause();
      audioRef.current.volume = volume;
      if (!isHost && inRoom && Math.abs(audioRef.current.currentTime - progress) > 2) {
        audioRef.current.currentTime = progress;
      }
    }
  }, [isPlaying, currentSong, volume, progress, isHost, inRoom]);
  
  const handleTimeUpdate = () => { if (isHost || !inRoom) setPlayerState(prev => ({...prev, progress: audioRef.current?.currentTime || 0})); };
  const handleLoadedMetadata = () => { if (isHost || !inRoom) setPlayerState(prev => ({...prev, duration: audioRef.current?.duration || 0})); };
  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = newProgress;
    if (isHost || !inRoom) setPlayerState(prev => ({ ...prev, progress: newProgress }));
  };

  // ... (like button logic and formatTime are unchanged)
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
        onPlay={() => { if(isHost || !inRoom) setIsPlaying(true); }}
        onPause={() => { if(isHost || !inRoom) setIsPlaying(false); }}
      />
      <footer className="player-footer">
        {/* The JSX for the footer is unchanged */}
        <div className="song-info">
          <img src={currentSong.thumbnail} alt={currentSong.title} />
          <div className="title-wrapper"><p className="title">{currentSong.title}</p></div>
          <button onClick={handleLikeClick} className="control-button like-button">
            {isCurrentSongLiked ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
        </div>
        <div className="player-center">
          <div className="control-buttons">
            <button onClick={playPrev} disabled={(!isHost && inRoom) || currentSongIndex === 0}><PrevIcon /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn" disabled={!isHost && inRoom}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={playNext} disabled={(!isHost && inRoom) || !queue || currentSongIndex === queue.length - 1}><NextIcon /></button>
          </div>
          <div className="seek-bar-container">
            <span>{formatTime(progress)}</span>
            <input type="range" min="0" max={duration || 0} value={progress} onChange={handleSeek} className="seek-bar" disabled={!isHost && inRoom} />
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>
        <div className="player-right">
          <div className="volume-container">
            <button className="control-button"><VolumeIcon /></button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider"/>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Player;