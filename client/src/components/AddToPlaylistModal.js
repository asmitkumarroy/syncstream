import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import './AddToPlaylistModal.css';

const AddToPlaylistModal = ({ song, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const api = useAxios();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data } = await api.get('/playlists');
        setPlaylists(data);
      } catch (error) {
        setFeedback('Could not load your playlists.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [api]);

  const handleAddToPlaylist = async (playlistId) => {
    setFeedback(`Adding '${song.title}'...`);
    try {
      await api.post(`/playlists/${playlistId}/songs`, song);
      setFeedback(`Successfully added to playlist!`);
      setTimeout(() => {
        onClose(); // Close the modal on success
      }, 1500);
    } catch (error) {
      setFeedback('Failed to add song.');
      console.error(error);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-to-playlist-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add to Playlist</h2>
        {feedback && <p className="feedback-text">{feedback}</p>}
        {loading ? (
          <p>Loading playlists...</p>
        ) : (
          <div className="playlists-selection-list">
            {playlists.length > 0 ? (
              playlists.map(playlist => (
                <div key={playlist._id} className="playlist-selection-item" onClick={() => handleAddToPlaylist(playlist._id)}>
                  <p className="playlist-name">{playlist.name}</p>
                  <p className="song-count">{playlist.songs.length} songs</p>
                </div>
              ))
            ) : (
              <p>You have no playlists. Create one from the 'My Playlists' page.</p>
            )}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;