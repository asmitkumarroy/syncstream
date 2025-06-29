import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext'; // Import the socket hook
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const socket = useSocket(); // Get the socket instance
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return; // Do nothing if socket is not yet connected

    // Listen for the 'room_created' event from the server
    const handleRoomCreated = (roomId) => {
      console.log(`Server created room, navigating to /room/${roomId}`);
      navigate(`/room/${roomId}`);
    };
    
    socket.on('room_created', handleRoomCreated);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('room_created', handleRoomCreated);
    };
  }, [socket, navigate]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = () => {
    if (socket && user) {
        // Emit the 'create_room' event to the server with the username
        socket.emit('create_room', user.username);
    }
  };

  return (
    <header className="top-bar-header">
      <div className="header-nav-buttons">
        {/* Future navigation buttons can go here */}
      </div>
      <div className="header-auth-buttons">
        {isAuthenticated ? (
          <>
            {/* NEW: Button to start a listening party */}
            <button onClick={handleCreateRoom} className="party-button">
              Start a Party
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
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