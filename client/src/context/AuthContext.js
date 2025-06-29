import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios'; // Import axios directly

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [likedSongs, setLikedSongs] = useState(new Set());
  
  // Create a memoized API client instance that is aware of the token.
  // This is the logic from our old useAxios hook, moved here to the correct place.
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:5001/api',
    });
    instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return instance;
  }, [token]);

  const fetchLikedSongs = useCallback(async () => {
    if (!token) return; // Don't fetch if there's no token
    try {
      const { data } = await api.get('/user/liked-songs');
      const likedIds = new Set(data.map(song => song.videoId));
      setLikedSongs(likedIds);
    } catch (error) {
      console.error('Could not fetch liked songs', error);
      // If token is invalid (e.g., expired), log the user out
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }, [token, api]); // Dependency on token and the memoized api instance

  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const addLikedSong = async (song) => {
    try {
        await api.post('/user/liked-songs', song);
        setLikedSongs(prev => new Set(prev).add(song.videoId || song.id));
    } catch (error) {
        console.error('Failed to like song', error);
    }
  };

  const removeLikedSong = async (videoId) => {
    try {
        await api.delete(`/user/liked-songs/${videoId}`);
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            newSet.delete(videoId);
            return newSet;
        });
    } catch (error) {
        console.error('Failed to unlike song', error);
    }
  };

  const contextValue = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
    likedSongs,
    addLikedSong,
    removeLikedSong,
    fetchLikedSongs
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};