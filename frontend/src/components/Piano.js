import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './Piano.css';
import * as Tone from 'tone';

// Audio context for playing piano sounds
let audioContext = null;

// Initialize audio context (lazy initialization to avoid autoplay issues)
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const activeNotes = {}; // State to track playing notes

// Map note names to frequencies (A4 = 440Hz standard)
// Using Tone.js salamander piano samples - includes C3 to C6
var noteFrequencies = {
  'C3': 'C3.mp3', 'D3': 'D3.mp3', 'E3': 'E3.mp3', 'F3': 'F3.mp3', 'G3': 'G3.mp3', 'A3': 'A3.mp3', 'B3': 'B3.mp3',
  'C4': 'C4.mp3', 'D4': 'D4.mp3', 'E4': 'E4.mp3', 'F4': 'F4.mp3', 'G4': 'G4.mp3', 'A4': 'A4.mp3', 'B4': 'B4.mp3',
  'C5': 'C5.mp3', 'D5': 'D5.mp3', 'E5': 'E5.mp3', 'F5': 'F5.mp3', 'G5': 'G5.mp3', 'A5': 'A5.mp3', 'B5': 'B5.mp3',
  'C6': 'C6.mp3',
  // Black keys (sharps/flats)
  'C#3': 'Cs3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'G#3': 'Gs3.mp3', 'A#3': 'As3.mp3',
  'C#4': 'Cs4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'G#4': 'Gs4.mp3', 'A#4': 'As4.mp3',
  'C#5': 'Cs5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'G#5': 'Gs5.mp3', 'A#5': 'As5.mp3'
};

const reverb = new Tone.Reverb({
    decay: 8,
    wet: 0.2, // A little bit of reverb goes a long way
}).toDestination();

var noteGen = new Tone.Sampler({
  urls: noteFrequencies,
  release: 5,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: () => {}
}).connect(reverb);

// Play a piano note with velocity sensitivity
const playNote = (noteName) => {
  // Add the note to our state to mark it as active
  if (activeNotes[noteName] === true) return;
  activeNotes[noteName] = true;
  noteGen.triggerAttack(noteName);
};

// Stop playing a note with natural decay
const stopNote = (noteName) => {
  if (activeNotes[noteName]) {
    noteGen.triggerRelease(noteName);
    
    // Remove the note from our state
    delete activeNotes[noteName];
  }
};

// Defines the layout of a single octave on a piano
const pianoLayout = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black' },
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black' },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black' },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black' },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black' },
  { note: 'B', type: 'white' },
];

const createPianoKeys = (startOctave, numOctaves) => {
  const keys = [];
  for (let i = 0; i < numOctaves; i++) {
    const octave = startOctave + i;
    pianoLayout.forEach(key => {
      keys.push({
        ...key,
        name: `${key.note}${octave}`,
        octave: octave,
      });
    });
  }
  // Add the first key of the next octave for a more complete look
  const finalOctave = startOctave + numOctaves;
  keys.push({
    note: 'C',
    type: 'white',
    name: `C${finalOctave}`,
    octave: finalOctave
  });
  return keys;
};

const pianoKeys = createPianoKeys(3, 3); // Create 3 octaves starting from octave 3 (C3-C6)

const Piano = forwardRef(({ onKeyPlayed, lessonRef }, ref) => {
  const [pressedKeys, setPressedKeys] = useState({});
  const canvasRef = useRef(null);
  const keyRectsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const previousPressedKeysRef = useRef({});

  const drawPiano = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Draw liquid glass background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(231, 198, 255, 0.15)'); // Lavender
    bgGradient.addColorStop(0.5, 'rgba(184, 192, 255, 0.2)'); // Blue
    bgGradient.addColorStop(1, 'rgba(200, 182, 255, 0.25)'); // Purple tint
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Glossy border with liquid glass effect
    const borderGradient = ctx.createLinearGradient(0, 0, 0, height);
    borderGradient.addColorStop(0, 'rgba(231, 198, 255, 0.6)');
    borderGradient.addColorStop(0.5, 'rgba(184, 192, 255, 0.4)');
    borderGradient.addColorStop(1, 'rgba(200, 182, 255, 0.5)');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);
    
    // Add inner glow effect
    ctx.shadowColor = 'rgba(184, 192, 255, 0.3)';
    ctx.shadowBlur = 15;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    ctx.shadowBlur = 0;


    // Draw white keys first
    keyRectsRef.current.forEach(keyInfo => {
      const { key, rect } = keyInfo;
      const keyData = pianoKeys.find(pk => pk.name === key);
      if (!keyData || keyData.type !== 'white') return;

      const isPressed = pressedKeys[key];
      const intensity = isPressed ? pressedKeys[key] : 0;

      ctx.save();

      // Draw white key with liquid glass effect
      const whiteKeyGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
      if (isPressed) {
        // Pressed state - glowing liquid glass
        whiteKeyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        whiteKeyGradient.addColorStop(0.3, 'rgba(231, 198, 255, 0.7)');
        whiteKeyGradient.addColorStop(1, `rgba(184, 192, 255, ${0.5 + intensity * 0.5})`);
      } else {
        // Normal state - frosted glass
        whiteKeyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        whiteKeyGradient.addColorStop(0.5, 'rgba(245, 240, 255, 0.85)');
        whiteKeyGradient.addColorStop(1, 'rgba(231, 198, 255, 0.75)');
      }
      ctx.fillStyle = whiteKeyGradient;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      
      // Glossy border
      const borderGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
      borderGradient.addColorStop(0, 'rgba(184, 192, 255, 0.6)');
      borderGradient.addColorStop(0.5, 'rgba(200, 182, 255, 0.4)');
      borderGradient.addColorStop(1, 'rgba(184, 192, 255, 0.6)');
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      // Add shine effect on top
      const shineGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.top + rect.height * 0.3);
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGradient;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height * 0.3);

      // Pressed state effects
      if (isPressed) {
        // Glowing aura
        ctx.shadowColor = `rgba(123, 104, 238, ${intensity * 0.9})`;
        ctx.shadowBlur = 25 * intensity;
        
        const glowGradient = ctx.createRadialGradient(
          rect.left + rect.width / 2, rect.bottom, 0,
          rect.left + rect.width / 2, rect.bottom, rect.width * 0.8
        );
        glowGradient.addColorStop(0, `rgba(184, 192, 255, ${intensity * 0.6})`);
        glowGradient.addColorStop(0.5, `rgba(231, 198, 255, ${intensity * 0.4})`);
        glowGradient.addColorStop(1, 'rgba(184, 192, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      
      ctx.restore();

      // Draw label for white keys
      ctx.save();
      ctx.font = 'bold 13px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Gradient text effect
      const textGradient = ctx.createLinearGradient(
        rect.left + rect.width / 2, height - 25,
        rect.left + rect.width / 2, height - 10
      );
      textGradient.addColorStop(0, '#5B4B8A');
      textGradient.addColorStop(1, '#7B68EE');
      ctx.fillStyle = textGradient;
      
      // Text shadow for depth
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(keyData.note, rect.left + rect.width / 2, height - 18);
      ctx.restore();
    });

    // Draw black keys on top
    keyRectsRef.current.forEach(keyInfo => {
      const { key, rect } = keyInfo;
      const keyData = pianoKeys.find(pk => pk.name === key);
      if (!keyData || keyData.type !== 'black') return;

      const isPressed = pressedKeys[key];
      const intensity = isPressed ? pressedKeys[key] : 0;

      ctx.save();

      // Draw black key with dark liquid glass effect
      const blackKeyGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
      if (isPressed) {
        // Pressed state - glowing dark glass
        blackKeyGradient.addColorStop(0, 'rgba(91, 75, 138, 0.95)');
        blackKeyGradient.addColorStop(0.4, 'rgba(60, 50, 90, 0.9)');
        blackKeyGradient.addColorStop(1, `rgba(30, 25, 50, ${0.85 + intensity * 0.15})`);
      } else {
        // Normal state - dark frosted glass
        blackKeyGradient.addColorStop(0, 'rgba(91, 75, 138, 0.85)');
        blackKeyGradient.addColorStop(0.5, 'rgba(50, 40, 75, 0.9)');
        blackKeyGradient.addColorStop(1, 'rgba(26, 22, 37, 0.95)');
      }
      ctx.fillStyle = blackKeyGradient;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      
      // Glossy gradient border
      const blackBorderGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
      blackBorderGradient.addColorStop(0, 'rgba(123, 104, 238, 0.7)');
      blackBorderGradient.addColorStop(0.5, 'rgba(184, 192, 255, 0.5)');
      blackBorderGradient.addColorStop(1, 'rgba(123, 104, 238, 0.7)');
      ctx.strokeStyle = blackBorderGradient;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      // Top shine effect
      const blackShineGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.top + rect.height * 0.25);
      blackShineGradient.addColorStop(0, 'rgba(184, 192, 255, 0.4)');
      blackShineGradient.addColorStop(1, 'rgba(184, 192, 255, 0)');
      ctx.fillStyle = blackShineGradient;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height * 0.25);

      // Pressed state effects
      if (isPressed) {
        // Intense glowing aura
        ctx.shadowColor = `rgba(184, 192, 255, ${intensity})`;
        ctx.shadowBlur = 30 * intensity;
        
        const blackGlowGradient = ctx.createRadialGradient(
          rect.left + rect.width / 2, rect.bottom, 0,
          rect.left + rect.width / 2, rect.bottom, rect.width
        );
        blackGlowGradient.addColorStop(0, `rgba(200, 182, 255, ${intensity * 0.8})`);
        blackGlowGradient.addColorStop(0.5, `rgba(184, 192, 255, ${intensity * 0.6})`);
        blackGlowGradient.addColorStop(1, 'rgba(123, 104, 238, 0)');
        ctx.fillStyle = blackGlowGradient;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      
      ctx.restore();

      // Draw label for black keys
      ctx.save();
      ctx.font = 'bold 11px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Glowing text effect
      const blackTextGradient = ctx.createLinearGradient(
        rect.left + rect.width / 2, rect.bottom - 20,
        rect.left + rect.width / 2, rect.bottom - 8
      );
      blackTextGradient.addColorStop(0, '#E7C6FF');
      blackTextGradient.addColorStop(1, '#B8C0FF');
      ctx.fillStyle = blackTextGradient;
      
      // Glowing shadow
      ctx.shadowColor = 'rgba(184, 192, 255, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 0;
      
      ctx.fillText(keyData.note, rect.left + rect.width / 2, rect.bottom - 12);
      ctx.restore();
    });
  };

  // Calculate the positions of each key
  useEffect(() => {
    const calculateKeyRects = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas resolution
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      const { width, height } = canvas.getBoundingClientRect();

      const whiteKeys = pianoKeys.filter(k => k.type === 'white');
      const whiteKeyWidth = width / whiteKeys.length;
      const blackKeyWidth = whiteKeyWidth * 0.6;
      const blackKeyHeight = height * 0.6;

      const rects = [];
      let whiteKeyIndex = 0;

      pianoKeys.forEach(key => {
        if (key.type === 'white') {
          rects.push({
            key: key.name,
            rect: {
              left: whiteKeyIndex * whiteKeyWidth,
              top: 0,
              right: (whiteKeyIndex + 1) * whiteKeyWidth,
              bottom: height,
              width: whiteKeyWidth,
              height: height,
            }
          });
          whiteKeyIndex++;
        }
      });

      // Black keys are positioned between white keys
      const whiteKeyRects = rects.slice(); // Copy of white key rects
      pianoKeys.forEach((key, index) => {
        if (key.type === 'black') {
          // Find the white key to the left of this black key
          let leftWhiteKeyIndex = -1;
          for (let i = index - 1; i >= 0; i--) {
            if (pianoKeys[i].type === 'white' && pianoKeys[i].octave === key.octave) {
              leftWhiteKeyIndex = i;
              break;
            }
          }
          
          if (leftWhiteKeyIndex !== -1) {
            const leftWhiteKey = pianoKeys[leftWhiteKeyIndex];
            const leftWhiteKeyRect = whiteKeyRects.find(r => r.key === leftWhiteKey.name)?.rect;
            
            if (leftWhiteKeyRect) {
              // Position black key between the left white key and the next white key
              const left = leftWhiteKeyRect.right - (blackKeyWidth / 2);
              rects.push({
                key: key.name,
                rect: {
                  left: left,
                  top: 0,
                  right: left + blackKeyWidth,
                  bottom: blackKeyHeight,
                  width: blackKeyWidth,
                  height: blackKeyHeight,
                }
              });
            }
          }
        }
      });

      keyRectsRef.current = rects;
      drawPiano();
    };

    calculateKeyRects();
    window.addEventListener('resize', calculateKeyRects);

    const renderLoop = () => {
      drawPiano();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      window.removeEventListener('resize', calculateKeyRects);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  });

  // Initialize audio context on mount (requires user interaction)
  useEffect(() => {
    const initAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };

    // Try to initialize on first interaction
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Cleanup: stop all notes when component unmounts
  useEffect(() => {
    return () => {
      // Stop all active notes
      Object.keys(activeNotes).forEach(noteName => {
          stopNote(noteName);
      });
    };
  }, []);

  // Expose a function to the parent component to update pressed keys
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (landmarks, videoElement) => {
      if (Tone.context.state !== 'running') {
        Tone.start();
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const newPressedKeys = {};

      // If no landmarks or no video element, stop all notes
      if (!landmarks || landmarks.length === 0 || !videoElement) {
        // Stop all currently playing notes
        const previousKeys = previousPressedKeysRef.current;
        Object.keys(previousKeys).forEach(keyName => {
          stopNote(keyName);
        });
        
        previousPressedKeysRef.current = {};
        setPressedKeys({});
        
        if (onKeyPlayed) {
          onKeyPlayed({});
        }
        return;
      }
      
      // Get the bounding rectangles for coordinate mapping
      const pianoRect = canvas.getBoundingClientRect();
      const videoRect = videoElement.getBoundingClientRect();

      if (landmarks && landmarks.length > 0) {
        // Process each hand
        landmarks.forEach(hand => {
          // Validate hand has enough landmarks
          if (!hand || !Array.isArray(hand) || hand.length < 21) {
            return; // Skip invalid hand data
          }
          
          // Define fingers with tip as primary, DIP as fallback
          const fingers = [
            { tip: 4, dip: 3 },   // Thumb
            { tip: 8, dip: 7 },   // Index finger
            { tip: 12, dip: 11 }, // Middle finger
            { tip: 16, dip: 15 }, // Ring finger
            { tip: 20, dip: 19 }  // Pinky finger
          ];

          // Helper function to try detecting a key press with a joint
          const tryDetectKeyPress = (joint) => {
            // Validate joint exists and has required properties
            if (!joint || typeof joint.x !== 'number' || typeof joint.y !== 'number') {
              return null;
            }
            
            // Additional validation: check if coordinates are valid (0-1 range or reasonable values)
            if (isNaN(joint.x) || isNaN(joint.y)) {
              return null;
            }

            // Step 1: Convert normalized MediaPipe coordinates (0-1) to video element coordinates
            // MediaPipe coordinates are NOT mirrored in the data, so we mirror them
            const videoX = (1 - joint.x) * videoRect.width;
            const videoY = joint.y * videoRect.height;
            
            // Step 2: Convert video coordinates to absolute screen coordinates
            const screenX = videoRect.left + videoX;
            const screenY = videoRect.top + videoY;
            
            // Step 3: Convert screen coordinates to piano canvas coordinates
            const pianoX = screenX - pianoRect.left;
            const pianoY = screenY - pianoRect.top;
            
            // Step 4: Check if the finger is within the piano canvas bounds
            if (pianoX < 0 || pianoX > pianoRect.width || pianoY < 0 || pianoY > pianoRect.height) {
              return null; // Finger is outside the piano area
            }

            // Find which key is being touched, prioritizing black keys
            let touchedKey = null;
            
            // Check black keys first (they're on top)
            for (const keyInfo of keyRectsRef.current) {
              const keyData = pianoKeys.find(pk => pk.name === keyInfo.key);
              if (keyData && keyData.type === 'black') {
                const rect = keyInfo.rect;
                if (pianoX >= rect.left && pianoX <= rect.right &&
                    pianoY >= rect.top && pianoY <= rect.bottom) {
                  touchedKey = keyInfo;
                  break;
                }
              }
            }

            // If no black key was touched, check white keys
            if (!touchedKey) {
              for (const keyInfo of keyRectsRef.current) {
                const keyData = pianoKeys.find(pk => pk.name === keyInfo.key);
                if (keyData && keyData.type === 'white') {
                  const rect = keyInfo.rect;
                  if (pianoX >= rect.left && pianoX <= rect.right &&
                      pianoY >= rect.top && pianoY <= rect.bottom) {
                    touchedKey = keyInfo;
                    break;
                  }
                }
              }
            }

            if (touchedKey) {              
              return {
                key: touchedKey.key,
                intensity: 0.3
              };
            }

            return null;
          };

          // Check each finger
          for (const finger of fingers) {
            // Validate finger indices exist in hand array
            if (!hand[finger.tip] && !hand[finger.dip]) {
              continue; // Skip this finger if both landmarks are missing
            }
            
            // Try fingertip first (primary detection)
            let detection = null;
            if (hand[finger.tip]) {
              detection = tryDetectKeyPress(hand[finger.tip]);
            }

            // If we detected a key press from either joint
            if (detection && detection.key && typeof detection.intensity === 'number') {
              // Store or update the intensity for this key (keep the highest intensity)
              if (!newPressedKeys[detection.key] || newPressedKeys[detection.key] < detection.intensity) {
                newPressedKeys[detection.key] = detection.intensity;
              }
            }
          }
        });
      }

      // Handle audio playback based on key changes
      const previousKeys = previousPressedKeysRef.current;

      // Start playing new keys or update intensity for existing keys
      Object.keys(newPressedKeys).forEach(keyName => {
        const newIntensity = newPressedKeys[keyName];
        const oldIntensity = previousKeys[keyName];

        if (!oldIntensity) {
          // New key pressed - start playing
          playNote(keyName, newIntensity);
        }
      });

      // Stop keys that are no longer pressed
      Object.keys(previousKeys).forEach(keyName => {
        if (!newPressedKeys[keyName]) {
          stopNote(keyName);
        }
      });

      // Safety check: If no new keys are pressed but we still have activeNotes,
      // force stop them (handles edge cases where stopNote might have been missed)
      if (Object.keys(newPressedKeys).length === 0 && Object.keys(activeNotes).length > 0) {
        Object.keys(activeNotes).forEach(keyName => {
          stopNote(keyName);
        });
      }

      // Update refs
      previousPressedKeysRef.current = newPressedKeys;

      setPressedKeys(prev => {
        // Only update if there's a change to avoid re-renders
        if (JSON.stringify(prev) !== JSON.stringify(newPressedKeys)) {
          return newPressedKeys;
        }
        return prev;
      });

      if (onKeyPlayed) {
        onKeyPlayed(newPressedKeys);
      }

      // Update lesson state if lesson is active
      if (lessonRef && lessonRef.current) {
        lessonRef.current.updateLessonState(newPressedKeys, keyRectsRef);
      }
    },
    getCanvasRef: () => canvasRef,
    getKeyRectsRef: () => keyRectsRef
  }));

  return (
    <div className="piano-container">
      <canvas ref={canvasRef} className="piano-canvas" />
    </div>
  );
});

export default Piano;
