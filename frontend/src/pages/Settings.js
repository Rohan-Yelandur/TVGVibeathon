import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import './Settings.css';

const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [saveIndicator, setSaveIndicator] = useState(false);

  // Show save indicator when settings change
  useEffect(() => {
    setSaveIndicator(true);
    const timer = setTimeout(() => setSaveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, [settings]);

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
          {saveIndicator && (
            <div className="save-indicator">
              ✓ Settings auto-saved and applied
            </div>
          )}
        </div>

        <div className="settings-content">
          <div className="settings-section glass-card">
            <h2 className="section-title">Audio Settings</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Master Volume</span>
                <span className="setting-value">{settings.volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                className="slider"
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Sound Quality</span>
              </div>
              <div className="radio-group">
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="quality" 
                    checked={settings.soundQuality === 'high'}
                    onChange={() => updateSetting('soundQuality', 'high')}
                  />
                  <span>High (Recommended)</span>
                </label>
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="quality" 
                    checked={settings.soundQuality === 'medium'}
                    onChange={() => updateSetting('soundQuality', 'medium')}
                  />
                  <span>Medium</span>
                </label>
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="quality" 
                    checked={settings.soundQuality === 'low'}
                    onChange={() => updateSetting('soundQuality', 'low')}
                  />
                  <span>Low</span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section glass-card">
            <h2 className="section-title">Hand Tracking</h2>
            <div className="setting-item">
              <div className="setting-label">
                <span>Tracking Sensitivity<small> (Higher values = more accurate but may lag on slower devices)</small></span>
                <span className="setting-value">{settings.trackingSensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="90" 
                value={settings.trackingSensitivity}
                onChange={(e) => updateSetting('trackingSensitivity', parseInt(e.target.value))}
                className="slider"
              />
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Tracking Frame Rate</span>
                <span className="setting-value">{settings.trackingFPS} FPS</span>
              </div>
              <div className="radio-group">
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="fps" 
                    checked={settings.trackingFPS === 30}
                    onChange={() => updateSetting('trackingFPS', 30)}
                  />
                  <span>30 FPS (Low Performance)</span>
                </label>
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="fps" 
                    checked={settings.trackingFPS === 45}
                    onChange={() => updateSetting('trackingFPS', 45)}
                  />
                  <span>45 FPS (Balanced)</span>
                </label>
                <label className="radio-option glass-card">
                  <input 
                    type="radio" 
                    name="fps" 
                    checked={settings.trackingFPS === 60}
                    onChange={() => updateSetting('trackingFPS', 60)}
                  />
                  <span>60 FPS (High Performance)</span>
                </label>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Hand Detection Mode</span>
              </div>
              <div className="toggle-group">
                <label className="toggle-option glass-card">
                  <input 
                    type="checkbox" 
                    checked={settings.showHandLandmarks}
                    onChange={(e) => updateSetting('showHandLandmarks', e.target.checked)}
                  />
                  <div className="toggle-content">
                    <span className="toggle-title">Show Hand Landmarks</span>
                    <span className="toggle-description">Display tracking points on camera feed</span>
                  </div>
                </label>
                <label className="toggle-option glass-card">
                  <input 
                    type="checkbox" 
                    checked={settings.mirrorMode}
                    onChange={(e) => updateSetting('mirrorMode', e.target.checked)}
                  />
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
                  <input 
                    type="checkbox" 
                    checked={settings.animatedBlobs}
                    onChange={(e) => updateSetting('animatedBlobs', e.target.checked)}
                  />
                  <div className="toggle-content">
                    <span className="toggle-title">Animated Blobs</span>
                    <span className="toggle-description">Show animated background effects</span>
                  </div>
                </label>
                <label className="toggle-option glass-card">
                  <input 
                    type="checkbox" 
                    checked={settings.particleEffects}
                    onChange={(e) => updateSetting('particleEffects', e.target.checked)}
                  />
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
              <select 
                className="select-input glass-card"
                value={settings.defaultInstrument}
                onChange={(e) => updateSetting('defaultInstrument', e.target.value)}
              >
                <option value="guitar">Guitar</option>
                <option value="piano">Piano</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-label">
                <span>Camera Resolution</span>
              </div>
              <select 
                className="select-input glass-card"
                value={settings.cameraResolution}
                onChange={(e) => updateSetting('cameraResolution', e.target.value)}
              >
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="640x480">640x480 (SD)</option>
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button className="reset-button" onClick={resetSettings}>Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
