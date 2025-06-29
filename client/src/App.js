import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar'; // Import the Navbar
import MyPlaylistsPage from './pages/MyPlaylistsPage';

function App() {
  return (
    <Router>
      {/* Navbar is placed here, outside of Routes, so it's on every page */}
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/playlists" element={<MyPlaylistsPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;