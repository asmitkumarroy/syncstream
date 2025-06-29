import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useAxios from '../hooks/useAxios';
import './Sidebar.css';
import { HomeIcon, SearchIcon, LibraryIcon, HeartIcon, PlusIcon } from '../icons';

const Sidebar = () => {
  const [playlists, setPlaylists] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const api = useAxios();

  useEffect(() => {
    // Fetch playlists only if the user is authenticated
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
      // Clear playlists on logout
      setPlaylists([]);
    }
  }, [isAuthenticated, api]);

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/" className="nav-item">
          <SearchIcon />
          <span>Search</span>
        </NavLink>
      </div>

      <div className="sidebar-library">
        <div className="library-header">
          <LibraryIcon />
          <span>Your Library</span>
          {/* This button can be wired up to the create playlist modal in the future */}
          <button className="add-playlist-btn"><PlusIcon /></button>
        </div>

        <div className="library-items">
          {isAuthenticated && (
            <>
              {/* Liked Songs Link */}
              <NavLink to="/collection/tracks" className="library-item">
                <div className="playlist-art-sm liked-songs-art">
                    <HeartIcon />
                </div>
                <div className="playlist-info-sm">
                    <span className="playlist-name-sm">Liked Songs</span>
                    <span className="playlist-meta-sm">Playlist</span> 
                </div>
              </NavLink>

              {/* User's Created Playlists */}
              {playlists.map(playlist => (
                <NavLink to={`/playlists/${playlist._id}`} key={playlist._id} className="library-item">
                  <div className="playlist-art-sm">🎵</div>
                  <div className="playlist-info-sm">
                    <span className="playlist-name-sm">{playlist.name}</span>
                    <span className="playlist-meta-sm">Playlist • {playlist.songs.length} songs</span>
                  </div>
                </NavLink>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;