import React from 'react';
import About from '../components/About';
import Footer from '../components/Footer';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <About />
      <Footer />
    </div>
  );
};

export default React.memo(AboutPage);
