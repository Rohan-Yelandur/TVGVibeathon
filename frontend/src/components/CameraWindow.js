import React, { useEffect, useRef, useState } from 'react';
import './CameraWindow.css';
import HandTracking from './HandTracking';
import Piano from './Piano';
import Guitar from './Guitar';

const CameraWindow = () => {
  const videoRef = useRef(null);
  const pianoRef = useRef(null);
  const guitarRef = useRef(null);
  const cameraWindowRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('piano');

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
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleHandsDetected = (landmarks) => {
    // Get the ref for the currently selected instrument
    const currentInstrumentRef = selectedInstrument === 'piano' ? pianoRef : guitarRef;
    
    if (currentInstrumentRef.current && landmarks) {
      const fingertips = [];
      const fingertipIndices = [4, 8, 12, 16, 20]; // Indices for fingertips
      
      landmarks.forEach(hand => {
        fingertipIndices.forEach(index => {
          fingertips.push(hand[index]);
        });
      });

      currentInstrumentRef.current.updatePressedKeys(fingertips);
    } else if (currentInstrumentRef.current) {
      currentInstrumentRef.current.updatePressedKeys(null);
    }
  };

  return (
    <section className="camera-section">
      <div className="camera-container glass-card bounce-in">
        <div className="camera-header">
          <h2>Jump on Stage!</h2>
          <p>
            {cameraStatus === 'idle' && 'Ready to start'}
            {cameraStatus === 'requesting' && 'Requesting camera access...'}
            {cameraStatus === 'active' && 'Camera active'}
            {cameraStatus === 'error' && 'Camera error'}
          </p>
        </div>

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
          {cameraStatus === 'active' && (
            <>
              <div style={{ display: selectedInstrument === 'piano' ? 'block' : 'none' }}>
                <Piano ref={pianoRef} />
              </div>
              <div style={{ display: selectedInstrument === 'guitar' ? 'block' : 'none' }}>
                <Guitar ref={guitarRef} />
              </div>
            </>
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
              <select 
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="instrument-dropdown"
              >
                <option value="piano">🎹 Piano</option>
                <option value="guitar">🎸 Guitar</option>
              </select>
            </div>
          )}
          {cameraStatus !== 'active' && (
            <div className="camera-placeholder">
              <div className="camera-icon">
                {cameraStatus === 'requesting' ? '⏳' : '📸'}
              </div>
              <p className="placeholder-text">
                {cameraStatus === 'idle' && 'Ready to start'}
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
