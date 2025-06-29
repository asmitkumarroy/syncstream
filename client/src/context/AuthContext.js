import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // NEW: State for user object
  const [likedSongs, setLikedSongs] = useState(new Set());

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: 'http://localhost:5001/api' });
    instance.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        config.headers['Authorization'] = `Bearer ${currentToken}`;
      }
      return config;
    });
    return instance;
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      const likedIds = new Set(data.likedSongs.map(song => song.videoId));
      setLikedSongs(likedIds);
    } catch (error) {
      console.error('Failed to fetch user data', error);
      logout(); // Logout if token is invalid
    }
  }, [api]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setUser(null);
      setLikedSongs(new Set());
    }
  }, [token, fetchUserData]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };
  
  const addLikedSong = async (song) => {
    try {
      await api.post('/user/liked-songs', song);
      setLikedSongs(prev => new Set(prev).add(song.videoId || song.id));
    } catch (error) { console.error('Failed to like song', error); }
  };

  const removeLikedSong = async (videoId) => {
    try {
      await api.delete(`/user/liked-songs/${videoId}`);
      setLikedSongs(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } catch (error) { console.error('Failed to unlike song', error); }
  };


  const contextValue = {
    token,
    user, // NEW: Provide user object
    login,
    logout,
    isAuthenticated: !!token,
    likedSongs,
    addLikedSong,
    removeLikedSong,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};