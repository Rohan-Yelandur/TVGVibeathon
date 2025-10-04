import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './Piano.css';

const pianoKeys = [
  // Octave 4
  { name: 'C4', type: 'white' },
  { name: 'C#4', type: 'black' },
  { name: 'D4', type: 'white' },
  { name: 'D#4', type: 'black' },
  { name: 'E4', type: 'white' },
  { name: 'F4', type: 'white' },
  { name: 'F#4', type: 'black' },
  { name: 'G4', type: 'white' },
  { name: 'G#4', type: 'black' },
  { name: 'A4', type: 'white' },
  { name: 'A#4', type: 'black' },
  { name: 'B4', type: 'white' },
  // Octave 5
  { name: 'C5', type: 'white' },
  { name: 'C#5', type: 'black' },
  { name: 'D5', type: 'white' },
  { name: 'D#5', type: 'black' },
  { name: 'E5', type: 'white' },
  { name: 'F5', type: 'white' },
  { name: 'F#5', type: 'black' },
  { name: 'G5', type: 'white' },
  { name: 'G#5', type: 'black' },
  { name: 'A5', type: 'white' },
  { name: 'A#5', type: 'black' },
  { name: 'B5', type: 'white' },
];

const whiteKeys = pianoKeys.filter(k => k.type === 'white');
const blackKeys = pianoKeys.filter(k => k.type === 'black');

const Piano = forwardRef(({ onKeyPlayed }, ref) => {
  const [pressedKeys, setPressedKeys] = useState({});
  const pianoRef = useRef(null);
  const keyRectsRef = useRef([]);

  useEffect(() => {
    const calculateKeyRects = () => {
      if (!pianoRef.current) return;
      const pianoRect = pianoRef.current.getBoundingClientRect();
      const whiteKeyWidth = pianoRect.width / whiteKeys.length;
      const blackKeyWidth = whiteKeyWidth * 0.6;
      const blackKeyHeight = pianoRect.height * 0.6;

      const rects = [];
      let whiteKeyIndex = 0;

      pianoKeys.forEach(key => {
        if (key.type === 'white') {
          rects.push({
            key: key.name,
            type: 'white',
            rect: {
              left: whiteKeyIndex * whiteKeyWidth,
              top: 0,
              right: (whiteKeyIndex + 1) * whiteKeyWidth,
              bottom: pianoRect.height,
              width: whiteKeyWidth,
              height: pianoRect.height,
            }
          });
          whiteKeyIndex++;
        }
      });

      let blackKeyIndex = 0;
      pianoKeys.forEach(key => {
        if (key.type === 'black') {
          const precedingWhiteKeyIndex = whiteKeys.findIndex(wk => wk.name.charAt(0) === key.name.charAt(0));
          
          // Don't draw black keys for E and B
          if (key.name.includes('E#') || key.name.includes('B#')) {
            return;
          }

          const left = (precedingWhiteKeyIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2);
          
          rects.push({
            key: key.name,
            type: 'black',
            rect: {
              left: left,
              top: 0,
              right: left + blackKeyWidth,
              bottom: blackKeyHeight,
              width: blackKeyWidth,
              height: blackKeyHeight,
            }
          });
          blackKeyIndex++;
        }
      });
      keyRectsRef.current = rects;
    };

    calculateKeyRects();
    window.addEventListener('resize', calculateKeyRects);
    return () => window.removeEventListener('resize', calculateKeyRects);
  }, []);

  useImperativeHandle(ref, () => ({
    getKeyFromCoords: (x, y) => {
      if (!pianoRef.current) return null;
      const pianoRect = pianoRef.current.getBoundingClientRect();
      
      const relativeX = x * pianoRect.width;
      const relativeY = y * pianoRect.height;

      const pressed = [];

      // Check black keys first since they are on top
      const blackKey = keyRectsRef.current.find(
        k => k.type === 'black' &&
        relativeX >= k.rect.left &&
        relativeX <= k.rect.right &&
        relativeY >= k.rect.top &&
        relativeY <= k.rect.bottom
      );

      if (blackKey) {
        const intensity = (relativeY - blackKey.rect.top) / blackKey.rect.height;
        pressed.push({ key: blackKey.key, intensity: Math.max(0, Math.min(1, intensity)) });
      } else {
        // Check white keys
        const whiteKey = keyRectsRef.current.find(
          k => k.type === 'white' &&
          relativeX >= k.rect.left &&
          relativeX <= k.rect.right &&
          relativeY >= k.rect.top &&
          relativeY <= k.rect.bottom
        );
        if (whiteKey) {
          const intensity = (relativeY - whiteKey.rect.top) / whiteKey.rect.height;
          pressed.push({ key: whiteKey.key, intensity: Math.max(0, Math.min(1, intensity)) });
        }
      }
      
      return pressed.length > 0 ? pressed : null;
    },
    updatePressedKeys: (fingertips) => {
      if (!pianoRef.current) return;
      const pianoRect = pianoRef.current.getBoundingClientRect();
      const newPressedKeys = {};
      
      if (fingertips) {
        fingertips.forEach(tip => {
          const relativeX = tip.x * pianoRect.width;
          const relativeY = tip.y * pianoRect.height;

          // Check black keys first
          const blackKey = keyRectsRef.current.find(k => k.type === 'black' && relativeX >= k.rect.left && relativeX <= k.rect.right && relativeY >= k.rect.top && relativeY <= k.rect.bottom);

          if (blackKey) {
            const intensity = Math.max(0, Math.min(1, (relativeY - blackKey.rect.top) / blackKey.rect.height));
            newPressedKeys[blackKey.key] = intensity;
          } else {
            // Check white keys
            const whiteKey = keyRectsRef.current.find(k => k.type === 'white' && relativeX >= k.rect.left && relativeX <= k.rect.right && relativeY >= k.rect.top && relativeY <= k.rect.bottom);
            if (whiteKey) {
              const intensity = Math.max(0, Math.min(1, (relativeY - whiteKey.rect.top) / whiteKey.rect.height));
              newPressedKeys[whiteKey.key] = intensity;
            }
          }
        });
      }

      setPressedKeys(newPressedKeys);
      if (onKeyPlayed) {
        onKeyPlayed(newPressedKeys);
      }
    }
  }));

  const renderKey = (key) => {
    const isPressed = pressedKeys[key.name];
    const intensity = isPressed ? pressedKeys[key.name] : 0;
    const style = {
      '--highlight-opacity': intensity,
    };

    return (
      <div key={key.name} className={`key ${key.type}-key`} style={style}>
        <div className="key-name">{key.name}</div>
      </div>
    );
  };

  return (
    <div className="piano-container" ref={pianoRef}>
      <div className="keys-wrapper">
        {whiteKeys.map(renderKey)}
        {blackKeys.map(key => {
          const precedingWhiteKeyIndex = whiteKeys.findIndex(wk => wk.name.charAt(0) === key.name.charAt(0));
          if (key.name.includes('E#') || key.name.includes('B#')) return null;
          
          const isPressed = pressedKeys[key.name];
          const intensity = isPressed ? pressedKeys[key.name] : 0;
          
          const style = {
            left: `calc(${(precedingWhiteKeyIndex + 1) * (100 / whiteKeys.length)}% - 1.25%)`,
            '--highlight-opacity': intensity,
          };
          return (
            <div key={key.name} className="key black-key" style={style}>
               <div className="key-name">{key.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Piano;
