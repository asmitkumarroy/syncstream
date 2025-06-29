import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// We will create these pages next
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {<Route path="/login" element={<LoginPage />} /> }
        { <Route path="/register" element={<RegisterPage />} /> }
      </Routes>
    </Router>
  );
}

export default App;