import React from 'react';
import Hero from '../components/Hero';
import CameraWindow from '../components/CameraWindow';

const Home = ({ onFullscreenChange }) => {
  return (
    <>
      <Hero />
      <CameraWindow onFullscreenChange={onFullscreenChange} />
    </>
  );
};

export default Home;
