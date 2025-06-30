import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext'; // Import player context
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { enterRoom } = usePlayer(); // Get the new function
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    const handleRoomCreated = (roomId) => {
      // When room is created, set global room state and make US the host
      enterRoom(roomId, socket.id); 
      navigate(`/room/${roomId}`);
    };
    socket.on('room_created', handleRoomCreated);
    return () => { socket.off('room_created', handleRoomCreated); };
  }, [socket, navigate, enterRoom]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = () => {
    if (socket && user) {
      socket.emit('create_room', user.username);
    }
  };

  return (
    <header className="top-bar-header">
      <div className="header-nav-buttons"></div>
      <div className="header-auth-buttons">
        {isAuthenticated ? (
          <>
            <button onClick={handleCreateRoom} className="party-button">Start a Party</button>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" className="signup-button">Sign Up</Link>
            <Link to="/login" className="login-button">Log In</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;