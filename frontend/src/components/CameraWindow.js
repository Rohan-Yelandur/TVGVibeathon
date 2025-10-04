import React, { useEffect, useRef, useState } from 'react';
import './CameraWindow.css';
import HandTracking from './HandTracking';

const CameraWindow = () => {
  const videoRef = useRef(null);
  const cameraWindowRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          />
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
