import React, { useEffect, useRef, useState } from 'react';
import './CameraWindow.css';

const CameraWindow = () => {
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle'); // idle, requesting, active, error
  const [errorMessage, setErrorMessage] = useState('');

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

        <div className="camera-window">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ display: cameraStatus === 'active' ? 'block' : 'none' }}
          />
          {cameraStatus !== 'active' && (
            <div className="camera-placeholder">
              <div className="camera-icon">
                {cameraStatus === 'requesting' ? '⏳' : '📸'}
              </div>
              <p>
                {cameraStatus === 'idle' && 'Click "Start Camera" to begin'}
                {cameraStatus === 'requesting' && 'Requesting camera access...'}
                {cameraStatus === 'error' && errorMessage}
              </p>
            </div>
          )}
        </div>

        <div className="camera-controls">
          {cameraStatus === 'active' ? (
            <button className="control-button" onClick={stopCamera}>
              Stop Camera
            </button>
          ) : (
            <button className="control-button" onClick={startCamera}>
              {cameraStatus === 'error' ? 'Retry Camera' : 'Start Camera'}
            </button>
          )}
          <button className="control-button">Settings</button>
        </div>
      </div>
    </section>
  );
};

export default CameraWindow;
