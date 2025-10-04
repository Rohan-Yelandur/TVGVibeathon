import React, { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './HandTracking.css';

const HandTracking = ({ videoRef, isActive, onHandsDetected }) => {
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastProcessTimeRef = useRef(0);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        console.log('HandLandmarker initialized successfully');
      } catch (error) {
        console.error('Error initializing HandLandmarker:', error);
      }
    };

    initializeHandLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Process video frames and detect hands
  useEffect(() => {
    if (!isActive || !videoRef.current || !handLandmarkerRef.current) {
      return;
    }

    const FRAME_INTERVAL = 1000 / 30; // Target 30 FPS max for hand detection
    let cachedResults = null;

    const detectHands = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectHands);
        return;
      }

      const now = performance.now();
      
      // Only process new frames - skip if video time hasn't changed
      const currentTime = video.currentTime;
      if (currentTime === lastVideoTimeRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectHands);
        return;
      }

      // Throttle processing to 30 FPS
      const timeSinceLastProcess = now - lastProcessTimeRef.current;
      const shouldProcess = timeSinceLastProcess >= FRAME_INTERVAL;

      // Match canvas size to video size for consistent coordinate mapping
      const videoRect = video.getBoundingClientRect();
      if (canvas.width !== videoRect.width || canvas.height !== videoRect.height) {
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
      }

      const ctx = canvas.getContext('2d', { 
        alpha: true, 
        desynchronized: true,
        willReadFrequently: false 
      });

      // Always redraw the last results for smooth visuals
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (cachedResults && cachedResults.landmarks && cachedResults.landmarks.length > 0) {
        drawHandLandmarks(ctx, cachedResults.landmarks, canvas.width, canvas.height);
      }

      // Only run detection at throttled rate
      if (shouldProcess) {
        lastVideoTimeRef.current = currentTime;
        lastProcessTimeRef.current = now;

        try {
          // Detect hands in the current video frame
          const results = handLandmarkerRef.current.detectForVideo(
            video,
            now
          );

          cachedResults = results;

          // Draw hand landmarks
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks && results.landmarks.length > 0) {
            drawHandLandmarks(ctx, results.landmarks, canvas.width, canvas.height);
            
            // Send hand data to parent component
            // Extract fingertips AND DIP joints (excluding thumbs)
            // Index finger: 8 (tip), 7 (DIP)
            // Middle finger: 12 (tip), 11 (DIP)
            // Ring finger: 16 (tip), 15 (DIP)
            // Pinky finger: 20 (tip), 19 (DIP)
            if (onHandsDetected) {
              onHandsDetected(results.landmarks);
            }
          } else {
            if (onHandsDetected) {
              onHandsDetected(null);
            }
          }
        } catch (error) {
          console.error('Error detecting hands:', error);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastVideoTimeRef.current = -1;
      lastProcessTimeRef.current = 0;
    };
  }, [isActive, videoRef, onHandsDetected]);

  // Draw hand landmarks on canvas (optimized)
  const drawHandLandmarks = (ctx, landmarksArray, width, height) => {
    // Use batch rendering for better performance
    ctx.save();
    
    landmarksArray.forEach((landmarks) => {
      // Draw connections between landmarks - simplified
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [5, 9], [9, 10], [10, 11], [11, 12], // Middle
        [9, 13], [13, 14], [14, 15], [15, 16], // Ring
        [13, 17], [17, 18], [18, 19], [19, 20] // Pinky
      ];

      // Draw all connections in one batch
      ctx.strokeStyle = '#C77DFF';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
      });
      ctx.stroke();

      // Draw only fingertips for better performance
      const fingertips = [4, 8, 12, 16, 20];
      ctx.fillStyle = '#7B2CBF';
      ctx.beginPath();
      fingertips.forEach((index) => {
        const landmark = landmarks[index];
        const x = landmark.x * width;
        const y = landmark.y * height;
        ctx.moveTo(x + 4, y);
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
      });
      ctx.fill();
    });
    
    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="hand-tracking-canvas"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
};

export default HandTracking;
