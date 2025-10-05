import React, { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useSettings } from '../contexts/SettingsContext';
import './HandTracking.css';

const HandTracking = ({ videoRef, isActive, onHandsDetected }) => {
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastProcessTimeRef = useRef(0);
  const { settings, getTrackingConfig } = useSettings();

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        // Clean up existing instance if it exists
        if (handLandmarkerRef.current) {
          handLandmarkerRef.current.close();
          handLandmarkerRef.current = null;
        }

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const trackingConfig = getTrackingConfig();
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: trackingConfig.minHandDetectionConfidence,
          minHandPresenceConfidence: trackingConfig.minHandPresenceConfidence,
          minTrackingConfidence: trackingConfig.minTrackingConfidence
        });

        console.log('HandLandmarker initialized with settings:', trackingConfig);
      } catch (error) {
        console.error('Error initializing HandLandmarker:', error);
      }
    };

    initializeHandLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, [getTrackingConfig, settings.trackingSensitivity]); // Reinitialize when sensitivity changes

  // Process video frames and detect hands
  useEffect(() => {
    if (!isActive || !videoRef.current || !handLandmarkerRef.current) {
      return;
    }

    const trackingConfig = getTrackingConfig();
    const FRAME_INTERVAL = 1000 / trackingConfig.fps; // Use FPS from settings
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
      
      // Only draw landmarks if setting is enabled
      if (settings.showHandLandmarks && cachedResults && cachedResults.landmarks && cachedResults.landmarks.length > 0) {
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

          // Draw hand landmarks only if enabled
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (settings.showHandLandmarks && results.landmarks && results.landmarks.length > 0) {
            drawHandLandmarks(ctx, results.landmarks, canvas.width, canvas.height);
          }
          
          // Always send hand data to parent component (even if not drawing)
          if (results.landmarks && results.landmarks.length > 0) {
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
  }, [getTrackingConfig, isActive, videoRef, onHandsDetected, settings.trackingFPS, settings.showHandLandmarks]); // Restart detection loop when FPS or visibility changes

  // Draw hand landmarks on canvas (optimized)
  const drawHandLandmarks = (ctx, landmarksArray, width, height) => {
    // Use batch rendering for better performance
    ctx.save();
    
    landmarksArray.forEach((landmarks) => {
      // Draw connections between landmarks - excluding thumb
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        // [0, 5], // Palm to index base - REMOVED
        [5, 6], [6, 7], [7, 8], // Index
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

      // Draw only fingertips for better performance - excluding thumb
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
