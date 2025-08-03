import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [playerState, setPlayerState] = useState({
    queue: [],
    currentSongIndex: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    // volume is no longer here
  });
  
  const [room, setRoom] = useState({ roomId: null, hostId: null });
  const currentSong = playerState.currentSongIndex !== null ? playerState.queue[playerState.currentSongIndex] : null;

  const loadQueue = useCallback((songs, startIndex = 0) => {
    setPlayerState(prev => ({ ...prev, queue: songs, currentSongIndex: startIndex, isPlaying: true, progress: 0 }));
  }, []);

  const syncState = useCallback((newState) => setPlayerState(newState), []);
  const setIsPlaying = useCallback((playing) => setPlayerState(prev => ({ ...prev, isPlaying: playing })), []);

  const playNext = useCallback(() => {
    setPlayerState(prev => {
      if (prev.currentSongIndex < prev.queue.length - 1) {
        return { ...prev, currentSongIndex: prev.currentSongIndex + 1, progress: 0, isPlaying: true };
      }
      return { ...prev, isPlaying: false };
    });
  }, []);

  const playPrev = useCallback(() => {
    setPlayerState(prev => {
      if (prev.currentSongIndex > 0) {
        return { ...prev, currentSongIndex: prev.currentSongIndex - 1, progress: 0, isPlaying: true };
      }
      return prev;
    });
  }, []);

  const enterRoom = useCallback((roomId, hostId) => setRoom({ roomId, hostId }), []);
  const leaveRoom = useCallback(() => setRoom({ roomId: null, hostId: null }), []);

  const contextValue = useMemo(() => ({
    playerState, setPlayerState, currentSong, room,
    loadQueue, syncState, setIsPlaying, playNext, playPrev, enterRoom, leaveRoom,
    // setVolume is no longer here
  }), [playerState, room, loadQueue, syncState, setIsPlaying, playNext, playPrev, enterRoom, leaveRoom, currentSong]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};