import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import './Drums.css';

const Drums = forwardRef((props, ref) => {
  const audioContextRef = useRef(null);
  const drumSoundsRef = useRef({});
  const lastHitTimeRef = useRef({}); // Prevent rapid re-triggering
  const previousSticksRef = useRef([null, null]); // Track previous positions for velocity
  const [drumsticks, setDrumsticks] = useState([
    { visible: false, x: 0, y: 0, angle: 0 },
    { visible: false, x: 0, y: 0, angle: 0 }
  ]);

  // Drum pad configuration - arc pattern at top of screen
  const DRUM_PADS = [
    { name: 'Hi-Hat', x: -0.6, y: 0.6, radius: 0.35, color: '#FFD700', sound: 'hihat' },
    { name: 'Tom 1', x: -0.3, y: 0.7, radius: 0.35, color: '#FF6B6B', sound: 'tom1' },
    { name: 'Snare', x: 0, y: 0.75, radius: 0.38, color: '#4ECDC4', sound: 'snare' },
    { name: 'Tom 2', x: 0.3, y: 0.7, radius: 0.35, color: '#FF6B6B', sound: 'tom2' },
    { name: 'Cymbal', x: 0.6, y: 0.6, radius: 0.35, color: '#FFD700', sound: 'cymbal' },
    { name: 'Bass', x: 0, y: 0.45, radius: 0.4, color: '#95E1D3', sound: 'bass' }
  ];

  // Initialize Web Audio Context and load drum samples
  useEffect(() => {
    const initAudio = async () => {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Synthesized drum samples using Web Audio API
      // In production, you'd load actual audio files here
      drumSoundsRef.current = {
        hihat: createHiHatSound,
        snare: createSnareSound,
        bass: createBassDrumSound,
        tom1: createTomSound(220),
        tom2: createTomSound(165),
        cymbal: createCymbalSound
      };
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Realistic drum sound synthesis functions
  const createBassDrumSound = () => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const createSnareSound = () => {
    const ctx = audioContextRef.current;
    
    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    oscGain.gain.setValueAtTime(0.7, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    // Noise component
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noise.buffer = buffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    noiseGain.gain.setValueAtTime(1, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.2);
  };

  const createHiHatSound = () => {
    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    const bandpass = ctx.createBiquadFilter();
    const highpass = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    noise.buffer = buffer;
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(10000, ctx.currentTime);
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(7000, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.1);
  };

  const createTomSound = (frequency) => () => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const createCymbalSound = () => {
    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    const bandpass = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    noise.buffer = buffer;
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(8000, ctx.currentTime);
    bandpass.Q.setValueAtTime(1, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.5);
  };

  // Play drum sound
  const playDrum = (drumType) => {
    const now = Date.now();
    const lastHit = lastHitTimeRef.current[drumType] || 0;
    
    // Prevent rapid re-triggering (150ms debounce)
    if (now - lastHit < 150) return;
    
    lastHitTimeRef.current[drumType] = now;
    
    if (drumSoundsRef.current[drumType]) {
      drumSoundsRef.current[drumType]();
      
      // Trigger ripple effect
      triggerRipple(drumType);
    }
  };

  // Trigger visual ripple effect
  const triggerRipple = (drumType) => {
    const drumPad = document.querySelector(`[data-drum="${drumType}"]`);
    if (drumPad) {
      drumPad.classList.add('drum-hit');
      setTimeout(() => {
        drumPad.classList.remove('drum-hit');
      }, 300);
    }
  };

  // Update drumsticks position and rotation based on hand tracking
  useImperativeHandle(ref, () => ({
    updateDrumsticks: (handsData) => {
      if (!handsData || handsData.length === 0) {
        // Hide drumsticks if no hands detected
        setDrumsticks([
          { visible: false, x: 0, y: 0, angle: 0 },
          { visible: false, x: 0, y: 0, angle: 0 }
        ]);
        return;
      }

      const newDrumsticks = [
        { visible: false, x: 0, y: 0, angle: 0 },
        { visible: false, x: 0, y: 0, angle: 0 }
      ];

      // Process each hand (up to 2)
      handsData.forEach((handLandmarks, handIndex) => {
        if (handIndex >= 2) return;

        // Key landmarks:
        // 0: Wrist
        // 5: Index finger base  
        // 8: Index finger tip
        // 9: Middle finger base (palm center)
        
        const wrist = handLandmarks[0];
        const indexTip = handLandmarks[8];
        const palmCenter = handLandmarks[9];

        // Position drumstick at the palm center
        // MediaPipe gives normalized coordinates (0-1)
        // The video feed is MIRRORED, so we need to flip X coordinates
        const stickX = (1 - palmCenter.x) * 100; // FLIP X for mirrored camera
        const stickY = palmCenter.y * 100; // Y stays the same

        // Calculate angle: direction from wrist to index tip
        // For mirrored view, we need to mirror the X coordinates before calculating angle
        const mirroredWristX = 1 - wrist.x;
        const mirroredIndexTipX = 1 - indexTip.x;
        
        const deltaX = mirroredIndexTipX - mirroredWristX;
        const deltaY = indexTip.y - wrist.y;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        // Calculate stick tip position for collision detection
        const stickLength = 75; // pixels
        const angleRad = angle * (Math.PI / 180);
        const tipX = stickX + Math.cos(angleRad) * stickLength;
        const tipY = stickY + Math.sin(angleRad) * stickLength;

        newDrumsticks[handIndex] = {
          visible: true,
          x: stickX + 5,
          y: stickY,
          angle: angle,
          tipX: tipX,
          tipY: tipY
        };

        // Check drum collisions with this stick's tip
        checkDrumCollisions(tipX, tipY, handIndex);
      });

      setDrumsticks(newDrumsticks);
    }
  }));

  // Check if drumstick tip collides with any drum pad
  const checkDrumCollisions = (tipX, tipY, handIndex) => {
    const currentStick = { tipX, tipY };
    const previousStick = previousSticksRef.current[handIndex];
    
    // Calculate velocity (movement since last frame)
    let velocityY = 0;
    if (previousStick) {
      velocityY = tipY - previousStick.tipY;
    }
    
    // Only trigger on downward motion (hitting motion)
    const isHittingMotion = velocityY > 0.5; // Threshold for downward velocity
    
    // Convert drum pad positions from normalized (-1 to 1) to percentage (0 to 100)
    DRUM_PADS.forEach(pad => {
      const padX = (pad.x + 1) * 50; // Convert -1,1 to 0,100
      const padY = (-pad.y + 1) * 50; // Convert and invert Y
      
      // Calculate distance in percentage units
      const distance = Math.sqrt(
        Math.pow(tipX - padX, 2) + 
        Math.pow(tipY - padY, 2)
      );

      // Convert radius from normalized to percentage with better scaling
      const radiusPercent = pad.radius * 100; // Better conversion for hit detection

      // Trigger drum if within radius AND moving downward
      if (distance < radiusPercent && isHittingMotion) {
        playDrum(pad.sound);
      }
    });
    
    // Update previous position
    previousSticksRef.current[handIndex] = currentStick;
  };

  return (
    <>
      {/* 2D Drumsticks - positioned using MediaPipe hand tracking */}
      {drumsticks.map((stick, index) => (
        stick.visible && (
          <div
            key={index}
            className="drumstick"
            style={{
              left: `${stick.x}%`,
              top: `${stick.y}%`,
              transform: `translate(-50%, -50%) rotate(${stick.angle}deg)`
            }}
          />
        )
      ))}
      
      {/* Drum Pads */}
      <div className="drums-overlay">
        {DRUM_PADS.map((pad, index) => (
          <div
            key={index}
            className="drum-pad"
            data-drum={pad.sound}
            style={{
              left: `${(pad.x + 1) * 50}%`,
              top: `${(-pad.y + 1) * 50}%`,
              width: `${pad.radius * 200}px`,
              height: `${pad.radius * 200}px`,
              borderColor: pad.color,
              boxShadow: `0 0 20px ${pad.color}40, inset 0 0 20px ${pad.color}20`
            }}
          >
            <span className="drum-label" style={{ color: pad.color }}>
              {pad.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
});

export default Drums;
