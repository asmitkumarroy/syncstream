import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Navigate to login after logout
  };

  return (
    <header className="top-bar-header">
      <div className="header-nav-buttons">
        {/* We can add back/forward history buttons here in the future */}
      </div>
      <div className="header-auth-buttons">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <>
            <Link to="/register" className="signup-button">
              Sign Up
            </Link>
            <Link to="/login" className="login-button">
              Log In
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;