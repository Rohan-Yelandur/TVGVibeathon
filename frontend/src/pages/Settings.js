import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [volume, setVolume] = useState(75);
  const [sensitivity, setSensitivity] = useState(50);

  return (
    <div className="settings-page">
      <div className="settings-container glass-card bounce-in">
        <div className="settings-header">
          <div className="settings-icon-wrapper">
            <svg 
              className="settings-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h1>Settings</h1>
          <p className="settings-subtitle">Customize your AR music experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-section glass-card">
            <h2 className="section-title">Audio Settings</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Master Volume</span>
                <span className="setting-value">{volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="slider"
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Sound Quality</span>
              </div>
              <div className="radio-group">
                <label className="radio-option glass-card">
                  <input type="radio" name="quality" defaultChecked />
                  <span>High (Recommended)</span>
                </label>
                <label className="radio-option glass-card">
                  <input type="radio" name="quality" />
                  <span>Medium</span>
                </label>
                <label className="radio-option glass-card">
                  <input type="radio" name="quality" />
                  <span>Low</span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section glass-card">
            <h2 className="section-title">Hand Tracking</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Tracking Sensitivity</span>
                <span className="setting-value">{sensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="slider"
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Hand Detection Mode</span>
              </div>
              <div className="toggle-group">
                <label className="toggle-option glass-card">
                  <input type="checkbox" defaultChecked />
                  <div className="toggle-content">
                    <span className="toggle-title">Show Hand Landmarks</span>
                    <span className="toggle-description">Display tracking points on camera feed</span>
                  </div>
                </label>
                <label className="toggle-option glass-card">
                  <input type="checkbox" />
                  <div className="toggle-content">
                    <span className="toggle-title">Mirror Mode</span>
                    <span className="toggle-description">Mirror video feed for natural interaction</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section glass-card">
            <h2 className="section-title">Visual Settings</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Background Effects</span>
              </div>
              <div className="toggle-group">
                <label className="toggle-option glass-card">
                  <input type="checkbox" defaultChecked />
                  <div className="toggle-content">
                    <span className="toggle-title">Animated Blobs</span>
                    <span className="toggle-description">Show animated background effects</span>
                  </div>
                </label>
                <label className="toggle-option glass-card">
                  <input type="checkbox" defaultChecked />
                  <div className="toggle-content">
                    <span className="toggle-title">Particle Effects</span>
                    <span className="toggle-description">Display particles when playing notes</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section glass-card">
            <h2 className="section-title">Preferences</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Default Instrument</span>
              </div>
              <select className="select-input glass-card">
                <option>Guitar</option>
                <option>Piano</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Camera Resolution</span>
              </div>
              <select className="select-input glass-card">
                <option>1920x1080 (Full HD)</option>
                <option>1280x720 (HD)</option>
                <option>640x480 (SD)</option>
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button className="save-button">Save Changes</button>
            <button className="reset-button">Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
