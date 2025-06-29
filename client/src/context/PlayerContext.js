import React, { createContext, useState, useContext } from 'react';

export const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75); // NEW: Add volume state (0 to 1), default to 75%

  const currentSong = currentSongIndex !== null ? queue[currentSongIndex] : null;

  const loadQueue = (songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentSongIndex(startIndex);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (currentSongIndex < queue.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setIsPlaying(true);
    }
  };

  const contextValue = {
    queue,
    currentSongIndex,
    currentSong,
    isPlaying,
    setIsPlaying,
    volume,       // NEW: Provide volume state
    setVolume,    // NEW: Provide function to update volume
    loadQueue,
    playNext,
    playPrev,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};