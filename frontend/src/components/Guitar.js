import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import './Guitar.css';

const Guitar = forwardRef(({ onStringPlayed }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guitarModelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastGuitarScaleRef = useRef(1.2);
  const isRepositioningRef = useRef(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructionText, setInstructionText] = useState('Show two hands to position the guitar');

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    // Start with a small size; we'll resize to the camera-window container
    renderer.setSize(300, 150);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

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

    // Guitar strings
    const stringColors = [
      '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF', '#C8B6FF', '#FFD6FF'
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

    // Store body base offset for positioning
    guitarGroup.userData.bodyBaseOffset = -0.4;

    scene.add(guitarGroup);

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Update per-string visual feedback (decay hitStrength)
        if (guitarModelRef.current && guitarModelRef.current.strings) {
          guitarModelRef.current.strings.forEach(string => {
            // decay hit strength
            string.userData.hitStrength = Math.max(0, (string.userData.hitStrength || 0) * 0.88);

            const h = string.userData.hitStrength || 0;

            // scale effect
            const scaleAmount = 1 + h * 0.6; // 1.0 - 1.6
            string.scale.set(scaleAmount, 1, scaleAmount);

            // color blend between original and highlight
            try {
              const orig = new THREE.Color(string.userData.originalColor);
              const highlight = new THREE.Color(0x00ff88);
              const current = orig.clone().lerp(highlight, h);
              string.material.color.copy(current);
            } catch (err) {
              // ignore color errors
            }
          });
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && rendererRef.current) {
        // The guitar container is intended to overlay the camera-window
        const container = canvasRef.current.parentElement; // .guitar-container
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          rendererRef.current.setPixelRatio(window.devicePixelRatio || 1);
          rendererRef.current.setSize(width, height, false);
          if (cameraRef.current) {
            cameraRef.current.aspect = width / height || 1;
            cameraRef.current.updateProjectionMatrix();
          }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

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

  // Helper function to recognize fist gesture for repositioning
  const recognizeFist = (landmarks) => {
    if (!landmarks || landmarks.length < 21) return false;
    
    // Check if all fingertips are below their pip joints (fingers closed)
    const fingersUp = [];
    const tipIds = [8, 12, 16, 20]; // Index, middle, ring, pinky
    
    for (let i = 0; i < tipIds.length; i++) {
      const tipId = tipIds[i];
      const pipId = tipId - 2;
      if (landmarks[tipId].y < landmarks[pipId].y) {
        fingersUp.push(i);
      }
    }
    
    // Fist if no fingers are up
    return fingersUp.length === 0;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (handsData) => {
      if (!guitarModelRef.current || !guitarModelRef.current.strings) return;
      if (!cameraRef.current) return;

      // Initialize hitStrength for all strings
      guitarModelRef.current.strings.forEach(string => {
        if (typeof string.userData.hitStrength === 'undefined') {
          string.userData.hitStrength = 0;
        }
      });

      // If no hands data, hide guitar
      if (!handsData || handsData.length === 0) {
        guitarModelRef.current.visible = false;
        setShowInstructions(true);
        setInstructionText('Show two hands to position the guitar');
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

        const leftHandLandmarks = handsData[0];
        const rightHandLandmarks = handsData[1];

        // Check for fist gestures (repositioning mode)
        const leftFist = recognizeFist(leftHandLandmarks);
        const rightFist = recognizeFist(rightHandLandmarks);
        isRepositioningRef.current = leftFist && rightFist;

        // Update instructions
        if (isRepositioningRef.current) {
          setShowInstructions(true);
          setInstructionText('✊ Repositioning Mode - Move hands to adjust guitar size and position');
        } else {
          setShowInstructions(true);
          setInstructionText('🎸 Playing Mode - Strum with right hand | Make fists to reposition');
        }

        // Use palm base (landmark 0) for strumming hand, middle finger MCP (landmark 9) for neck hand
        const strumPoint = convert(rightHandLandmarks[0]);
        const neckPoint = convert(leftHandLandmarks[9]);

        const neckVec = new THREE.Vector3(neckPoint.x, neckPoint.y, neckPoint.z);
        const strumVec = new THREE.Vector3(strumPoint.x, strumPoint.y, strumPoint.z);

        // Calculate guitar orientation
        const guitarYAxis = new THREE.Vector3().subVectors(neckVec, strumVec);
        const distance = guitarYAxis.length();
        guitarYAxis.normalize();

        // Camera-facing rotation logic
        const viewDirection = new THREE.Vector3(0, 0, 1);
        const projection = viewDirection.clone().projectOnVector(guitarYAxis);
        const guitarZAxis = viewDirection.clone().sub(projection).normalize();

        // Fallback if neck points directly at camera
        if (guitarZAxis.lengthSq() < 0.001) {
          const worldX = new THREE.Vector3(1, 0, 0);
          const projectionX = worldX.clone().projectOnVector(guitarYAxis);
          guitarZAxis.copy(worldX).sub(projectionX).normalize();
        }

        const guitarXAxis = new THREE.Vector3().crossVectors(guitarYAxis, guitarZAxis).normalize();
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeBasis(guitarXAxis, guitarYAxis, guitarZAxis);
        guitarModelRef.current.quaternion.setFromRotationMatrix(rotationMatrix);

        if (isRepositioningRef.current) {
          // Repositioning mode: scale with distance
          const scale = distance * 1.1;
          lastGuitarScaleRef.current = scale;
          guitarModelRef.current.scale.set(scale, scale, scale);

          // Position at midpoint between hands
          const midPoint = new THREE.Vector3().addVectors(strumVec, neckVec).multiplyScalar(0.5);
          guitarModelRef.current.position.copy(midPoint);
        } else {
          // Playing mode: use last known scale
          const scale = lastGuitarScaleRef.current;
          guitarModelRef.current.scale.set(scale, scale, scale);

          // Position guitar so strumming hand is near body base
          const localOffset = new THREE.Vector3(0, guitarModelRef.current.userData.bodyBaseOffset || -0.4, 0);
          localOffset.multiplyScalar(scale);
          const worldOffset = localOffset.clone().applyQuaternion(guitarModelRef.current.quaternion);
          guitarModelRef.current.position.copy(strumVec.clone().sub(worldOffset));

          // String interaction: use right hand fingertips
          const fingertipIndices = [4, 8, 12, 16, 20];
          fingertipIndices.forEach(tipIdx => {
            const tip = rightHandLandmarks[tipIdx];
            const stringIndex = Math.floor((1 - tip.y) * 6);

            if (stringIndex >= 0 && stringIndex < 6) {
              const string = guitarModelRef.current.strings[stringIndex];
              const centeredX = tip.x - 0.5;
              const strength = Math.min(1, Math.abs(centeredX) * 2 + 0.25);
              string.userData.hitStrength = Math.max(string.userData.hitStrength || 0, strength);

              if (onStringPlayed) {
                const stringNames = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
                onStringPlayed({
                  string: stringIndex,
                  note: stringNames[stringIndex],
                  intensity: strength
                });
              }
            }
          });
        }
      } else {
        // Only one hand - hide guitar
        guitarModelRef.current.visible = false;
        setShowInstructions(true);
        setInstructionText('Show two hands to position the guitar');
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
