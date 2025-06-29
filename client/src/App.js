import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPlaylistsPage from './pages/MyPlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import Sidebar from './components/Sidebar'; // Import Sidebar
import Player from './components/Player'; // We will move the player here
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Sidebar />
        <div className="main-view">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* MyPlaylistsPage is now handled by the sidebar, we can remove this route for now */}
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          </Routes>
        </div>
        <Player />
      </div>
    </Router>
  );
}

export default App;