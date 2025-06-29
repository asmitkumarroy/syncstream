import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear the token and state
    navigate('/'); // Redirect to homepage
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SyncStream
        </Link>
        <div className="nav-menu">
          {isAuthenticated ? (
            // If user is authenticated, show Logout button
            <>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            // If not authenticated, show Login and Register links
            <>
              <Link to="/login" className="nav-links">
                Login
              </Link>
              <Link to="/register" className="nav-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;