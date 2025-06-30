import React, { createContext, useState, useContext, useCallback, useMemo } from 'react'; // THE FIX IS HERE

export const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [playerState, setPlayerState] = useState({
    queue: [],
    currentSongIndex: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.75,
  });
  
  const [room, setRoom] = useState({ roomId: null, hostId: null });
  const currentSong = playerState.currentSongIndex !== null ? playerState.queue[playerState.currentSongIndex] : null;

  const loadQueue = useCallback((songs, startIndex = 0) => {
    setPlayerState(prev => ({ ...prev, queue: songs, currentSongIndex: startIndex, isPlaying: true, progress: 0 }));
  }, []);

  const syncState = useCallback((newState) => setPlayerState(newState), []);
  const setIsPlaying = useCallback((playing) => setPlayerState(prev => ({ ...prev, isPlaying: playing })), []);
  const setVolume = useCallback((newVolume) => setPlayerState(prev => ({ ...prev, volume: newVolume })), []);

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
    loadQueue, syncState, setIsPlaying, playNext, playPrev, setVolume, enterRoom, leaveRoom,
  }), [playerState, room, loadQueue, syncState, setIsPlaying, playNext, playPrev, setVolume, enterRoom, leaveRoom]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};