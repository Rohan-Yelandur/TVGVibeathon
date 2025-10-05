import React, { useEffect, useRef, useState } from 'react';
import './CameraWindow.css';
import HandTracking from './HandTracking';
import Guitar from './Guitar';
import Piano from './Piano';
import Drums from './Drums';

const CameraWindow = ({ onFullscreenChange }) => {
  const videoRef = useRef(null);
  const guitarRef = useRef(null);
  const pianoRef = useRef(null);
  const drumsRef = useRef(null);
  const cameraWindowRef = useRef(null);
  const noHandsTimerRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNoHandsError, setShowNoHandsError] = useState(false);

  const handleHandsDetected = (landmarks) => {
    // Get the ref for the currently selected instrument
    const currentInstrumentRef = 
      selectedInstrument === 'piano' ? pianoRef : 
      selectedInstrument === 'drums' ? drumsRef : 
      guitarRef;
    
    if (!currentInstrumentRef.current) return;

    if (landmarks && landmarks.length > 0) {
      // Hands detected - clear any existing timer and hide error
      if (noHandsTimerRef.current) {
        clearTimeout(noHandsTimerRef.current);
        noHandsTimerRef.current = null;
      }
      setShowNoHandsError(false);

      if (selectedInstrument === 'piano') {
        // For piano, pass raw landmarks AND video element for proper coordinate mapping
        currentInstrumentRef.current.updatePressedKeys(landmarks, videoRef.current);
      } else if (selectedInstrument === 'drums') {
        // For drums, update drumstick positions
        currentInstrumentRef.current.updateDrumsticks(landmarks);
      } else {
        // For guitar, pass full hand landmarks (needs two hands for positioning)
        currentInstrumentRef.current.updatePressedKeys(landmarks);
      }
    } else {
      // No hands detected - start or continue timer
      if (!noHandsTimerRef.current && cameraStatus === 'active') {
        noHandsTimerRef.current = setTimeout(() => {
          setShowNoHandsError(true);
        }, 2000); // 2 second delay
      }

      // Clear all pressed keys / hide instruments
      if (selectedInstrument === 'piano') {
        currentInstrumentRef.current.updatePressedKeys(null, videoRef.current);
      } else if (selectedInstrument === 'drums') {
        currentInstrumentRef.current.updateDrumsticks([]);
      } else {
        currentInstrumentRef.current.updatePressedKeys([]);
      }
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
    console.log('Stopping camera...');
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.kind);
      });
      videoRef.current.srcObject = null;
    }
    
    // Clear the no hands timer
    if (noHandsTimerRef.current) {
      clearTimeout(noHandsTimerRef.current);
      noHandsTimerRef.current = null;
    }
    setShowNoHandsError(false);
    
    // Clear all pressed keys to stop any playing notes
    if (pianoRef.current) {
      pianoRef.current.updatePressedKeys(null, videoRef.current);
    }
    if (guitarRef.current) {
      guitarRef.current.updatePressedKeys([]);
    }
    
    setCameraStatus('idle');
    console.log('Camera stopped and status set to idle');
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
      // Stop camera when component unmounts (e.g., navigating away from home page)
      if (noHandsTimerRef.current) {
        clearTimeout(noHandsTimerRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Camera track stopped:', track.kind);
        });
        videoRef.current.srcObject = null;
      }
      // Clear any pressed keys
      if (pianoRef.current) {
        pianoRef.current.updatePressedKeys(null, videoRef.current);
      }
      if (guitarRef.current) {
        guitarRef.current.updatePressedKeys([]);
      }
    };
  }, []);

  return (
    <section className="camera-section">
      <div className="camera-container">
        <div className={`camera-window ${showNoHandsError ? 'no-hands-detected' : ''}`} ref={cameraWindowRef}>
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
          {cameraStatus === 'active' && selectedInstrument === 'drums' && (
            <Drums ref={drumsRef} />
          )}
          {showNoHandsError && cameraStatus === 'active' && (
            <div className="no-hands-warning">
              <div className="warning-icon">👋</div>
              <div className="warning-text">No hands detected</div>
              <div className="warning-subtext">Show your hands to the camera</div>
            </div>
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
                  {selectedInstrument === 'piano' && '🎹 Piano'}
                  {selectedInstrument === 'guitar' && '🎸 Guitar'}
                  {selectedInstrument === 'flute' && '🪈 Flute'}
                  {selectedInstrument === 'drums' && '🥁 Drums'}
                  {selectedInstrument === 'violin' && '🎻 Violin'}
                  {selectedInstrument === 'trumpet' && '🎺 Trumpet'}
                </span>
                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {isDropdownOpen && (
                <div className="instrument-options">
                  <div 
                    className={`instrument-option ${selectedInstrument === 'piano' ? 'selected' : ''}`}
                    onClick={() => {
                      // Clear guitar state when switching to piano
                      if (guitarRef.current && selectedInstrument !== 'piano') {
                        guitarRef.current.updatePressedKeys([]);
                      }
                      // Clear drums state when switching to piano
                      if (drumsRef.current && selectedInstrument !== 'piano') {
                        drumsRef.current.updateDrumsticks([]);
                      }
                      setSelectedInstrument('piano');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎹 Piano
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'guitar' ? 'selected' : ''}`}
                    onClick={() => {
                      // Clear piano state when switching to guitar
                      if (pianoRef.current && selectedInstrument !== 'guitar') {
                        pianoRef.current.updatePressedKeys(null, videoRef.current);
                      }
                      // Clear drums state when switching to guitar
                      if (drumsRef.current && selectedInstrument !== 'guitar') {
                        drumsRef.current.updateDrumsticks([]);
                      }
                      setSelectedInstrument('guitar');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎸 Guitar
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'flute' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInstrument('flute');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🪈 Flute
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'drums' ? 'selected' : ''}`}
                    onClick={() => {
                      // Clear other instruments when switching to drums
                      if (pianoRef.current && selectedInstrument !== 'drums') {
                        pianoRef.current.updatePressedKeys(null, videoRef.current);
                      }
                      if (guitarRef.current && selectedInstrument !== 'drums') {
                        guitarRef.current.updatePressedKeys([]);
                      }
                      setSelectedInstrument('drums');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🥁 Drums
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'violin' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInstrument('violin');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎻 Violin
                  </div>
                  <div 
                    className={`instrument-option ${selectedInstrument === 'trumpet' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInstrument('trumpet');
                      setIsDropdownOpen(false);
                    }}
                  >
                    🎺 Trumpet
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
