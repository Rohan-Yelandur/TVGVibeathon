import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './Piano.css';

// Audio context for playing piano sounds
let audioContext = null;
const activeOscillators = {};

// Initialize audio context (lazy initialization to avoid autoplay issues)
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Map note names to frequencies (A4 = 440Hz standard)
const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

// Play a piano note with velocity sensitivity
const playNote = (noteName, intensity = 1.0) => {
  const ctx = getAudioContext();
  const frequency = noteFrequencies[noteName];
  
  if (!frequency) return;

  // If this note is already playing, don't restart it
  if (activeOscillators[noteName]) {
    // Update volume if intensity changed significantly
    const existingGain = activeOscillators[noteName].gainNode;
    const currentVolume = existingGain.gain.value;
    const targetVolume = intensity * 0.3; // Scale to reasonable volume
    
    if (Math.abs(currentVolume - targetVolume) > 0.05) {
      existingGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.015);
    }
    return;
  }

  // Create oscillator for the fundamental frequency
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine'; // Sine wave for clean piano-like tone
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Create gain node for volume control (velocity sensitive)
  const gainNode = ctx.createGain();
  const volume = intensity * 0.3; // Scale intensity to reasonable volume (0-0.3)
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.015); // Quick attack

  // Add subtle harmonics for richer piano sound
  const harmonic2 = ctx.createOscillator();
  harmonic2.type = 'sine';
  harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
  const harmonic2Gain = ctx.createGain();
  harmonic2Gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);

  const harmonic3 = ctx.createOscillator();
  harmonic3.type = 'sine';
  harmonic3.frequency.setValueAtTime(frequency * 3, ctx.currentTime);
  const harmonic3Gain = ctx.createGain();
  harmonic3Gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);

  // Add a subtle low-pass filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000 + (intensity * 2000), ctx.currentTime); // Brighter when pressed harder
  filter.Q.setValueAtTime(1, ctx.currentTime);

  // Connect the audio graph
  oscillator.connect(gainNode);
  harmonic2.connect(harmonic2Gain);
  harmonic3.connect(harmonic3Gain);
  
  gainNode.connect(filter);
  harmonic2Gain.connect(filter);
  harmonic3Gain.connect(filter);
  
  filter.connect(ctx.destination);

  // Start playing
  oscillator.start();
  harmonic2.start();
  harmonic3.start();

  // Store references for later manipulation
  activeOscillators[noteName] = {
    oscillator,
    harmonic2,
    harmonic3,
    gainNode,
    harmonic2Gain,
    harmonic3Gain,
    filter
  };
};

// Stop playing a note with natural decay
const stopNote = (noteName) => {
  if (!activeOscillators[noteName]) return;

  const ctx = getAudioContext();
  const { oscillator, harmonic2, harmonic3, gainNode, harmonic2Gain, harmonic3Gain } = activeOscillators[noteName];

  // IMMEDIATELY remove from activeOscillators to prevent duplicate calls
  delete activeOscillators[noteName];

  // Smooth release/decay
  const releaseTime = 0.2; // 200ms release (faster for better responsiveness)
  const currentTime = ctx.currentTime;
  
  // Cancel any scheduled changes and set immediate fade out
  try {
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + releaseTime);
    
    harmonic2Gain.gain.cancelScheduledValues(currentTime);
    harmonic2Gain.gain.setValueAtTime(harmonic2Gain.gain.value, currentTime);
    harmonic2Gain.gain.linearRampToValueAtTime(0, currentTime + releaseTime);
    
    harmonic3Gain.gain.cancelScheduledValues(currentTime);
    harmonic3Gain.gain.setValueAtTime(harmonic3Gain.gain.value, currentTime);
    harmonic3Gain.gain.linearRampToValueAtTime(0, currentTime + releaseTime);
  } catch (e) {
    // Ignore timing errors
  }

  // Stop oscillators after release
  setTimeout(() => {
    try {
      oscillator.stop();
      harmonic2.stop();
      harmonic3.stop();
    } catch (e) {
      // Ignore if already stopped
    }
  }, releaseTime * 1000);
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

const pianoKeys = createPianoKeys(4, 2); // Create 2 octaves starting from octave 4

const Piano = forwardRef(({ onKeyPlayed }, ref) => {
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
  }, [pressedKeys]);

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
      Object.keys(activeOscillators).forEach(noteName => {
        stopNote(noteName);
      });
    };
  }, []);

  // Expose a function to the parent component to update pressed keys
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (landmarks, videoElement) => {
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
          // Excluding thumbs (indices 4, 3)
          const fingers = [
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
              const keyRect = touchedKey.rect;
              // Calculate press depth based on vertical position within the key
              const distanceFromTop = pianoY - keyRect.top;
              const pressDepth = Math.max(0, Math.min(1, distanceFromTop / keyRect.height));
              
              // Apply exponential curve for more realistic volume
              const clampedDepth = Math.max(0, Math.min(1, pressDepth * 1.5));
              const intensity = Math.pow(clampedDepth, 2);
              
              return {
                key: touchedKey.key,
                intensity: intensity
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
            
            // If fingertip didn't detect anything or doesn't exist, try DIP joint (fallback)
            if (!detection && hand[finger.dip]) {
              detection = tryDetectKeyPress(hand[finger.dip]);
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
        } else if (Math.abs(newIntensity - oldIntensity) > 0.1) {
          // Intensity changed significantly - update volume
          playNote(keyName, newIntensity);
        }
      });

      // Stop keys that are no longer pressed
      Object.keys(previousKeys).forEach(keyName => {
        if (!newPressedKeys[keyName]) {
          stopNote(keyName);
        }
      });

      // Safety check: If no new keys are pressed but we still have activeOscillators,
      // force stop them (handles edge cases where stopNote might have been missed)
      if (Object.keys(newPressedKeys).length === 0 && Object.keys(activeOscillators).length > 0) {
        Object.keys(activeOscillators).forEach(keyName => {
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
    }
  }));

  return (
    <div className="piano-container">
      <canvas ref={canvasRef} className="piano-canvas" />
    </div>
  );
});

export default Piano;
