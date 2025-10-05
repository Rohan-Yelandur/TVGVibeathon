import React from 'react';
import './About.css';

const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        {/* Mission Statement */}
        <div className="about-mission glass-card">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <p className="mission-text">
              At Harmonium, we're <strong>democratizing musical education and expressiveness</strong>. 
              We believe that everyone should have the power to create, learn, and perform music 
              without the barriers of expensive instruments or years of traditional training. 
              Through cutting-edge augmented reality technology, we're making music accessible, 
              intuitive, and expressive for all.
            </p>
            <div className="mission-graphic">
              <div className="trend-icon">📈</div>
            </div>
          </div>
        </div>

        {/* Why Harmonium */}
        <div className="about-why">
          <h2 className="section-title">Why Harmonium?</h2>
          <div className="why-grid">
            <div className="why-card glass-card">
              <div className="why-icon">🎵</div>
              <h3>Instant Access</h3>
              <p>No need for expensive instruments. Start playing piano, guitar, and more instantly through your camera.</p>
            </div>
            <div className="why-card glass-card">
              <div className="why-icon">🎯</div>
              <h3>Intuitive Learning</h3>
              <p>Learn by doing with real-time hand tracking and visual feedback that makes musical concepts click.</p>
            </div>
            <div className="why-card glass-card">
              <div className="why-icon">🏆</div>
              <h3>Trusted by State-Level Musicians</h3>
              <p>Professional performers and educators rely on Harmonium for practice, performance, and teaching.</p>
            </div>
          </div>
        </div>

        {/* Technologies Stack */}
        <div className="about-stack glass-card">
          <h2 className="section-title">Powered by Cutting-Edge Technology</h2>
          <div className="tech-stack-grid">
            <div className="stack-item">
              <div className="stack-logo">⚛️</div>
              <h4>React</h4>
            </div>
            <div className="stack-item">
              <div className="stack-logo">✌️</div>
              <h4>MediaPipe</h4>
            </div>
            <div className="stack-item">
              <div className="stack-logo">🎵</div>
              <h4>Web Audio API</h4>
            </div>
            <div className="stack-item">
              <div className="stack-logo">📹</div>
              <h4>WebRTC</h4>
            </div>
            <div className="stack-item">
              <div className="stack-logo">🎨</div>
              <h4>Canvas API</h4>
            </div>
          </div>
        </div>

        {/* View Code and Demos */}
        <div className="about-resources glass-card">
          <h2 className="section-title">View Code and Demos</h2>
          <div className="resources-links">
            <a 
              href="https://github.com/Rohan-Yelandur/TVGVibeathon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="resource-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="resource-icon">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>View on GitHub</span>
            </a>
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="resource-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="resource-icon">
                <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31 0 4.436-3.21 6.302-6.456 6.302H7.595zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861.009-2.569-1.096-3.853-3.767-3.853z"/>
              </svg>
              <span>View on Devpost</span>
            </a>
          </div>
        </div>

        {/* Meet the Founders */}
        <div className="about-founders glass-card">
          <h2 className="section-title">Meet the Founders</h2>
          <div className="founders-grid">
            <a 
              href="https://www.linkedin.com/in/rohan-yelandur/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="founder-card"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="founder-icon">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="founder-name">Rohan Yelandur</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/ayaansunesara/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="founder-card"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="founder-icon">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="founder-name">Ayaan Sunesara</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/aditya-pulipaka/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="founder-card"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="founder-icon">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="founder-name">Aditya Pulipaka</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
