import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BlobBackground from './components/BlobBackground';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Lessons from './components/Lessons';
import PianoLessonPage from './pages/PianoLessonPage';
import MultiplayerPage from './pages/MultiplayerPage';
import { SettingsProvider } from './contexts/SettingsContext';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <BlobBackground isActive={!isFullscreen} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home onFullscreenChange={setIsFullscreen} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/piano-lesson/:lessonId" element={<PianoLessonPage />} />
          <Route path="/multiplayer" element={<MultiplayerPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

export default App;
