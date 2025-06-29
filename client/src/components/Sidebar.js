import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useAxios from '../hooks/useAxios';
import './Sidebar.css';
import { HomeIcon, SearchIcon, LibraryIcon, PlusIcon, HeartIcon } from '../icons'; // We will add these

const Sidebar = () => {
  const [playlists, setPlaylists] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const api = useAxios();

  useEffect(() => {
    // Fetch playlists only if the user is logged in
    if (isAuthenticated) {
      const fetchPlaylists = async () => {
        try {
          const { data } = await api.get('/playlists');
          setPlaylists(data);
        } catch (error) {
          console.error('Failed to fetch playlists for sidebar', error);
        }
      };
      fetchPlaylists();
    } else {
      setPlaylists([]); // Clear playlists on logout
    }
  }, [isAuthenticated, api]);

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        {/* We can link this to a future search page */}
        <NavLink to="/" className="nav-item">
          <SearchIcon />
          <span>Search</span>
        </NavLink>
      </div>
      <div className="sidebar-library">
        <div className="library-header">
          <LibraryIcon />
          <span>Your Library</span>
          <button className="add-playlist-btn"><PlusIcon /></button>
        </div>
        <div className="library-items">
          {/* We will add a "Liked Songs" link here later */}
          {playlists.map(playlist => (
            <Link to={`/playlists/${playlist._id}`} key={playlist._id} className="library-item">
              <div className="playlist-art-sm">🎵</div>
              <div className="playlist-info-sm">
                <span className="playlist-name-sm">{playlist.name}</span>
                <span className="playlist-meta-sm">Playlist</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;