import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './Piano.css';

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

  const drawPiano = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(184, 192, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);


    // Draw white keys first
    keyRectsRef.current.forEach(keyInfo => {
      const { key, rect } = keyInfo;
      const keyData = pianoKeys.find(pk => pk.name === key);
      if (!keyData || keyData.type !== 'white') return;

      const isPressed = pressedKeys[key];
      const intensity = isPressed ? pressedKeys[key] : 0;

      ctx.save();

      // Draw white key
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      // Draw highlight for white keys
      if (isPressed) {
        const highlightGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
        highlightGradient.addColorStop(0, 'rgba(123, 104, 238, 0)');
        highlightGradient.addColorStop(1, `rgba(123, 104, 238, ${intensity * 0.7})`);
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

        // Add a glow effect
        ctx.shadowColor = 'rgba(123, 104, 238, 0.8)';
        ctx.shadowBlur = 15 * intensity;
        ctx.fillStyle = `rgba(220, 220, 255, ${intensity * 0.4})`;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      
      ctx.restore();

      // Draw label for white keys
      ctx.save();
      ctx.font = 'bold 12px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333';
      ctx.shadowColor = 'rgba(255,255,255,0.7)';
      ctx.shadowBlur = 2;
      ctx.fillText(keyData.note, rect.left + rect.width / 2, height - 15);
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

      // Draw black key with gradient
      const gradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      
      // Black key border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      // Draw highlight for black keys
      if (isPressed) {
        const highlightGradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
        highlightGradient.addColorStop(0, 'rgba(123, 104, 238, 0)');
        highlightGradient.addColorStop(1, `rgba(123, 104, 238, ${intensity * 0.9})`);
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

        // Add a glow effect for black keys
        ctx.shadowColor = 'rgba(123, 104, 238, 1)';
        ctx.shadowBlur = 20 * intensity;
        ctx.fillStyle = `rgba(200, 180, 255, ${intensity * 0.6})`;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      
      ctx.restore();

      // Draw label for black keys
      ctx.save();
      ctx.font = 'bold 10px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 2;
      ctx.fillText(keyData.note, rect.left + rect.width / 2, rect.bottom - 10);
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

  // Expose a function to the parent component to update pressed keys
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (landmarks, videoElement) => {
      const canvas = canvasRef.current;
      if (!canvas || !videoElement) return;
      
      // Get the bounding rectangles for coordinate mapping
      const pianoRect = canvas.getBoundingClientRect();
      const videoRect = videoElement.getBoundingClientRect();
      const newPressedKeys = {};

      if (landmarks && landmarks.length > 0) {
        // Process each hand
        landmarks.forEach(hand => {
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
            if (!joint) return null;

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
            // Try fingertip first (primary detection)
            let detection = tryDetectKeyPress(hand[finger.tip]);
            
            // If fingertip didn't detect anything, try DIP joint (fallback)
            if (!detection) {
              detection = tryDetectKeyPress(hand[finger.dip]);
            }

            // If we detected a key press from either joint
            if (detection) {
              // Store or update the intensity for this key (keep the highest intensity)
              if (!newPressedKeys[detection.key] || newPressedKeys[detection.key] < detection.intensity) {
                newPressedKeys[detection.key] = detection.intensity;
              }
            }
          }
        });
      }

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
