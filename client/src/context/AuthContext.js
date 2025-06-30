import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: 'http://localhost:5001/api' });
    instance.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) config.headers['Authorization'] = `Bearer ${currentToken}`;
      return config;
    });
    return instance;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLikedSongs(new Set());
    localStorage.removeItem('authToken');
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!token) {
        setUser(null);
        setLikedSongs(new Set());
        return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      setLikedSongs(new Set(data.likedSongs.map(song => song.videoId)));
    } catch (error) {
      console.error('Failed to fetch user data, logging out.', error);
      logout();
    }
  }, [token, api, logout]);

  useEffect(() => {
    fetchUserData();
  }, [token, fetchUserData]);

  const login = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  }, []);

  const addLikedSong = useCallback(async (song) => {
    try {
      await api.post('/user/liked-songs', song);
      setLikedSongs(prev => new Set(prev).add(song.videoId || song.id));
    } catch (error) { console.error('Failed to like song', error); }
  }, [api]);

  const removeLikedSong = useCallback(async (videoId) => {
    try {
      await api.delete(`/user/liked-songs/${videoId}`);
      setLikedSongs(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } catch (error) { console.error('Failed to unlike song', error); }
  }, [api]);

  const contextValue = useMemo(() => ({
    token, user, isAuthenticated: !!token, likedSongs,
    login, logout, addLikedSong, removeLikedSong,
  }), [token, user, likedSongs, login, logout, addLikedSong, removeLikedSong]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};