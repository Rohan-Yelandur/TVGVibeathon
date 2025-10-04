import React, { useEffect, useRef, useState } from 'react';
import './CameraWindow.css';
import HandTracking from './HandTracking';
import Guitar from './Guitar';
import Piano from './Piano';

const CameraWindow = ({ onFullscreenChange }) => {
  const videoRef = useRef(null);
  const guitarRef = useRef(null);
  const pianoRef = useRef(null);
  const cameraWindowRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('guitar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleHandsDetected = (landmarks) => {
    // Get the ref for the currently selected instrument
    const currentInstrumentRef = selectedInstrument === 'piano' ? pianoRef : guitarRef;
    
    if (!currentInstrumentRef.current) return;

    if (landmarks && landmarks.length > 0) {
      if (selectedInstrument === 'piano') {
        // For piano, pass raw landmarks so Piano component can extract finger joints
        currentInstrumentRef.current.updatePressedKeys(landmarks);
      } else {
        // For guitar, extract fingertips (including thumb)
        const fingertips = [];
        const fingertipIndices = [4, 8, 12, 16, 20];
        
        landmarks.forEach(hand => {
          fingertipIndices.forEach(index => {
            fingertips.push(hand[index]);
          });
        });

        currentInstrumentRef.current.updatePressedKeys(fingertips);
      }
    } else {
      // No hands detected, clear all pressed keys
      currentInstrumentRef.current.updatePressedKeys(null);
    }
  };

  const startCamera = async () => {
    setCameraStatus('requesting');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to load and play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setCameraStatus('active');
      }

      // Listen for stream ending (camera disconnected)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setCameraStatus('error');
        setErrorMessage('Camera disconnected. Please reconnect your camera.');
      });

    } catch (error) {
      setCameraStatus('error');
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Camera access denied. Please allow camera permissions.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No camera found. Please connect a camera.');
      } else {
        setErrorMessage('Failed to access camera. Please try again.');
      }
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  };

  const toggleFullscreen = async () => {
    if (!cameraWindowRef.current) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (cameraWindowRef.current.requestFullscreen) {
          await cameraWindowRef.current.requestFullscreen();
        } else if (cameraWindowRef.current.webkitRequestFullscreen) {
          await cameraWindowRef.current.webkitRequestFullscreen();
        } else if (cameraWindowRef.current.msRequestFullscreen) {
          await cameraWindowRef.current.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(fullscreenActive);
      // Notify parent component about fullscreen state change
      if (onFullscreenChange) {
        onFullscreenChange(fullscreenActive);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.instrument-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section className="camera-section">
      <div className="camera-container glass-card bounce-in">
        <div className="camera-window" ref={cameraWindowRef}>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ display: cameraStatus === 'active' ? 'block' : 'none' }}
          />
          <HandTracking 
            videoRef={videoRef}
            isActive={cameraStatus === 'active'}
            onHandsDetected={handleHandsDetected}
          />
          {cameraStatus === 'active' && selectedInstrument === 'guitar' && (
            <Guitar ref={guitarRef} />
          )}
          {cameraStatus === 'active' && selectedInstrument === 'piano' && (
            <Piano ref={pianoRef} />
          )}
          {cameraStatus === 'active' && (
            <button 
              className="stop-camera-button" 
              onClick={stopCamera}
              title="Stop Camera"
            >
              ✕
            </button>
          )}
          {/* Show fullscreen button when camera is active OR when in fullscreen mode */}
          {(cameraStatus === 'active' || isFullscreen) && (
            <button 
              className="fullscreen-button" 
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? '⇱' : '⤢'}
            </button>
          )}
          {cameraStatus === 'active' && (
            <div className="instrument-selector">
              <div 
                className="instrument-dropdown-custom"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="selected-instrument">
                  {selectedInstrument === 'piano' ? '🎹 Piano' : '🎸 Guitar'}
                </span>
                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {isDropdownOpen && (
                <div className="instrument-options">
                  <div 
                    className={`instrument-option ${selectedInstrument === 'piano' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInstrument('piano');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎹 Piano
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'guitar' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInstrument('guitar');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎸 Guitar
                  </div>
                </div>
              )}
            </div>
          )}
          {cameraStatus !== 'active' && (
            <div className="camera-placeholder">
              <div className="camera-icon">
                {cameraStatus === 'requesting' ? '⏳' : '📸'}
              </div>
              <p className="placeholder-text">
                {cameraStatus === 'idle' && 'Jump on Stage!'}
                {cameraStatus === 'requesting' && 'Requesting camera access...'}
                {cameraStatus === 'error' && errorMessage}
              </p>
              {cameraStatus !== 'requesting' && (
                <button className="start-camera-button" onClick={startCamera}>
                  {cameraStatus === 'error' ? 'Retry Camera' : 'Start Camera'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CameraWindow;
