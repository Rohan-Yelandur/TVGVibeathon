import React from 'react';
import Hero from '../components/Hero';
import CameraWindow from '../components/CameraWindow';
import About from '../components/About';
import Footer from '../components/Footer';

const Home = ({ onFullscreenChange }) => {
  return (
    <>
      <Hero />
      <CameraWindow onFullscreenChange={onFullscreenChange} />
      <About />
      <Footer />
    </>
  );
};

export default Home;
