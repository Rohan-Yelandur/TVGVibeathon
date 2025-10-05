import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './PianoLesson.css';

// Define available piano lessons
export const pianoLessons = [
  {
    id: 'basic-notes',
    name: 'Basic Notes',
    description: 'Learn individual notes',
    difficulty: 'Beginner',
    steps: [
      { notes: ['C4'], duration: 3000, instruction: 'Play C4' },
      { notes: ['D4'], duration: 3000, instruction: 'Play D4' },
      { notes: ['E4'], duration: 3000, instruction: 'Play E4' },
      { notes: ['F4'], duration: 3000, instruction: 'Play F4' },
      { notes: ['G4'], duration: 3000, instruction: 'Play G4' },
      { notes: ['A4'], duration: 3000, instruction: 'Play A4' },
      { notes: ['B4'], duration: 3000, instruction: 'Play B4' },
      { notes: ['C5'], duration: 3000, instruction: 'Play C5' },
    ]
  },
  {
    id: 'c-major-scale',
    name: 'C Major Scale',
    description: 'Master the C Major scale',
    difficulty: 'Beginner',
    steps: [
      { notes: ['C4'], duration: 2000, instruction: 'C' },
      { notes: ['D4'], duration: 2000, instruction: 'D' },
      { notes: ['E4'], duration: 2000, instruction: 'E' },
      { notes: ['F4'], duration: 2000, instruction: 'F' },
      { notes: ['G4'], duration: 2000, instruction: 'G' },
      { notes: ['A4'], duration: 2000, instruction: 'A' },
      { notes: ['B4'], duration: 2000, instruction: 'B' },
      { notes: ['C5'], duration: 2000, instruction: 'C' },
    ]
  },
  {
    id: 'simple-chords',
    name: 'Simple Chords',
    description: 'Learn basic chord shapes',
    difficulty: 'Intermediate',
    steps: [
      { notes: ['C4', 'E4', 'G4'], duration: 4000, instruction: 'C Major Chord' },
      { notes: ['F4', 'A4', 'C5'], duration: 4000, instruction: 'F Major Chord' },
      { notes: ['G4', 'B4', 'D5'], duration: 4000, instruction: 'G Major Chord' },
      { notes: ['A4', 'C5', 'E5'], duration: 4000, instruction: 'A Minor Chord' },
    ]
  },
  {
    id: 'mary-had-lamb',
    name: 'Mary Had a Little Lamb',
    description: 'Play a simple melody',
    difficulty: 'Beginner',
    steps: [
      { notes: ['E4'], duration: 1500, instruction: 'Ma-' },
      { notes: ['D4'], duration: 1500, instruction: 'ry' },
      { notes: ['C4'], duration: 1500, instruction: 'had' },
      { notes: ['D4'], duration: 1500, instruction: 'a' },
      { notes: ['E4'], duration: 1500, instruction: 'lit-' },
      { notes: ['E4'], duration: 1500, instruction: 'tle' },
      { notes: ['E4'], duration: 2000, instruction: 'lamb' },
      { notes: ['D4'], duration: 1500, instruction: 'lit-' },
      { notes: ['D4'], duration: 1500, instruction: 'tle' },
      { notes: ['D4'], duration: 2000, instruction: 'lamb' },
    ]
  },
  {
    id: 'twinkle-twinkle',
    name: 'Twinkle Twinkle Little Star',
    description: 'Classic melody practice',
    difficulty: 'Beginner',
    steps: [
      { notes: ['C4'], duration: 1500, instruction: 'Twin-' },
      { notes: ['C4'], duration: 1500, instruction: 'kle' },
      { notes: ['G4'], duration: 1500, instruction: 'twin-' },
      { notes: ['G4'], duration: 1500, instruction: 'kle' },
      { notes: ['A4'], duration: 1500, instruction: 'lit-' },
      { notes: ['A4'], duration: 1500, instruction: 'tle' },
      { notes: ['G4'], duration: 2500, instruction: 'star' },
      { notes: ['F4'], duration: 1500, instruction: 'How' },
      { notes: ['F4'], duration: 1500, instruction: 'I' },
      { notes: ['E4'], duration: 1500, instruction: 'won-' },
      { notes: ['E4'], duration: 1500, instruction: 'der' },
      { notes: ['D4'], duration: 1500, instruction: 'what' },
      { notes: ['D4'], duration: 1500, instruction: 'you' },
      { notes: ['C4'], duration: 2500, instruction: 'are' },
    ]
  },
  {
    id: 'chord-progression',
    name: 'Chord Progression I-IV-V',
    description: 'Learn common chord progression',
    difficulty: 'Intermediate',
    steps: [
      { notes: ['C4', 'E4', 'G4'], duration: 3000, instruction: 'I - C Major' },
      { notes: ['F4', 'A4', 'C5'], duration: 3000, instruction: 'IV - F Major' },
      { notes: ['G4', 'B4', 'D5'], duration: 3000, instruction: 'V - G Major' },
      { notes: ['C4', 'E4', 'G4'], duration: 3000, instruction: 'I - C Major' },
    ]
  }
];

const PianoLesson = forwardRef(({ lesson, pianoCanvasRef, onLessonComplete }, ref) => {
  const canvasRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [correctNotesPressed, setCorrectNotesPressed] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const animationFrameRef = useRef(null);
  const stepTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  // Get current step data
  const currentStepData = lesson && lesson.steps ? lesson.steps[currentStep] : null;

  // Resize canvas to match parent
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const renderLoop = () => {
      drawLesson();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [currentStep, correctNotesPressed, showSuccess, lessonCompleted, lesson]);

  const drawLesson = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStepData) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Draw instruction text at the top
    ctx.save();
    ctx.font = 'bold 32px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Create gradient for text
    const textGradient = ctx.createLinearGradient(width / 2 - 200, 30, width / 2 + 200, 30);
    textGradient.addColorStop(0, '#7B2CBF');
    textGradient.addColorStop(1, '#C77DFF');
    ctx.fillStyle = textGradient;
    
    // Text shadow
    ctx.shadowColor = 'rgba(123, 44, 191, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 3;
    
    ctx.fillText(currentStepData.instruction, width / 2, 30);
    ctx.restore();

    // Draw the notes to play prominently
    ctx.save();
    ctx.font = 'bold 48px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const notesText = currentStepData.notes.join(' + ');
    const notesGradient = ctx.createLinearGradient(width / 2 - 150, height / 2 - 100, width / 2 + 150, height / 2 - 100);
    notesGradient.addColorStop(0, '#C77DFF');
    notesGradient.addColorStop(1, '#E0AAFF');
    ctx.fillStyle = notesGradient;
    
    ctx.shadowColor = 'rgba(199, 125, 255, 0.8)';
    ctx.shadowBlur = 20;
    
    ctx.fillText(notesText, width / 2, height / 2 - 100);
    ctx.restore();

    // Draw progress indicator
    const progress = (currentStep / lesson.steps.length) * 100;
    const progressBarWidth = 300;
    const progressBarHeight = 10;
    const progressBarX = (width - progressBarWidth) / 2;
    const progressBarY = 80;

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // Progress fill
    const progressGradient = ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth, 0);
    progressGradient.addColorStop(0, '#7B2CBF');
    progressGradient.addColorStop(1, '#C77DFF');
    ctx.fillStyle = progressGradient;
    ctx.fillRect(progressBarX, progressBarY, (progressBarWidth * progress) / 100, progressBarHeight);

    // Step counter
    ctx.font = 'bold 18px Montserrat';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`Step ${currentStep + 1} of ${lesson.steps.length}`, width / 2, progressBarY + 25);

    // Show success checkmark
    if (showSuccess) {
      ctx.save();
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#00FF88';
      ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
      ctx.shadowBlur = 30;
      ctx.fillText('✓', width / 2, height / 2 - 50);
      ctx.restore();
    }

    // Show lesson completed message
    if (lessonCompleted) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.font = 'bold 48px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const completionGradient = ctx.createLinearGradient(width / 2 - 200, height / 2, width / 2 + 200, height / 2);
      completionGradient.addColorStop(0, '#00FF88');
      completionGradient.addColorStop(1, '#00D4AA');
      ctx.fillStyle = completionGradient;
      ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
      ctx.shadowBlur = 30;
      
      ctx.fillText('Lesson Complete! 🎉', width / 2, height / 2 - 40);
      
      ctx.font = 'bold 24px Montserrat';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fillText('Great job!', width / 2, height / 2 + 20);
      ctx.restore();
    }
  };

  // Draw note indicators on piano keys
  const drawNoteIndicators = (pianoCtx, keyRectsRef, currentNotes, correctNotes) => {
    if (!pianoCtx || !keyRectsRef || !keyRectsRef.current) return;

    keyRectsRef.current.forEach(keyInfo => {
      const { key, rect } = keyInfo;
      
      // Check if this key should be highlighted
      if (currentNotes.includes(key)) {
        pianoCtx.save();
        
        // Determine if this note has been correctly pressed
        const isCorrect = correctNotes.has(key);
        
        if (isCorrect) {
          // Green glow for correct notes
          pianoCtx.shadowColor = 'rgba(0, 255, 136, 0.8)';
          pianoCtx.shadowBlur = 30;
          pianoCtx.strokeStyle = '#00FF88';
          pianoCtx.lineWidth = 6;
          pianoCtx.strokeRect(rect.left + 3, rect.top + 3, rect.width - 6, rect.height - 6);
          
          // Draw checkmark
          pianoCtx.font = 'bold 40px Arial';
          pianoCtx.textAlign = 'center';
          pianoCtx.textBaseline = 'middle';
          pianoCtx.fillStyle = '#00FF88';
          pianoCtx.shadowBlur = 20;
          pianoCtx.fillText('✓', rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
          // Purple glow for notes to press
          pianoCtx.shadowColor = 'rgba(199, 125, 255, 0.8)';
          pianoCtx.shadowBlur = 30;
          pianoCtx.strokeStyle = '#C77DFF';
          pianoCtx.lineWidth = 6;
          pianoCtx.strokeRect(rect.left + 3, rect.top + 3, rect.width - 6, rect.height - 6);
          
          // Pulsing effect
          const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
          pianoCtx.globalAlpha = pulse;
          pianoCtx.fillStyle = 'rgba(199, 125, 255, 0.3)';
          pianoCtx.fillRect(rect.left, rect.top, rect.width, rect.height);
          pianoCtx.globalAlpha = 1.0;
          
          // Draw note name on key
          pianoCtx.shadowBlur = 10;
          pianoCtx.shadowColor = 'rgba(123, 44, 191, 0.8)';
          pianoCtx.font = 'bold 28px Montserrat';
          pianoCtx.textAlign = 'center';
          pianoCtx.textBaseline = 'middle';
          pianoCtx.fillStyle = '#FFFFFF';
          pianoCtx.fillText(key, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        pianoCtx.restore();
      }
    });
  };

  // Expose method to parent to update lesson state based on pressed keys
  useImperativeHandle(ref, () => ({
    updateLessonState: (pressedKeys, keyRectsRef) => {
      if (!currentStepData || lessonCompleted) return;

      const requiredNotes = currentStepData.notes;
      const newCorrectNotes = new Set(correctNotesPressed);

      // Check which required notes are currently pressed
      requiredNotes.forEach(note => {
        if (pressedKeys[note]) {
          newCorrectNotes.add(note);
        }
      });

      setCorrectNotesPressed(newCorrectNotes);

      // Check if all required notes are pressed
      const allNotesPressed = requiredNotes.every(note => newCorrectNotes.has(note));

      if (allNotesPressed && !showSuccess) {
        // Show success animation
        setShowSuccess(true);

        // Move to next step after duration
        if (successTimerRef.current) {
          clearTimeout(successTimerRef.current);
        }
        
        successTimerRef.current = setTimeout(() => {
          setShowSuccess(false);
          setCorrectNotesPressed(new Set());

          if (currentStep < lesson.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            // Lesson completed
            setLessonCompleted(true);
            if (onLessonComplete) {
              setTimeout(() => {
                onLessonComplete();
              }, 3000);
            }
          }
        }, 1500);
      }

      // Draw note indicators on piano
      if (pianoCanvasRef && pianoCanvasRef.current && keyRectsRef) {
        const pianoCtx = pianoCanvasRef.current.getContext('2d');
        drawNoteIndicators(pianoCtx, keyRectsRef, requiredNotes, newCorrectNotes);
      }
    }
  }), [currentStepData, lessonCompleted, correctNotesPressed, showSuccess, currentStep, pianoCanvasRef, onLessonComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="piano-lesson-canvas"
    />
  );
});

export default PianoLesson;
