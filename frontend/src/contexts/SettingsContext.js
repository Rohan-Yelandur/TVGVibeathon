import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Load settings from localStorage or use defaults
  const loadSettings = () => {
    const saved = localStorage.getItem('arMusicSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    // High-performance defaults
    return {
      volume: 75,
      soundQuality: 'high',
      trackingSensitivity: 70, // Maps to confidence threshold (0.7)
      trackingFPS: 60, // High FPS for smoothness
      showHandLandmarks: true,
      mirrorMode: false,
      animatedBlobs: true,
      particleEffects: true,
      defaultInstrument: 'guitar',
      cameraResolution: '1920x1080'
    };
  };

  const [settings, setSettings] = useState(loadSettings);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('arMusicSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = () => {
    const defaults = {
      volume: 75,
      soundQuality: 'high',
      trackingSensitivity: 70,
      trackingFPS: 60,
      showHandLandmarks: true,
      mirrorMode: false,
      animatedBlobs: true,
      particleEffects: true,
      defaultInstrument: 'guitar',
      cameraResolution: '1920x1080'
    };
    setSettings(defaults);
    localStorage.setItem('arMusicSettings', JSON.stringify(defaults));
  };

  // Derived values for performance - memoized to prevent unnecessary recalculations
  const getTrackingConfig = useCallback(() => {
    // Convert sensitivity (0-100) to confidence threshold (0.3-0.9)
    const confidence = 0.3 + (settings.trackingSensitivity / 100) * 0.6;
    
    return {
      minHandDetectionConfidence: confidence,
      minHandPresenceConfidence: confidence,
      minTrackingConfidence: confidence,
      fps: settings.trackingFPS
    };
  }, [settings.trackingSensitivity, settings.trackingFPS]);

  const value = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    getTrackingConfig
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
