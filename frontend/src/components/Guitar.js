import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './Guitar.css';

const guitarStrings = [
  { name: 'E2', note: 'E', octave: 2, color: '#E7C6FF' }, // Low E
  { name: 'A2', note: 'A', octave: 2, color: '#C8B6FF' },
  { name: 'D3', note: 'D', octave: 3, color: '#B8C0FF' },
  { name: 'G3', note: 'G', octave: 3, color: '#BBD0FF' },
  { name: 'B3', note: 'B', octave: 3, color: '#C8B6FF' },
  { name: 'E4', note: 'E', octave: 4, color: '#FFD6FF' }, // High E
];

const Guitar = forwardRef(({ onStringPlayed }, ref) => {
  const [pressedStrings, setPressedStrings] = useState({});
  const guitarRef = useRef(null);
  const stringRectsRef = useRef([]);

  useEffect(() => {
    const calculateStringRects = () => {
      if (!guitarRef.current) return;
      const guitarRect = guitarRef.current.getBoundingClientRect();
      const stringHeight = guitarRect.height / guitarStrings.length;

      const rects = guitarStrings.map((string, index) => ({
        key: string.name,
        rect: {
          left: 0,
          top: index * stringHeight,
          right: guitarRect.width,
          bottom: (index + 1) * stringHeight,
          width: guitarRect.width,
          height: stringHeight,
        }
      }));

      stringRectsRef.current = rects;
    };

    calculateStringRects();
    window.addEventListener('resize', calculateStringRects);
    return () => window.removeEventListener('resize', calculateStringRects);
  }, []);

  useImperativeHandle(ref, () => ({
    updatePressedKeys: (fingertips) => {
      if (!guitarRef.current) return;
      const guitarRect = guitarRef.current.getBoundingClientRect();
      const newPressedStrings = {};
      
      if (fingertips) {
        fingertips.forEach(tip => {
          const relativeX = tip.x * guitarRect.width;
          const relativeY = tip.y * guitarRect.height;

          // Find which string is being touched
          const touchedString = stringRectsRef.current.find(
            s => relativeY >= s.rect.top && relativeY <= s.rect.bottom
          );

          if (touchedString) {
            // Calculate intensity based on horizontal position (how far along the string)
            const intensity = Math.max(0, Math.min(1, relativeX / guitarRect.width));
            newPressedStrings[touchedString.key] = intensity;
          }
        });
      }

      setPressedStrings(newPressedStrings);
      if (onStringPlayed) {
        onStringPlayed(newPressedStrings);
      }
    }
  }));

  const renderString = (string, index) => {
    const isPressed = pressedStrings[string.name];
    const intensity = isPressed ? pressedStrings[string.name] : 0;
    
    return (
      <div 
        key={string.name} 
        className="guitar-string"
        style={{
          top: `${(index / guitarStrings.length) * 100}%`,
          height: `${(1 / guitarStrings.length) * 100}%`,
        }}
      >
        <div className="string-line" style={{ backgroundColor: string.color }}>
          {isPressed && (
            <div 
              className="string-vibration"
              style={{
                left: `${intensity * 100}%`,
                backgroundColor: string.color,
              }}
            />
          )}
        </div>
        <div className="string-label">{string.note}{string.octave}</div>
      </div>
    );
  };

  return (
    <div className="guitar-container" ref={guitarRef}>
      <div className="strings-wrapper">
        {guitarStrings.map((string, index) => renderString(string, index))}
      </div>
      <div className="fret-markers">
        {[3, 5, 7, 9, 12].map(fret => (
          <div 
            key={fret} 
            className="fret-marker" 
            style={{ left: `${(fret / 15) * 100}%` }}
          >
            <div className="marker-dot" />
          </div>
        ))}
      </div>
    </div>
  );
});

export default Guitar;
