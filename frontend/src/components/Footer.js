import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Harmonium. All rights reserved. Democratizing music for everyone.
          </p>
          <p className="footer-tech">
            Built with <span className="heart">♥</span> for the 2025 TVG Vibeathon
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
