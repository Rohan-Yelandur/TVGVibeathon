import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import BlobBackground from './components/BlobBackground';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Lessons from './components/Lessons';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <BlobBackground isActive={!isFullscreen} />
        <Routes>
          <Route path="/" element={<Home onFullscreenChange={setIsFullscreen} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/lessons" element={<Lessons />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
