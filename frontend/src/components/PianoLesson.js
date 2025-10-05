import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PianoLesson.css';
import HandTracking from './HandTracking';
import Piano from './Piano';

// Define available piano lessons
const PIANO_LESSONS = {
  'single-notes': {
    id: 'single-notes',
    name: 'Single Notes',
    description: 'Learn to play individual notes',
    steps: [
      { notes: ['C4'], instruction: 'Play C4' },
      { notes: ['E4'], instruction: 'Play E4' },
      { notes: ['G4'], instruction: 'Play G4' },
      { notes: ['C5'], instruction: 'Play C5' }
    ]
  },
  'c-major-chord': {
    id: 'c-major-chord',
    name: 'C Major Chord',
    description: 'Learn to play the C major chord',
    steps: [
      { notes: ['C4'], instruction: 'Play C4' },
      { notes: ['E4'], instruction: 'Play E4' },
      { notes: ['G4'], instruction: 'Play G4' },
      { notes: ['C4', 'E4', 'G4'], instruction: 'Play C Major Chord (C4 + E4 + G4)' }
    ]
  },
  'chord-progression': {
    id: 'chord-progression',
    name: 'Chord Progression',
    description: 'Play a simple chord progression',
    steps: [
      { notes: ['C4', 'E4', 'G4'], instruction: 'Play C Major (C4 + E4 + G4)' },
      { notes: ['G4', 'B4', 'D5'], instruction: 'Play G Major (G4 + B4 + D5)' },
      { notes: ['A4', 'C5', 'E5'], instruction: 'Play A Minor (A4 + C5 + E5)' },
      { notes: ['F4', 'A4', 'C5'], instruction: 'Play F Major (F4 + A4 + C5)' }
    ]
  }
};

const PianoLesson = ({ lessonId, onExit }) => {
  const videoRef = useRef(null);
  const pianoRef = useRef(null);
  const cameraWindowRef = useRef(null);
  const noHandsTimerRef = useRef(null);
  const correctKeysPressedTimeRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNoHandsError, setShowNoHandsError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pressedKeys, setPressedKeys] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lesson = PIANO_LESSONS[lessonId];

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera();
    
    return () => {
      // Cleanup on unmount
      stopCamera();
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
  }, []);

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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setCameraStatus('active');
      }

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
    
    if (noHandsTimerRef.current) {
      clearTimeout(noHandsTimerRef.current);
      noHandsTimerRef.current = null;
    }
    
    if (correctKeysPressedTimeRef.current) {
      clearTimeout(correctKeysPressedTimeRef.current);
      correctKeysPressedTimeRef.current = null;
    }
    
    setShowNoHandsError(false);
    
    if (pianoRef.current) {
      pianoRef.current.updatePressedKeys(null, videoRef.current);
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

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && cameraStatus === 'active') {
        console.log('Tab hidden, stopping camera...');
        stopCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraStatus]);

  const handleHandsDetected = (landmarks) => {
    if (!pianoRef.current) return;

    if (landmarks && landmarks.length > 0) {
      if (noHandsTimerRef.current) {
        clearTimeout(noHandsTimerRef.current);
        noHandsTimerRef.current = null;
      }
      setShowNoHandsError(false);
      pianoRef.current.updatePressedKeys(landmarks, videoRef.current);
    } else {
      if (!noHandsTimerRef.current && cameraStatus === 'active') {
        noHandsTimerRef.current = setTimeout(() => {
          setShowNoHandsError(true);
        }, 2000);
      }
      pianoRef.current.updatePressedKeys(null, videoRef.current);
    }
  };

  const handleKeyPlayed = useCallback((keys) => {
    console.log('Keys pressed:', keys);
    setPressedKeys(keys);
  }, []);

  // Check if the correct keys are pressed
  useEffect(() => {
    if (lessonComplete || !lesson) return;
    
    const currentStepData = lesson.steps[currentStep];
    if (!currentStepData) return;
    
    const requiredNotes = currentStepData.notes;
    const pressedNotesList = Object.keys(pressedKeys);

    console.log('Required notes:', requiredNotes);
    console.log('Pressed notes:', pressedNotesList);

    // Check if all required notes are pressed and no extra notes
    const allRequiredPressed = requiredNotes.every(note => pressedNotesList.includes(note));
    const noExtraNotes = pressedNotesList.every(note => requiredNotes.includes(note));
    const correctKeysPressed = allRequiredPressed && noExtraNotes && pressedNotesList.length === requiredNotes.length;

    console.log('Correct keys pressed:', correctKeysPressed);

    if (correctKeysPressed && pressedNotesList.length > 0 && !stepCompleted) {
      // Show success checkmark
      setShowSuccess(true);
      setStepCompleted(true);

      // Wait a bit before advancing to next step
      if (!correctKeysPressedTimeRef.current) {
        console.log('Starting timer to advance to next step...');
        correctKeysPressedTimeRef.current = setTimeout(() => {
          console.log('Timer fired! Moving to next step...');
          setShowSuccess(false);
          
          if (currentStep < lesson.steps.length - 1) {
            // Move to next step
            setCurrentStep(prev => prev + 1);
            setStepCompleted(false); // Reset for next step
          } else {
            // Lesson complete
            setLessonComplete(true);
          }
          
          correctKeysPressedTimeRef.current = null;
        }, 1500); // 1.5 seconds delay before next step
      }
    } else if (!correctKeysPressed && !stepCompleted) {
      // Only clear the timer if the step hasn't been completed yet
      // This allows users to release keys before timer fires
      if (correctKeysPressedTimeRef.current) {
        console.log('Keys released before completing, clearing timer');
        clearTimeout(correctKeysPressedTimeRef.current);
        correctKeysPressedTimeRef.current = null;
      }
      setShowSuccess(false);
    }
  }, [pressedKeys, currentStep, lessonComplete, stepCompleted, lesson]);

  const handleRestart = () => {
    setCurrentStep(0);
    setLessonComplete(false);
    setShowSuccess(false);
    setStepCompleted(false);
    setPressedKeys({});
    if (correctKeysPressedTimeRef.current) {
      clearTimeout(correctKeysPressedTimeRef.current);
      correctKeysPressedTimeRef.current = null;
    }
  };

  if (!lesson) {
    return (
      <div className="piano-lesson-container">
        <div className="lesson-error">
          <h2>Lesson not found</h2>
          <button className="exit-lesson-button" onClick={onExit}>
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="piano-lesson-container">
      <div className="lesson-header">
        <button className="exit-lesson-button" onClick={onExit}>
          ← Back to Lessons
        </button>
        <div className="lesson-info">
          <h2 className="lesson-title">{lesson.name}</h2>
          <p className="lesson-description">{lesson.description}</p>
        </div>
        <div className="lesson-progress">
          Step {currentStep + 1} of {lesson.steps.length}
        </div>
      </div>

      <div className="camera-and-instruction">
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
          {cameraStatus === 'active' && (
            <Piano ref={pianoRef} onKeyPlayed={handleKeyPlayed} />
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
          
          {/* Instruction Overlay */}
          {cameraStatus === 'active' && !lessonComplete && (
            <div className="instruction-overlay">
              <div className="instruction-text">
                {lesson.steps[currentStep].instruction}
              </div>
              {Object.keys(pressedKeys).length > 0 && (
                <div className="pressed-keys-display">
                  Playing: {Object.keys(pressedKeys).join(', ')}
                </div>
              )}
              {showSuccess && (
                <div className="success-indicator">
                  <div className="checkmark">✓</div>
                  <div className="success-text">Correct!</div>
                </div>
              )}
            </div>
          )}

          {/* Lesson Complete Overlay */}
          {lessonComplete && (
            <div className="lesson-complete-overlay">
              <div className="complete-content">
                <div className="complete-icon">🎉</div>
                <h2 className="complete-title">Lesson Complete!</h2>
                <p className="complete-message">You've mastered {lesson.name}!</p>
                <div className="complete-actions">
                  <button className="restart-button" onClick={handleRestart}>
                    Restart Lesson
                  </button>
                  <button className="exit-button" onClick={onExit}>
                    Back to Lessons
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNoHandsError && cameraStatus === 'active' && (
            <div className="no-hands-warning">
              <div className="warning-icon">👋</div>
              <div className="warning-text">No hands detected</div>
              <div className="warning-subtext">Show your hands to the camera</div>
            </div>
          )}

          {cameraStatus !== 'active' && (
            <div className="camera-placeholder">
              <div className="camera-icon">
                {cameraStatus === 'requesting' ? '⏳' : '📸'}
              </div>
              <p className="placeholder-text">
                {cameraStatus === 'idle' && 'Starting camera...'}
                {cameraStatus === 'requesting' && 'Requesting camera access...'}
                {cameraStatus === 'error' && errorMessage}
              </p>
              {cameraStatus === 'error' && (
                <button className="start-camera-button" onClick={startCamera}>
                  Retry Camera
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { PIANO_LESSONS };
export default PianoLesson;
