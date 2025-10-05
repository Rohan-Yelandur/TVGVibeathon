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
      </div>
    </section>
  );
};

export default React.memo(About);
