import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { SocketProvider } from './context/SocketContext'; // 1. Import SocketProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider> {/* 2. Wrap PlayerProvider and App */}
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);