import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className='Hero'>
      <h1 className="hero-title">Harmonium</h1>
      <p className="hero-subtitle">Experience Music Through Augmented Reality</p>
    </div>
  );
};

export default React.memo(Hero);
