
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

// Guitar string frequencies (standard tuning: E-A-D-G-B-E)
const stringFrequencies = [
  82.41,  // E2 (low E)
  110.00, // A2
  146.83, // D3
  196.00, // G3
  246.94, // B3
  329.63  // E4 (high E)
];

// Play guitar string with strum effect
const playString = (stringIndex, intensity = 1.0) => {
  const ctx = getAudioContext();
  const frequency = stringFrequencies[stringIndex];
  
  if (!frequency) return;

  const stringKey = `string-${stringIndex}`;

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

// Map finger indices to string indices
// Index finger (8) -> String 0 (high E)
// Middle finger (12) -> String 1 (B)
// Ring finger (16) -> String 2 (G)
// Pinky finger (20) -> String 3 (D)
// We'll use thumb area for strings 4 and 5
const FINGER_TO_STRING = {
  8: 0,   // Index -> High E (thinnest)
  12: 1,  // Middle -> B
  16: 2,  // Ring -> G
  20: 3,  // Pinky -> D
  4: 4,   // Thumb tip -> A
  2: 5    // Thumb IP -> Low E (thickest)
};

// Helper to estimate body center from hand positions
// When hands are visible, we can estimate where the body center would be
const estimateBodyCenter = (leftHand, rightHand, visibleWidth, visibleHeight) => {
  // Use wrists (landmark 0) to estimate body position
  const leftWrist = leftHand[0];
  const rightWrist = rightHand[0];
  
  // Body center is between and slightly below the wrists
  const centerX = (leftWrist.x + rightWrist.x) / 2;
  const centerY = (leftWrist.y + rightWrist.y) / 2 + 0.15; // Below wrists
  const centerZ = (leftWrist.z + rightWrist.z) / 2;
  
  return {
    x: (centerX - 0.5) * visibleWidth,
    y: -(centerY - 0.5) * visibleHeight,
    z: -centerZ * visibleWidth * 1.5
  };
};

// Helper to calculate guitar rotation based on hand positions
const calculateGuitarRotation = (leftHand, rightHand, visibleWidth, visibleHeight) => {
  // Use middle finger base (landmark 9) for hand orientation
  const leftMid = leftHand[9];
  const rightMid = rightHand[9];
  
  const leftPos = new THREE.Vector3(
    (leftMid.x - 0.5) * visibleWidth,
    -(leftMid.y - 0.5) * visibleHeight,
    -leftMid.z * visibleWidth * 1.5
  );
  
  const rightPos = new THREE.Vector3(
    (rightMid.x - 0.5) * visibleWidth,
    -(rightMid.y - 0.5) * visibleHeight,
    -rightMid.z * visibleWidth * 1.5
  );
  
  // Guitar neck points from right hand to left hand
  const neckDirection = new THREE.Vector3().subVectors(leftPos, rightPos).normalize();
  
  // Camera-facing logic
  const viewDirection = new THREE.Vector3(0, 0, 1);
  const projection = viewDirection.clone().projectOnVector(neckDirection);
  let faceDirection = viewDirection.clone().sub(projection).normalize();
  
  // Fallback if aligned
  if (faceDirection.lengthSq() < 0.001) {
    const worldX = new THREE.Vector3(1, 0, 0);
    const projX = worldX.clone().projectOnVector(neckDirection);
    faceDirection = worldX.clone().sub(projX).normalize();
  }
  
  // Cross product for the third axis
  const sideDirection = new THREE.Vector3().crossVectors(neckDirection, faceDirection).normalize();
  
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeBasis(sideDirection, neckDirection, faceDirection);
  
  return { quaternion: new THREE.Quaternion().setFromRotationMatrix(rotationMatrix), distance: leftPos.distanceTo(rightPos) };
};

const Guitar = forwardRef(({ onStringPlayed }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guitarModelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPlayedStringsRef = useRef({});
  const guitarScaleRef = useRef(1.0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructionText, setInstructionText] = useState('Show your hands to display the guitar');

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
    guitarGroup.visible = false;

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
  }, []);

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

      // If no hands data, hide guitar and stop all playing strings
      if (!handsData || handsData.length === 0) {
        guitarModelRef.current.visible = false;
        setShowInstructions(true);
        setInstructionText('Show your hands to display the guitar');
        lastPlayedStringsRef.current = {};
        return;
      }

      // Calculate visible dimensions
      const camera = cameraRef.current;
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      // Convert normalized landmark to 3D position
      const convert = (lm) => ({
        x: (lm.x - 0.5) * visibleWidth,
        y: -(lm.y - 0.5) * visibleHeight,
        z: -lm.z * visibleWidth * 1.5
      });

      // Need two hands to show guitar
      if (handsData.length === 2) {
        guitarModelRef.current.visible = true;
        setShowInstructions(false);

        const leftHandLandmarks = handsData[0];
        const rightHandLandmarks = handsData[1];

        // === POSITIONING: Use estimated body center ===
        const bodyCenter = estimateBodyCenter(leftHandLandmarks, rightHandLandmarks, visibleWidth, visibleHeight);
        
        // === ROTATION: Use hand positions to calculate rotation ===
        const { quaternion, distance } = calculateGuitarRotation(leftHandLandmarks, rightHandLandmarks, visibleWidth, visibleHeight);
        
        // === SCALE: Based on hand distance ===
        const scale = Math.max(0.6, Math.min(1.4, distance * 0.8)); // Clamp between 0.6 and 1.4
        guitarScaleRef.current = scale;
        
        // Apply positioning, rotation, and scale
        guitarModelRef.current.position.set(bodyCenter.x, bodyCenter.y, bodyCenter.z);
        guitarModelRef.current.quaternion.copy(quaternion);
        guitarModelRef.current.scale.set(scale, scale, scale);

        // === PLAYING: Detect fingertips hovering over strings ===
        // We'll check the right hand (strumming hand) fingertips
        const currentlyPlayingStrings = {};
        
        // Check each finger mapped to a string
        Object.keys(FINGER_TO_STRING).forEach(fingerLandmarkIndex => {
          const stringIndex = FINGER_TO_STRING[fingerLandmarkIndex];
          const fingerTip = rightHandLandmarks[parseInt(fingerLandmarkIndex)];
          
          if (!fingerTip) return;
          
          // Convert finger tip to 3D position
          const fingerPos = convert(fingerTip);
          const fingerVec = new THREE.Vector3(fingerPos.x, fingerPos.y, fingerPos.z);
          
          // Transform to guitar's local space
          const guitarInverseMatrix = new THREE.Matrix4();
          guitarInverseMatrix.copy(guitarModelRef.current.matrixWorld).invert();
          const localFingerPos = fingerVec.clone().applyMatrix4(guitarInverseMatrix);
          
          // Get string position in guitar's local space
          const stringSpacing = 0.05;
          const stringX = (stringIndex - 2.5) * stringSpacing;
          const stringY = 0.5; // Mid-guitar body/neck area
          const stringZ = 0.055; // String depth
          
          // Check if finger is hovering over this string
          // Allow some tolerance in X, Y, and Z directions
          const xTolerance = 0.04; // Tolerance for X (string width)
          const yTolerance = 0.8;  // Tolerance for Y (along guitar length)
          const zTolerance = 0.15; // Tolerance for Z (depth - hovering distance)
          
          const isOverString = (
            Math.abs(localFingerPos.x - stringX) < xTolerance &&
            Math.abs(localFingerPos.y - stringY) < yTolerance &&
            localFingerPos.z > (stringZ - zTolerance) && // In front of strings
            localFingerPos.z < (stringZ + zTolerance * 0.5) // But not too far
          );
          
          if (isOverString) {
            // Finger is hovering over this string
            currentlyPlayingStrings[stringIndex] = true;
            
            // Calculate intensity based on how close the finger is to the string
            const distanceToString = Math.abs(localFingerPos.z - stringZ);
            const intensity = Math.max(0.3, Math.min(1.0, 1.0 - (distanceToString / zTolerance)));
            
            // Only play if not already playing
            if (!lastPlayedStringsRef.current[stringIndex]) {
              playString(stringIndex, intensity);
              guitarModelRef.current.strings[stringIndex].userData.hitStrength = intensity * 2;
              
              if (onStringPlayed) {
                onStringPlayed({ stringIndex, intensity });
              }
            }
          }
        });
        
        // Stop strings that are no longer being hovered
        Object.keys(lastPlayedStringsRef.current).forEach(stringIndex => {
          if (!currentlyPlayingStrings[stringIndex]) {
            // String is no longer being hovered - it will naturally decay
            delete lastPlayedStringsRef.current[stringIndex];
          }
        });
        
        // Update the currently playing strings reference
        lastPlayedStringsRef.current = currentlyPlayingStrings;
        
      } else {
        // Only one hand detected
        guitarModelRef.current.visible = false;
        setShowInstructions(true);
        setInstructionText('Show both hands to display the guitar');
        lastPlayedStringsRef.current = {};
      }
    }
  }));

  return (
    <div className="guitar-container">
      <canvas ref={canvasRef} className="guitar-canvas" />
      {showInstructions && (
        <div className="guitar-instruction">{instructionText}</div>
      )}
    </div>
  );
});

export default Guitar;
