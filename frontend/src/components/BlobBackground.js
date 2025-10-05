import React, { useEffect, useRef } from 'react';
import './BlobBackground.css';

const BlobBackground = ({ isActive = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Blob class
    class Blob {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = 180 + Math.random() * 220;
        this.colorIndex = Math.floor(Math.random() * colors.length);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < -this.radius || this.x > canvas.width + this.radius) {
          this.vx *= -1;
        }
        if (this.y < -this.radius || this.y > canvas.height + this.radius) {
          this.vy *= -1;
        }

        // Keep in bounds
        this.x = Math.max(-this.radius, Math.min(canvas.width + this.radius, this.x));
        this.y = Math.max(-this.radius, Math.min(canvas.height + this.radius, this.y));
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, colors[this.colorIndex] + 'FF');
        gradient.addColorStop(0.3, colors[this.colorIndex] + 'CC');
        gradient.addColorStop(0.6, colors[this.colorIndex] + '88');
        gradient.addColorStop(0.8, colors[this.colorIndex] + '44');
        gradient.addColorStop(1, colors[this.colorIndex] + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add defined outline
        // ctx.strokeStyle = colors[this.colorIndex] + 'EE';
        // ctx.lineWidth = 3;
        // ctx.stroke();
      }
    }

    // Color palette
    const colors = [
      '#E7C6FF', // lavender
      '#B8C0FF', // blue
      '#C8B6FF', // purple
      '#BBD0FF', // light blue
      '#D4A5FF', // medium purple
      '#A0C4FF', // sky blue
      '#CDB4DB', // dusty purple
      '#E0BBE4', // orchid
      '#DFCCF1', // pale lavender
      '#9B9EE8', // periwinkle
      '#8FA3E8', // cornflower blue
      '#A89FD9', // wisteria
      '#7B92D4'  // medium slate blue
    ];

    // Create blobs
    const blobs = [];
    const blobCount = 12;
    for (let i = 0; i < blobCount; i++) {
      blobs.push(new Blob());
    }

    // Draw connections between nearby blobs
    const drawConnections = () => {
      const maxDistance = 300;
      
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
          const dx = blobs[i].x - blobs[j].x;
          const dy = blobs[i].y - blobs[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.5;
            const gradient = ctx.createLinearGradient(
              blobs[i].x, blobs[i].y,
              blobs[j].x, blobs[j].y
            );
            gradient.addColorStop(0, colors[blobs[i].colorIndex] + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, colors[blobs[j].colorIndex] + Math.floor(opacity * 255).toString(16).padStart(2, '0'));

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(blobs[i].x, blobs[i].y);
            ctx.lineTo(blobs[j].x, blobs[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      // Only animate if isActive is true
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw blobs
      blobs.forEach(blob => {
        blob.update();
        blob.draw();
      });

      // Draw connections
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  return <canvas ref={canvasRef} className="blob-background" />;
};

export default BlobBackground;
