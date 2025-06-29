import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables to hold our data
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null); // Reference to the audio player element

  // Function to handle the search form submission
  const handleSearch = async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    setIsLoading(true);
    setSongs([]); // Clear previous results

    try {
      // Make a GET request to our backend search API
      const response = await axios.get(`http://localhost:5001/api/search?q=${searchTerm}`);
      setSongs(response.data); // Update the songs state with the results
    } catch (error) {
      console.error('Error fetching search results:', error);
      alert('Failed to fetch search results.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle clicking on a song in the list
  const handleSongClick = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SyncStream</h1>
        <p>Stream YouTube audio, create shared listening parties.</p>
      </header>

      <main>
        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a song..."
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        <div className="search-results">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
              onClick={() => handleSongClick(song)}
            >
              <img src={song.thumbnail} alt={song.title} className="song-thumbnail" />
              <div className="song-details">
                <p className="song-title">{song.title}</p>
                <p className="song-duration">{song.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Audio Player - only shows when a song is selected */}
      {currentSong && (
        <footer className="audio-player">
          <p>Now Playing: <strong>{currentSong.title}</strong></p>
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={`http://localhost:5001/api/stream/${currentSong.id}`}
            onError={(e) => console.error('Audio Player Error:', e)}
          >
            Your browser does not support the audio element.
          </audio>
        </footer>
      )}
    </div>
  );
}

export default App;