import React, { useState } from 'react';
import Hero from '../components/Hero';
import CameraWindow from '../components/CameraWindow';
import About from '../components/About';
import Footer from '../components/Footer';

const Home = ({ onFullscreenChange, activeLesson, onLessonComplete }) => {
  return (
    <>
      <Hero />
      <CameraWindow 
        onFullscreenChange={onFullscreenChange} 
        activeLesson={activeLesson}
        onLessonComplete={onLessonComplete}
      />
      <About />
      <Footer />
    </>
  );
};

export default Home;
