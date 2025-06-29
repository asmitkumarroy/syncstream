import React, { createContext, useState, useContext } from 'react';

export const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      // Optional: stop playing at the end of the queue
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