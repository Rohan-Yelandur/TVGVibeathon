import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import './Guitar.css';

const Guitar = forwardRef(({ onStringPlayed }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guitarModelRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);

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
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.6,
      metalness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    guitarGroup.add(body);

    // Sound hole
    const holeGeometry = new THREE.CircleGeometry(0.15, 32);
    const holeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
    });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.set(0, 0.2, 0.076);
    guitarGroup.add(hole);

    // Guitar neck
    const neckGeometry = new THREE.BoxGeometry(0.15, 1.5, 0.1);
    const neckMaterial = new THREE.MeshStandardMaterial({
      color: 0xD2B48C,
      roughness: 0.7,
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.set(0, 1.35, 0);
    guitarGroup.add(neck);

    // Headstock
    const headGeometry = new THREE.BoxGeometry(0.25, 0.3, 0.1);
    const head = new THREE.Mesh(headGeometry, neckMaterial);
    head.position.set(0, 2.25, 0);
    guitarGroup.add(head);

    // Guitar strings
    const stringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.2,
      metalness: 0.9,
    });

    const stringColors = [
      '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF', '#C8B6FF', '#FFD6FF'
    ];

    guitarGroup.strings = [];
    const stringSpacing = 0.04;
    const stringLength = 2.2;

    for (let i = 0; i < 6; i++) {
      const stringGeometry = new THREE.CylinderGeometry(0.003, 0.003, stringLength, 8);
      const strMaterial = stringMaterial.clone();
      strMaterial.color.setStyle(stringColors[i]);
      const string = new THREE.Mesh(stringGeometry, strMaterial);
      
      const xPos = (i - 2.5) * stringSpacing;
      string.position.set(xPos, 0.5, 0.08);
      string.userData.originalColor = stringColors[i];
      string.userData.index = i;
      
      guitarGroup.add(string);
      guitarGroup.strings.push(string);
    }

    // Fret markers
    const fretMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
    });

    const fretPositions = [0.9, 1.1, 1.3, 1.5, 1.7];
    fretPositions.forEach(y => {
      const fretGeometry = new THREE.BoxGeometry(0.16, 0.02, 0.02);
      const fret = new THREE.Mesh(fretGeometry, fretMaterial);
      fret.position.set(0, y, 0.05);
      guitarGroup.add(fret);
    });

    // Rotate guitar for better view
    guitarGroup.rotation.x = Math.PI * 0.15;
    guitarGroup.rotation.y = Math.PI * 0.1;

    scene.add(guitarGroup);

    // Animation loop
    const animate = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Gentle rotation animation
        if (guitarModelRef.current) {
          guitarModelRef.current.rotation.y += 0.002;

          // Update per-string visual feedback (decay hitStrength)
          if (guitarModelRef.current.strings) {
            guitarModelRef.current.strings.forEach(string => {
              // decay hit strength
              string.userData.hitStrength = Math.max(0, (string.userData.hitStrength || 0) * 0.88);

              const h = string.userData.hitStrength || 0;

              // scale effect
              const baseScale = 1;
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

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updatePressedKeys: (fingertips) => {
      if (!guitarModelRef.current || !guitarModelRef.current.strings) return;

      // Reset all strings to original color and scale
      guitarModelRef.current.strings.forEach(string => {
        string.material.color.setStyle(string.userData.originalColor);
        string.scale.set(1, 1, 1);
        // initialize hitStrength if missing
        if (typeof string.userData.hitStrength === 'undefined') string.userData.hitStrength = 0;
      });

      // If no fingertips, keep guitar visible but inactive
      if (!fingertips || fingertips.length === 0) {
        return;
      }

      // Map fingertip positions to guitar strings
      // fingertips are normalized coords (x,y)
      console.debug('Guitar.updatePressedKeys got', fingertips.length, 'tips');
      fingertips.forEach(tip => {
        const stringIndex = Math.floor((1 - tip.y) * 6);

        if (stringIndex >= 0 && stringIndex < 6) {
          const string = guitarModelRef.current.strings[stringIndex];

          // Calculate a hit strength from x coordinate magnitude and proximity to center
          // tip.x is [0..1] across the frame; map to [-0.5..0.5] centered
          const centeredX = tip.x - 0.5;
          const strength = Math.min(1, Math.abs(centeredX) * 2 + 0.25);

          // Set hitStrength which will be used by animation loop to blend color/scale
          string.userData.hitStrength = Math.max(string.userData.hitStrength || 0, strength);

          // Immediate visual cue (also handled by animation loop)
          string.material.color.set(0x00ff88);

          // Optional: callback for audio playback
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
  }));

  return (
    <div className="guitar-container">
      <canvas ref={canvasRef} className="guitar-canvas" />
    </div>
  );
});

export default Guitar;
