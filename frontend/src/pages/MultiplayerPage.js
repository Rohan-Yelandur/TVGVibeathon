import React, { useEffect, useRef, useState } from 'react';
import './MultiplayerPage.css';
import HandTracking from '../components/HandTracking';
import Piano from '../components/Piano';
import Guitar from '../components/Guitar';
import Drums from '../components/Drums';
import PeerConnectionManager from '../services/PeerConnectionManager';
import AudioStreamManager from '../utils/AudioStreamManager';

const MultiplayerPage = () => {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pianoRef = useRef(null);
  const guitarRef = useRef(null);
  const drumsRef = useRef(null);
  const peerManagerRef = useRef(null);
  const noHandsTimerRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('idle');
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, ready, connecting, connected, error
  const [errorMessage, setErrorMessage] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNoHandsError, setShowNoHandsError] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Initialize PeerJS when component mounts
  useEffect(() => {
    const initializePeer = async () => {
      try {
        peerManagerRef.current = new PeerConnectionManager();
        
        // Set up callbacks
        peerManagerRef.current.onConnectionStatus((status) => {
          setConnectionStatus(status);
          if (status === 'error') {
            setErrorMessage('Connection error. Please try again.');
          }
        });

        peerManagerRef.current.onRemoteStream((stream) => {
          console.log('Remote stream received, setting up playback');
          
          // Set up remote video
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.play().catch(e => console.error('Error playing remote video:', e));
          }
          
          // Set up remote audio
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.play().catch(e => console.error('Error playing remote audio:', e));
          }
        });

        peerManagerRef.current.onError((error) => {
          console.error('Peer connection error:', error);
          setErrorMessage(`Connection error: ${error.type || 'Unknown error'}`);
        });

        // Initialize and get peer ID
        const peerId = await peerManagerRef.current.initialize();
        setMyPeerId(peerId);
        
      } catch (error) {
        console.error('Failed to initialize peer connection:', error);
        setErrorMessage('Failed to initialize connection system');
        setConnectionStatus('error');
      }
    };

    initializePeer();

    return () => {
      // Cleanup on unmount
      if (peerManagerRef.current) {
        peerManagerRef.current.cleanup();
      }
      if (noHandsTimerRef.current) {
        clearTimeout(noHandsTimerRef.current);
      }
      AudioStreamManager.cleanup();
    };
  }, []);

  // Handle hand tracking detection
  const handleHandsDetected = (landmarks) => {
    const currentInstrumentRef = 
      selectedInstrument === 'piano' ? pianoRef : 
      selectedInstrument === 'drums' ? drumsRef : 
      guitarRef;
    
    if (!currentInstrumentRef.current) return;

    if (landmarks && landmarks.length > 0) {
      if (noHandsTimerRef.current) {
        clearTimeout(noHandsTimerRef.current);
        noHandsTimerRef.current = null;
      }
      setShowNoHandsError(false);

      if (selectedInstrument === 'piano') {
        currentInstrumentRef.current.updatePressedKeys(landmarks, videoRef.current);
      } else if (selectedInstrument === 'drums') {
        currentInstrumentRef.current.updateDrumsticks(landmarks);
      } else {
        currentInstrumentRef.current.updatePressedKeys(landmarks);
      }
    } else {
      if (!noHandsTimerRef.current && cameraStatus === 'active') {
        noHandsTimerRef.current = setTimeout(() => {
          setShowNoHandsError(true);
        }, 2000);
      }

      if (selectedInstrument === 'piano') {
        currentInstrumentRef.current.updatePressedKeys(null, videoRef.current);
      } else if (selectedInstrument === 'drums') {
        currentInstrumentRef.current.updateDrumsticks([]);
      } else {
        currentInstrumentRef.current.updatePressedKeys([]);
      }
    }
  };

  // Start local camera and audio
  const startSession = async () => {
    setCameraStatus('requesting');
    setErrorMessage('');

    try {
      // Get video stream from camera
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      // Initialize audio capture from Tone.js
      const audioStream = AudioStreamManager.initialize();
      
      if (!audioStream) {
        throw new Error('Failed to initialize audio stream');
      }

      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      // Set the combined stream for peer connection
      if (peerManagerRef.current) {
        peerManagerRef.current.setLocalStream(combinedStream);
      }

      setCameraStatus('active');

    } catch (error) {
      setCameraStatus('error');
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Camera access denied. Please allow camera permissions.');
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No camera found. Please connect a camera.');
      } else {
        setErrorMessage('Failed to start session. Please try again.');
      }
      console.error('Session start error:', error);
    }
  };

  // Connect to a remote peer
  const connectToPeer = async () => {
    if (!remotePeerId.trim()) {
      setErrorMessage('Please enter a peer ID');
      return;
    }

    if (!peerManagerRef.current) {
      setErrorMessage('Connection system not ready');
      return;
    }

    if (cameraStatus !== 'active') {
      setErrorMessage('Please start your session first');
      return;
    }

    try {
      setErrorMessage('');
      await peerManagerRef.current.callPeer(remotePeerId.trim());
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      setErrorMessage('Failed to connect. Check the peer ID and try again.');
    }
  };

  // Disconnect from peer
  const disconnectFromPeer = () => {
    if (peerManagerRef.current) {
      peerManagerRef.current.disconnect();
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  // Copy peer ID to clipboard
  const copyPeerIdToClipboard = () => {
    navigator.clipboard.writeText(myPeerId).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    });
  };

  // Stop session
  const stopSession = () => {
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear timers
    if (noHandsTimerRef.current) {
      clearTimeout(noHandsTimerRef.current);
      noHandsTimerRef.current = null;
    }
    setShowNoHandsError(false);

    // Clear instrument states
    if (pianoRef.current) {
      pianoRef.current.updatePressedKeys(null, videoRef.current);
    }
    if (guitarRef.current) {
      guitarRef.current.updatePressedKeys([]);
    }
    if (drumsRef.current) {
      drumsRef.current.updateDrumsticks([]);
    }

    // Disconnect from peer
    disconnectFromPeer();

    setCameraStatus('idle');
  };

  return (
    <div className="multiplayer-page">
      <div className="multiplayer-container">
        <h1 className="multiplayer-title">🎵 Multiplayer Jam Session</h1>
        
        {/* Connection Panel */}
        <div className="connection-panel">
          <div className="peer-id-section">
            <label>Your Session ID:</label>
            <div className="peer-id-display">
              <code>{myPeerId || 'Initializing...'}</code>
              {myPeerId && (
                <button onClick={copyPeerIdToClipboard} className="copy-button" title="Copy to clipboard">
                  📋
                </button>
              )}
            </div>
            {showCopyNotification && <span className="copy-notification">✓ Copied!</span>}
          </div>

          {cameraStatus === 'active' && connectionStatus !== 'connected' && (
            <div className="connect-section">
              <label>Partner's Session ID:</label>
              <div className="connect-input-group">
                <input
                  type="text"
                  placeholder="Enter partner's ID"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  className="peer-id-input"
                />
                <button onClick={connectToPeer} className="connect-button">
                  Connect
                </button>
              </div>
            </div>
          )}

          <div className="status-section">
            <span className="status-label">Status:</span>
            <span className={`status-indicator status-${connectionStatus}`}>
              {connectionStatus === 'idle' && '⚪ Not Initialized'}
              {connectionStatus === 'ready' && '🟡 Ready to Connect'}
              {connectionStatus === 'connecting' && '🟠 Connecting...'}
              {connectionStatus === 'connected' && '🟢 Connected'}
              {connectionStatus === 'disconnected' && '🔴 Disconnected'}
              {connectionStatus === 'error' && '❌ Error'}
            </span>
          </div>

          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>

        {/* Video Streams */}
        <div className="video-section">
          {/* Local Video */}
          <div className={`video-container local-video ${showNoHandsError ? 'no-hands-detected' : ''}`}>
            <h3>You</h3>
            <div className="video-wrapper">
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
                </div>
              )}
              {cameraStatus !== 'active' && (
                <div className="video-placeholder">
                  <div className="placeholder-icon">📸</div>
                  <p>Camera Inactive</p>
                </div>
              )}
            </div>
            {cameraStatus === 'active' && (
              <div className="instrument-selector">
                <div 
                  className="instrument-dropdown-custom"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="selected-instrument">
                    {selectedInstrument === 'piano' && '🎹 Piano'}
                    {selectedInstrument === 'guitar' && '🎸 Guitar'}
                    {selectedInstrument === 'drums' && '🥁 Drums'}
                  </span>
                  <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                </div>
                {isDropdownOpen && (
                  <div className="instrument-options">
                    <div 
                      className={`instrument-option ${selectedInstrument === 'piano' ? 'selected' : ''}`}
                      onClick={() => {
                        if (guitarRef.current) guitarRef.current.updatePressedKeys([]);
                        if (drumsRef.current) drumsRef.current.updateDrumsticks([]);
                        setSelectedInstrument('piano');
                        setIsDropdownOpen(false);
                      }}
                    >
                      🎹 Piano
                    </div>
                    <div 
                      className={`instrument-option ${selectedInstrument === 'guitar' ? 'selected' : ''}`}
                      onClick={() => {
                        if (pianoRef.current) pianoRef.current.updatePressedKeys(null, videoRef.current);
                        if (drumsRef.current) drumsRef.current.updateDrumsticks([]);
                        setSelectedInstrument('guitar');
                        setIsDropdownOpen(false);
                      }}
                    >
                      🎸 Guitar
                    </div>
                    <div 
                      className={`instrument-option ${selectedInstrument === 'drums' ? 'selected' : ''}`}
                      onClick={() => {
                        if (pianoRef.current) pianoRef.current.updatePressedKeys(null, videoRef.current);
                        if (guitarRef.current) guitarRef.current.updatePressedKeys([]);
                        setSelectedInstrument('drums');
                        setIsDropdownOpen(false);
                      }}
                    >
                      🥁 Drums
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="video-container remote-video">
            <h3>Partner</h3>
            <div className="video-wrapper">
              <video 
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="camera-video"
                style={{ display: connectionStatus === 'connected' ? 'block' : 'none' }}
              />
              {connectionStatus !== 'connected' && (
                <div className="video-placeholder">
                  <div className="placeholder-icon">👤</div>
                  <p>
                    {connectionStatus === 'ready' && 'Waiting for partner...'}
                    {connectionStatus === 'connecting' && 'Connecting...'}
                    {(connectionStatus === 'idle' || connectionStatus === 'disconnected') && 'No partner'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden audio element for remote audio playback */}
        <audio ref={remoteAudioRef} autoPlay />

        {/* Control Buttons */}
        <div className="control-buttons">
          {cameraStatus !== 'active' ? (
            <button onClick={startSession} className="primary-button">
              Start Session
            </button>
          ) : (
            <>
              <button onClick={stopSession} className="danger-button">
                End Session
              </button>
              {connectionStatus === 'connected' && (
                <button onClick={disconnectFromPeer} className="secondary-button">
                  Disconnect Partner
                </button>
              )}
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="instructions-panel">
          <h3>How to Jam Together:</h3>
          <ol>
            <li>Click <strong>"Start Session"</strong> to activate your camera and instrument</li>
            <li>Share your <strong>Session ID</strong> with your partner</li>
            <li>Enter your partner's <strong>Session ID</strong> and click <strong>"Connect"</strong></li>
            <li>Once connected, you'll see each other and hear each other's music!</li>
            <li>Choose your instrument from the dropdown menu</li>
            <li>Use your hands to play - the camera tracks your movements</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerPage;
