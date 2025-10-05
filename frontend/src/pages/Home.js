import React from 'react';
import Hero from '../components/Hero';
import CameraWindow from '../components/CameraWindow';
import Lessons from '../components/Lessons';
import Footer from '../components/Footer';

const Home = ({ onFullscreenChange }) => {
  return (
    <>
      <Hero />
      <CameraWindow onFullscreenChange={onFullscreenChange} />
      <Lessons />
      <Footer />
    </>
  );
};

export default Home;
