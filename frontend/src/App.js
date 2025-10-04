import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import BlobBackground from './components/BlobBackground';
import Hero from './components/Hero';
import CameraWindow from './components/CameraWindow';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <BlobBackground isActive={!isFullscreen} />
      <Hero />
      <CameraWindow onFullscreenChange={setIsFullscreen} />
    </div>
  );
}

export default App;
