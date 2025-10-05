
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import './Guitar.css';

// Audio context for playing guitar sounds
let audioContext = null;
const activeOscillators = {};

// Initialize audio context
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Guitar chord frequencies - different chords based on finger patterns
const chordFrequencies = {
  'C': [261.63, 329.63, 392.00, 523.25, 659.25, 783.99], // C major
  'G': [196.00, 246.94, 293.66, 392.00, 493.88, 587.33], // G major
  'Am': [220.00, 261.63, 329.63, 440.00, 523.25, 659.25], // A minor
  'F': [174.61, 220.00, 261.63, 349.23, 440.00, 523.25], // F major
  'D': [146.83, 185.00, 220.00, 293.66, 369.99, 440.00], // D major
  'Em': [164.81, 196.00, 246.94, 329.63, 392.00, 493.88], // E minor
  'Dm': [146.83, 174.61, 220.00, 293.66, 349.23, 440.00]  // D minor
};

// Current chord being played
let currentChord = 'C';

// Play guitar string with strum effect
const playString = (stringIndex, chord = 'C', intensity = 1.0) => {
  const ctx = getAudioContext();
  const frequencies = chordFrequencies[chord] || chordFrequencies['C'];
  const frequency = frequencies[stringIndex];
  
  if (!frequency) return;

  const stringKey = `string-${stringIndex}-${chord}`;

  // If already playing, don't restart (let it ring out)
  if (activeOscillators[stringKey]) {
    return;
  }

  // Create oscillator
  const oscillator = ctx.createOscillator();
  oscillator.type = 'triangle'; // Triangle wave for guitar-like tone
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Create gain node with attack-decay envelope
  const gainNode = ctx.createGain();
  const volume = intensity * 0.4;
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Fast attack
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5); // Natural decay

  // Add harmonics for richer guitar tone
  const harmonic2 = ctx.createOscillator();
  harmonic2.type = 'sine';
  harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
  const harmonic2Gain = ctx.createGain();
  harmonic2Gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  harmonic2Gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

  // Filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000 + (intensity * 1000), ctx.currentTime);
  filter.Q.setValueAtTime(1, ctx.currentTime);

  // Connect audio graph
  oscillator.connect(gainNode);
  harmonic2.connect(harmonic2Gain);
  gainNode.connect(filter);
  harmonic2Gain.connect(filter);
  filter.connect(ctx.destination);

  // Start playing
  oscillator.start();
  harmonic2.start();

  // Store references
  activeOscillators[stringKey] = {
    oscillator,
    harmonic2,
    gainNode,
    harmonic2Gain
  };

  // Auto-cleanup after decay
  setTimeout(() => {
    try {
      if (activeOscillators[stringKey]) {
        oscillator.stop();
        harmonic2.stop();
        delete activeOscillators[stringKey];
      }
    } catch (e) {
      // Already stopped
    }
  }, 1500);
};

// Play chord (all strings together)
const playChord = (chord = 'C', intensity = 1.0) => {
  const frequencies = chordFrequencies[chord] || chordFrequencies['C'];
  // Play all strings with slight delay to simulate strumming
  for (let i = 0; i < frequencies.length; i++) {
    setTimeout(() => {
      playString(i, chord, intensity);
    }, i * 20); // 20ms delay between each string for natural strum effect
  }
};

// Helper function to determine if a finger is extended
const isFingerExtended = (landmarks, fingerTipIndex, fingerPipIndex) => {
  const tip = landmarks[fingerTipIndex];
  const pip = landmarks[fingerPipIndex];
  const wrist = landmarks[0];
  
  if (!tip || !pip || !wrist) return false;
  
  // Calculate distances from wrist
  const tipDistance = Math.sqrt(
    Math.pow(tip.x - wrist.x, 2) + 
    Math.pow(tip.y - wrist.y, 2)
  );
  const pipDistance = Math.sqrt(
    Math.pow(pip.x - wrist.x, 2) + 
    Math.pow(pip.y - wrist.y, 2)
  );
  
  // Finger is extended if tip is further from wrist than PIP joint
  return tipDistance > pipDistance + 0.02; // Small threshold for noise
};

// Detect finger pattern and return corresponding chord
const detectChordFromFingers = (landmarks) => {
  // Check which fingers are extended (considering camera mirroring)
  const thumb = isFingerExtended(landmarks, 4, 3);
  const index = isFingerExtended(landmarks, 8, 6);
  const middle = isFingerExtended(landmarks, 12, 10);
  const ring = isFingerExtended(landmarks, 16, 14);
  const pinky = isFingerExtended(landmarks, 20, 18);
  
  // Map finger patterns to chords (common guitar chord fingerings)
  if (!thumb && !index && !middle && !ring && !pinky) return 'C'; // Closed fist = C major
  if (index && !middle && !ring && !pinky) return 'G'; // Index finger = G major
  if (index && middle && !ring && !pinky) return 'Am'; // Peace sign = A minor
  if (index && middle && ring && !pinky) return 'F'; // Three fingers = F major
  if (index && middle && ring && pinky) return 'D'; // Four fingers = D major
  if (!index && middle && ring && pinky) return 'Em'; // Middle to pinky = E minor
  if (!index && !middle && ring && pinky) return 'Dm'; // Ring and pinky = D minor
  
  return 'C'; // Default to C major
};

// Determine which hand is chord hand and which is strum hand
const determineHandRoles = (handsData, visibleWidth, isLeftHanded = false) => {
  if (handsData.length !== 2) return null;
  
  const hand1 = handsData[0];
  const hand2 = handsData[1];
  
  // Get wrist positions (landmark 0)
  const hand1Wrist = hand1[0];
  const hand2Wrist = hand2[0];
  
  // Convert to screen coordinates (accounting for mirroring)
  const hand1X = (hand1Wrist.x - 0.5) * visibleWidth;
  const hand2X = (hand2Wrist.x - 0.5) * visibleWidth;
  
  // Default (right-handed): chord hand on left side, strum hand on right side
  // Left-handed: chord hand on right side, strum hand on left side
  if (!isLeftHanded) {
    // Right-handed mode
    if (hand1X < hand2X) {
      return {
        chordHand: hand1,
        strumHand: hand2,
        chordHandIndex: 0,
        strumHandIndex: 1
      };
    } else {
      return {
        chordHand: hand2,
        strumHand: hand1,
        chordHandIndex: 1,
        strumHandIndex: 0
      };
    }
  } else {
    // Left-handed mode (swapped)
    if (hand1X < hand2X) {
      return {
        chordHand: hand2,
        strumHand: hand1,
        chordHandIndex: 1,
        strumHandIndex: 0
      };
    } else {
      return {
        chordHand: hand1,
        strumHand: hand2,
        chordHandIndex: 0,
        strumHandIndex: 1
      };
    }
  }
};



const Guitar = forwardRef(({ onStringPlayed }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guitarModelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPlayedStringsRef = useRef({});
  const [isLeftHanded, setIsLeftHanded] = useState(false);

  // Setup Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup - match the FOV from guitar.html
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 1.5); // Match guitar.html camera position
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Lighting - match guitar.html
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 2, 3);
    scene.add(directionalLight);

    // Create hands group with mirroring (like in guitar.html)
    const handsGroup = new THREE.Group();
    handsGroup.scale.x = -1; // Mirror to match video
    scene.add(handsGroup);

    // Create guitar model
    const guitarGroup = new THREE.Group();
    guitarModelRef.current = guitarGroup;

    // Guitar body
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.6,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    guitarGroup.add(body);

    // Sound hole
    const soundholeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.12, 32);
    const soundholeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
    });
    const soundhole = new THREE.Mesh(soundholeGeometry, soundholeMaterial);
    soundhole.rotation.x = Math.PI / 2;
    soundhole.position.y = 0.1;
    guitarGroup.add(soundhole);

    // Guitar neck
    const neckGeometry = new THREE.BoxGeometry(0.12, 1.0, 0.08);
    const neckMaterial = new THREE.MeshStandardMaterial({
      color: 0xD2B48C,
      roughness: 0.8,
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 0.9;
    guitarGroup.add(neck);

    // Headstock
    const headGeometry = new THREE.BoxGeometry(0.14, 0.2, 0.08);
    const head = new THREE.Mesh(headGeometry, neckMaterial);
    head.position.y = 1.45;
    guitarGroup.add(head);

    // Guitar strings with colors
    const stringColors = [
      0xE7C6FF, // '#E7C6FF'
      0xC8B6FF, // '#C8B6FF'
      0xB8C0FF, // '#B8C0FF'
      0xBBD0FF, // '#BBD0FF'
      0xC8B6FF, // '#C8B6FF'
      0xFFD6FF  // '#FFD6FF'
    ];

    guitarGroup.strings = [];
    const stringSpacing = 0.05;
    const stringLength = 1.8;

    for (let i = 0; i < 6; i++) {
      const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, stringLength, 8);
      const strMaterial = new THREE.MeshStandardMaterial({
        color: stringColors[i],
        roughness: 0.2,
        metalness: 0.9,
      });
      const string = new THREE.Mesh(stringGeometry, strMaterial);
      
      const xPos = (i - 2.5) * stringSpacing;
      string.position.set(xPos, 0.5, 0.055);
      string.userData.originalColor = stringColors[i];
      string.userData.index = i;
      string.userData.hitStrength = 0;
      
      guitarGroup.add(string);
      guitarGroup.strings.push(string);
    }

    // Fret markers
    const fretMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
    });

    const fretPositions = [0.7, 0.85, 1.0, 1.15, 1.3];
    fretPositions.forEach(y => {
      const fretGeometry = new THREE.BoxGeometry(0.13, 0.015, 0.015);
      const fret = new THREE.Mesh(fretGeometry, fretMaterial);
      fret.position.set(0, y, 0.045);
      guitarGroup.add(fret);
    });

    // Store guitar dimensions for positioning
    guitarGroup.userData.neckLength = 1.8;
    guitarGroup.userData.bodyHeight = 0.8;
    guitarGroup.visible = true; // Always visible

    // Position guitar at fixed center position, angled based on handedness
    guitarGroup.position.set(0, -0.5, 0); // Move down to 25% from bottom
    // Right-handed: 45 degrees to the left, Left-handed: 45 degrees to the right  
    const rotation = isLeftHanded ? -Math.PI / 4 : Math.PI / 4;
    guitarGroup.rotation.set(0, 0, rotation);
    guitarGroup.scale.set(1, 1, 1);

    // Add guitar to hands group (so it gets mirrored)
    handsGroup.add(guitarGroup);

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(window.devicePixelRatio || 1);
    };

    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Animate string vibrations
        if (guitarModelRef.current && guitarModelRef.current.strings) {
          guitarModelRef.current.strings.forEach(string => {
            if (string.userData.hitStrength > 0) {
              // Vibrate the string
              const vibrationAmount = string.userData.hitStrength * 0.01;
              string.position.z = 0.055 + Math.sin(Date.now() * 0.05) * vibrationAmount;
              
              // Decay the hit strength
              string.userData.hitStrength *= 0.95;
              
              if (string.userData.hitStrength < 0.01) {
                string.userData.hitStrength = 0;
                string.position.z = 0.055;
              }
            }
          });
        }
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isLeftHanded]);

  // Update guitar orientation when handedness changes
  useEffect(() => {
    if (guitarModelRef.current) {
      guitarModelRef.current.position.set(0, -0.5, 0);
      // Right-handed: 45 degrees to the left, Left-handed: 45 degrees to the right
      const rotation = isLeftHanded ? -Math.PI / 4 : Math.PI / 4;
      guitarModelRef.current.rotation.set(0, 0, rotation);
      guitarModelRef.current.scale.set(1, 1, 1);
    }
  }, [isLeftHanded]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (handsData, videoElement) => {
      if (!guitarModelRef.current || !guitarModelRef.current.strings) return;
      if (!cameraRef.current) return;

      // Initialize hitStrength for all strings
      guitarModelRef.current.strings.forEach(string => {
        if (typeof string.userData.hitStrength === 'undefined') {
          string.userData.hitStrength = 0;
        }
      });

      // Guitar is always visible and positioned at center
      guitarModelRef.current.visible = true;

      // If no hands data, just return (guitar stays visible)
      if (!handsData || handsData.length === 0) {
        lastPlayedStringsRef.current = {};
        currentChord = 'C'; // Reset to default chord
        return;
      }

      // Calculate visible dimensions for finger position calculations
      const camera = cameraRef.current;
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      // Convert normalized landmark to 3D position
      const convert = (lm) => ({
        x: (lm.x - 0.5) * visibleWidth,
        y: -(lm.y - 0.5) * visibleHeight,
        z: -lm.z * visibleWidth * 1.5
      });

      let detectedChord = 'C';
      let strumDetected = false;

      if (handsData.length === 2) {
        // Two hands - use hand role detection
        const handRoles = determineHandRoles(handsData, visibleWidth, isLeftHanded);
        
        if (handRoles) {
          // Detect chord from the chord hand
          detectedChord = detectChordFromFingers(handRoles.chordHand);
          
          // Check for strumming from the strum hand
          const fingertipIndices = [8, 12, 16, 20]; // Index, middle, ring, pinky fingertips
          
          fingertipIndices.forEach(fingerIndex => {
            const fingerTip = handRoles.strumHand[fingerIndex];
            if (!fingerTip) return;
            
            // Convert finger tip to screen coordinates
            const fingerPos = convert(fingerTip);
            
            // Guitar center is at (0, -0.5, 0) in 3D space
            const guitarCenterScreen = {
              x: 0,
              y: -0.5 * visibleHeight
            };
            
            const fingerScreen = {
              x: fingerPos.x,
              y: fingerPos.y
            };
            
            // Calculate 2D distance from finger to guitar center
            const distance = Math.sqrt(
              Math.pow(fingerScreen.x - guitarCenterScreen.x, 2) + 
              Math.pow(fingerScreen.y - guitarCenterScreen.y, 2)
            );
            
            // Expanded strum detection area - much larger radius covering the base of the guitar
            // Previous radius was 0.1, now expanding to 0.4 for much larger trigger area
            const radiusIn3D = 0.4;
            
            // Additional check: allow strumming anywhere in the lower half of the guitar
            // (below the guitar center) with even more lenient bounds
            const isInLowerGuitarArea = fingerScreen.y <= guitarCenterScreen.y + 0.2; // Allow some area above center too
            const horizontalDistance = Math.abs(fingerScreen.x - guitarCenterScreen.x);
            const isWithinGuitarWidth = horizontalDistance <= 0.5; // Guitar body width area
            
            if ((distance < radiusIn3D) || (isInLowerGuitarArea && isWithinGuitarWidth)) {
              strumDetected = true;
            }
          });
        }
      } else if (handsData.length === 1) {
        // Single hand - determine role based on position and handedness
        const hand = handsData[0];
        const wrist = hand[0];
        const handX = (wrist.x - 0.5) * visibleWidth;
        
        // Determine if this hand is chord hand or strum hand based on position and handedness
        const isChordHand = isLeftHanded ? (handX > 0) : (handX < 0);
        
        if (isChordHand) {
          detectedChord = detectChordFromFingers(hand);
        } else {
          // This is the strum hand, check for strumming
          const fingertipIndices = [8, 12, 16, 20];
          
          fingertipIndices.forEach(fingerIndex => {
            const fingerTip = hand[fingerIndex];
            if (!fingerTip) return;
            
            const fingerPos = convert(fingerTip);
            const guitarCenterScreen = {
              x: 0,
              y: -0.5 * visibleHeight
            };
            
            const fingerScreen = {
              x: fingerPos.x,
              y: fingerPos.y
            };
            
            const distance = Math.sqrt(
              Math.pow(fingerScreen.x - guitarCenterScreen.x, 2) + 
              Math.pow(fingerScreen.y - guitarCenterScreen.y, 2)
            );
            
            // Expanded strum detection area - much larger radius covering the base of the guitar
            const radiusIn3D = 0.4;
            
            // Additional check: allow strumming anywhere in the lower half of the guitar
            const isInLowerGuitarArea = fingerScreen.y <= guitarCenterScreen.y + 0.2;
            const horizontalDistance = Math.abs(fingerScreen.x - guitarCenterScreen.x);
            const isWithinGuitarWidth = horizontalDistance <= 0.5;
            
            if ((distance < radiusIn3D) || (isInLowerGuitarArea && isWithinGuitarWidth)) {
              strumDetected = true;
            }
          });
        }
      }

      // Update current chord
      currentChord = detectedChord;

      // Play chord if strumming detected and not already playing this chord
      const chordKey = `${currentChord}-strum`;
      if (strumDetected && !lastPlayedStringsRef.current[chordKey]) {
        const intensity = 0.8;
        playChord(currentChord, intensity);
        
        // Visual feedback - make all strings vibrate
        if (guitarModelRef.current.strings) {
          guitarModelRef.current.strings.forEach(string => {
            string.userData.hitStrength = intensity * 2;
          });
        }
        
        lastPlayedStringsRef.current[chordKey] = true;
        
        if (onStringPlayed) {
          onStringPlayed({ chord: currentChord, intensity });
        }
      } else if (!strumDetected) {
        // No strumming detected, clear the chord state
        delete lastPlayedStringsRef.current[chordKey];
      }
    }
  }));

  return (
    <div className="guitar-container">
      <canvas ref={canvasRef} className="guitar-canvas" />
      <button 
        className="handedness-toggle"
        onClick={() => setIsLeftHanded(!isLeftHanded)}
        title={`Switch to ${isLeftHanded ? 'right' : 'left'} handed mode`}
      >
        {isLeftHanded ? '🤚🎸' : '🎸🤚'}
      </button>
    </div>
  );
});

export default Guitar;
