import React, { useRef, useEffect, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, VolumeIcon, HeartIcon, HeartFilledIcon, ShuffleIcon, RepeatIcon } from '../icons';
import Tooltip from './Tooltip';

const Player = () => {
  const { playerState, setPlayerState, currentSong, syncState, setIsPlaying, playNext, playPrev, room, toggleShuffle, toggleRepeat } = usePlayer();
  const { isPlaying, progress, duration, shuffle, repeat } = playerState;
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

  useEffect(() => {
    if (isHost && inRoom && socket) {
      socket.emit('player_state_change', { roomId, state: playerState });
    }
  }, [playerState, isHost, inRoom, roomId, socket]);

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
      <footer className="player-footer" data-testid="now-playing-bar">
        <div className="song-info">
          <img src={currentSong.thumbnail} alt={currentSong.title} className="song-thumbnail" />
          <div className="song-details">
            <span className="song-title">{currentSong.title}</span>
            <span className="song-artist">{currentSong.artist || 'Unknown Artist'}</span>
          </div>
          <Tooltip text={isCurrentSongLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}>
            <button onClick={handleLikeClick} className="control-button like-button">
              {isCurrentSongLiked ? <HeartFilledIcon /> : <HeartIcon />}
            </button>
          </Tooltip>
        </div>

        <div className="player-center">
          <div className="player-controls">
            <Tooltip text={shuffle ? 'Disable Shuffle' : 'Enable Shuffle'}>
              <button onClick={toggleShuffle} className={`control-button ${shuffle ? 'active' : ''}`} disabled={inRoom && !isHost}><ShuffleIcon /></button>
            </Tooltip>
            <Tooltip text="Previous">
              <button onClick={playPrev} disabled={inRoom && !isHost} className="control-button"><PrevIcon /></button>
            </Tooltip>
            <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
              <button onClick={() => setIsPlaying(!isPlaying)} disabled={inRoom && !isHost} className="control-button play-button">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </Tooltip>
            <Tooltip text="Next">
              <button onClick={playNext} disabled={inRoom && !isHost} className="control-button"><NextIcon /></button>
            </Tooltip>
            <Tooltip text={repeat ? 'Disable Repeat' : 'Enable Repeat'}>
              <button onClick={toggleRepeat} className={`control-button ${repeat ? 'active' : ''}`} disabled={inRoom && !isHost}><RepeatIcon /></button>
            </Tooltip>
          </div>
          <div className="progress-container">
            <span className="progress-time">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              disabled={inRoom && !isHost}
              className="progress-bar"
              style={{ '--progress-percentage': `${(progress / duration) * 100 || 0}%` }}
            />
            <span className="progress-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-right">
          <Tooltip text="Lyrics">
            <button className="control-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.426 2.574a.75.75 0 0 0-1.06 1.06L13.94 5.21a4.999 4.999 0 0 1-1.79 8.012.75.75 0 1 0 .848 1.204A6.5 6.5 0 0 0 15.44 5.77L16 5.21a.75.75 0 0 0-1.06-1.06l-.514.524zM8 12a3.5 3.5 0 0 0 3.5-3.5V4a3.5 3.5 0 0 0-7 0v4.5A3.5 3.5 0 0 0 8 12zm2-3.5a2 2 0 0 1-4 0V4a2 2 0 0 1 4 0v4.5z"></path></svg>
            </button>
          </Tooltip>
          <Tooltip text="Queue">
            <button className="control-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A.5.5 0 0 1 .5 3h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"></path></svg>
            </button>
          </Tooltip>
          <Tooltip text="Devices">
            <button className="control-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.5 4H3.5A2.5 2.5 0 0 0 1 6.5v6A2.5 2.5 0 0 0 3.5 15h9a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 12.5 4zM3.5 13.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9z"></path><path d="M12 1H4a1 1 0 0 0-1 1v1.5h10V2a1 1 0 0 0-1-1z"></path></svg>
            </button>
          </Tooltip>
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
              style={{ '--volume-percentage': `${volume * 100}%` }}
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Player;