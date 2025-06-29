import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import LikedSongsPage from './pages/LikedSongsPage';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Header from './components/Header';
import RoomPage from './pages/RoomPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Sidebar />
        <main className="main-view">
          <Header />
          <Routes>
            <Route path="/room/:id" element={<RoomPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/collection/tracks" element={<LikedSongsPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          </Routes>
        </main>
        {/* The Player component is now inside the main wrapper */}
        <Player />
      </div>
    </Router>
  );
}

export default App;