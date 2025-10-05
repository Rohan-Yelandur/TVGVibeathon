import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import BlobBackground from './components/BlobBackground';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Lessons from './components/Lessons';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const navigate = useNavigate();

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
    navigate('/');
  };

  const handleLessonComplete = () => {
    setActiveLesson(null);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <BlobBackground isActive={!isFullscreen} />
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              onFullscreenChange={setIsFullscreen} 
              activeLesson={activeLesson}
              onLessonComplete={handleLessonComplete}
            />
          } 
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lessons" element={<Lessons onLessonSelect={handleLessonSelect} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
