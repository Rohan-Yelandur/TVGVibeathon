import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lessons.css';
import { PIANO_LESSONS } from './PianoLesson';

const Lessons = () => {
  const navigate = useNavigate();
  const [selectedInstrument, setSelectedInstrument] = useState('Piano');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const instruments = [
    { name: 'Piano', emoji: '🎹' },
    { name: 'Guitar', emoji: '🎸' },
    { name: 'Flute', emoji: '🪈' },
    { name: 'Drums', emoji: '🥁' },
    { name: 'Violin', emoji: '🎻' },
    { name: 'Trumpet', emoji: '🎺' }
  ];

  const skillTrees = {
    Piano: [
      // 10 nodes - Complex branching structure
      { id: 1, name: 'Hand Position', level: 1, x: 50, y: 2, connections: [2, 3, 4] },
      { id: 2, name: 'C Major Scale', level: 2, x: 15, y: 18, connections: [5] },
      { id: 3, name: 'Basic Chords', level: 3, x: 50, y: 18, connections: [6] },
      { id: 4, name: 'Rhythm Reading', level: 2, x: 85, y: 18, connections: [7] },
      { id: 5, name: 'Minor Scales', level: 3, x: 10, y: 38, connections: [8] },
      { id: 6, name: 'Chord Progressions', level: 3, x: 50, y: 38, connections: [8, 9] },
      { id: 7, name: 'Sight Reading', level: 3, x: 85, y: 38, connections: [9] },
      { id: 8, name: 'Arpeggios', level: 4, x: 25, y: 60, connections: [10] },
      { id: 9, name: 'Two-Hand Coordination', level: 4, x: 70, y: 60, connections: [10] },
      { id: 10, name: 'Advanced Techniques', level: 5, x: 50, y: 82, connections: [] }
    ],
    Guitar: [
      // 12 nodes - Most complex with multiple paths
      { id: 1, name: 'Holding the Guitar', level: 1, x: 50, y: 2, connections: [2, 3] },
      { id: 2, name: 'Open Chords', level: 2, x: 25, y: 15, connections: [4, 5] },
      { id: 3, name: 'Strumming Patterns', level: 2, x: 75, y: 15, connections: [6] },
      { id: 4, name: 'Barre Chords', level: 3, x: 8, y: 28, connections: [7] },
      { id: 5, name: 'Chord Transitions', level: 3, x: 35, y: 28, connections: [8] },
      { id: 6, name: 'Fingerpicking', level: 3, x: 75, y: 28, connections: [9] },
      { id: 7, name: 'Power Chords', level: 4, x: 8, y: 43, connections: [10] },
      { id: 8, name: 'Scales & Modes', level: 4, x: 35, y: 43, connections: [10, 11] },
      { id: 9, name: 'Advanced Fingerstyle', level: 4, x: 75, y: 43, connections: [11] },
      { id: 10, name: 'Lead Guitar', level: 5, x: 25, y: 60, connections: [12] },
      { id: 11, name: 'Music Theory', level: 5, x: 65, y: 60, connections: [12] },
      { id: 12, name: 'Improvisation', level: 6, x: 50, y: 78, connections: [] }
    ],
    Flute: [
      // 6 nodes - Simple linear path with one branch
      { id: 1, name: 'Embouchure Basics', level: 1, x: 50, y: 4, connections: [2, 3] },
      { id: 2, name: 'Long Tones', level: 2, x: 28, y: 23, connections: [4] },
      { id: 3, name: 'Basic Fingerings', level: 2, x: 72, y: 23, connections: [4] },
      { id: 4, name: 'Chromatic Scale', level: 3, x: 50, y: 42, connections: [5] },
      { id: 5, name: 'Vibrato', level: 4, x: 50, y: 62, connections: [6] },
      { id: 6, name: 'Advanced Repertoire', level: 5, x: 50, y: 84, connections: [] }
    ],
    Accordion: [
      // 9 nodes - Moderate complexity with dual paths
      { id: 1, name: 'Bellows Control', level: 1, x: 50, y: 3, connections: [2, 3] },
      { id: 2, name: 'Bass Buttons', level: 2, x: 25, y: 18, connections: [4, 5] },
      { id: 3, name: 'Treble Keys', level: 2, x: 75, y: 18, connections: [6] },
      { id: 4, name: 'Chord Buttons', level: 3, x: 12, y: 37, connections: [7] },
      { id: 5, name: 'Walking Bass', level: 3, x: 38, y: 37, connections: [7] },
      { id: 6, name: 'Simple Melodies', level: 3, x: 75, y: 37, connections: [8] },
      { id: 7, name: 'Bellows Techniques', level: 4, x: 25, y: 58, connections: [9] },
      { id: 8, name: 'Complex Melodies', level: 4, x: 75, y: 58, connections: [9] },
      { id: 9, name: 'Folk Style Mastery', level: 5, x: 50, y: 80, connections: [] }
    ],
    Drums: [
      // 11 nodes - Complex with multiple branches
      { id: 1, name: 'Grip & Posture', level: 1, x: 50, y: 2, connections: [2, 3] },
      { id: 2, name: 'Basic Beats', level: 2, x: 25, y: 15, connections: [4, 5] },
      { id: 3, name: 'Rudiments', level: 2, x: 75, y: 15, connections: [6] },
      { id: 4, name: 'Rock Patterns', level: 3, x: 12, y: 28, connections: [7] },
      { id: 5, name: 'Fill Techniques', level: 3, x: 40, y: 28, connections: [8] },
      { id: 6, name: 'Paradiddles', level: 3, x: 75, y: 28, connections: [9] },
      { id: 7, name: 'Blast Beats', level: 4, x: 12, y: 43, connections: [10] },
      { id: 8, name: 'Jazz Rhythms', level: 4, x: 40, y: 43, connections: [10] },
      { id: 9, name: 'Double Bass', level: 4, x: 75, y: 43, connections: [11] },
      { id: 10, name: 'Advanced Coordination', level: 5, x: 28, y: 61, connections: [11] },
      { id: 11, name: 'Polyrhythms', level: 6, x: 60, y: 80, connections: [] }
    ],
    Violin: [
      // 7 nodes - Moderate linear progression
      { id: 1, name: 'Bow Hold', level: 1, x: 50, y: 3, connections: [2] },
      { id: 2, name: 'Open Strings', level: 2, x: 50, y: 16, connections: [3, 4] },
      { id: 3, name: 'Basic Bowing', level: 3, x: 28, y: 31, connections: [5] },
      { id: 4, name: 'First Position', level: 3, x: 72, y: 31, connections: [5] },
      { id: 5, name: 'Bowing Techniques', level: 4, x: 50, y: 48, connections: [6] },
      { id: 6, name: 'Position Shifting', level: 5, x: 50, y: 66, connections: [7] },
      { id: 7, name: 'Advanced Repertoire', level: 6, x: 50, y: 86, connections: [] }
    ],
    Saxophone: [
      // 9 nodes - Jazz-focused branching
      { id: 1, name: 'Embouchure Setup', level: 1, x: 50, y: 3, connections: [2, 3] },
      { id: 2, name: 'Tone Production', level: 2, x: 25, y: 18, connections: [4] },
      { id: 3, name: 'Basic Fingerings', level: 2, x: 75, y: 18, connections: [5] },
      { id: 4, name: 'Altissimo Notes', level: 3, x: 25, y: 35, connections: [6] },
      { id: 5, name: 'Major Scales', level: 3, x: 75, y: 35, connections: [7] },
      { id: 6, name: 'Subtone Techniques', level: 4, x: 18, y: 52, connections: [8] },
      { id: 7, name: 'Chord Tones', level: 4, x: 82, y: 52, connections: [9] },
      { id: 8, name: 'Jazz Improvisation', level: 5, x: 35, y: 70, connections: [9] },
      { id: 9, name: 'Advanced Jazz', level: 6, x: 70, y: 86, connections: [] }
    ],
    Trumpet: [
      // 8 nodes - Brass fundamentals with dual ending paths
      { id: 1, name: 'Mouthpiece Buzz', level: 1, x: 50, y: 4, connections: [2] },
      { id: 2, name: 'Long Tones', level: 2, x: 50, y: 19, connections: [3, 4] },
      { id: 3, name: 'Valve Combinations', level: 3, x: 28, y: 35, connections: [5] },
      { id: 4, name: 'Lip Slurs', level: 3, x: 72, y: 35, connections: [6] },
      { id: 5, name: 'Major Scales', level: 4, x: 28, y: 52, connections: [7] },
      { id: 6, name: 'High Register', level: 4, x: 72, y: 52, connections: [8] },
      { id: 7, name: 'Jazz Phrasing', level: 5, x: 28, y: 72, connections: [] },
      { id: 8, name: 'Classical Techniques', level: 5, x: 72, y: 72, connections: [] }
    ]
  };

  const currentSkills = skillTrees[selectedInstrument] || [];

  const handleSkillClick = (skill) => {
    // Placeholder - no action for now
    console.log('Clicked skill:', skill.name);
  };

  const handlePianoLessonClick = (lessonId) => {
    navigate(`/piano-lesson/${lessonId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.lessons-instrument-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const currentInstrument = instruments.find(i => i.name === selectedInstrument);

  return (
    <div className="lessons-container">
      <div className="lessons-content">
        <h1 className="lessons-title">Learning Path</h1>
        <p className="lessons-subtitle">Master your instrument step by step</p>

        <div className="lessons-instrument-selector">
          <div 
            className="lessons-instrument-dropdown-custom"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="lessons-selected-instrument">
              {currentInstrument && `${currentInstrument.emoji} ${currentInstrument.name}`}
            </span>
            <span className="lessons-dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
          </div>
          {isDropdownOpen && (
            <div className="lessons-instrument-options">
              {instruments.map((instrument) => (
                <div 
                  key={instrument.name}
                  className={`lessons-instrument-option ${selectedInstrument === instrument.name ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedInstrument(instrument.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  {instrument.emoji} {instrument.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedInstrument === 'Piano' ? (
          <div className="piano-lessons-list">
            <h3 className="lessons-list-title">Available Piano Lessons</h3>
            <div className="lessons-grid">
              {Object.values(PIANO_LESSONS).map((lesson) => (
                <div 
                  key={lesson.id}
                  className="lesson-card"
                  onClick={() => handlePianoLessonClick(lesson.id)}
                >
                  <div className="lesson-card-icon">🎹</div>
                  <h4 className="lesson-card-title">{lesson.name}</h4>
                  <p className="lesson-card-description">{lesson.description}</p>
                  <div className="lesson-card-steps">
                    {lesson.steps.length} steps
                  </div>
                  <button className="start-lesson-button">
                    Start Lesson →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="skill-tree-container">
            <svg className="skill-tree-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
              {currentSkills.map((skill) =>
                skill.connections.map((connectionId) => {
                  const targetSkill = currentSkills.find((s) => s.id === connectionId);
                  if (targetSkill) {
                    return (
                      <line
                        key={`${skill.id}-${connectionId}`}
                        x1={skill.x}
                        y1={skill.y}
                        x2={targetSkill.x}
                        y2={targetSkill.y}
                        className="connection-line"
                      />
                    );
                  }
                  return null;
                })
              )}
            </svg>

            {currentSkills.map((skill) => (
              <div
                key={skill.id}
                className="skill-node"
                style={{
                  left: `${skill.x}%`,
                  top: `${skill.y}%`
                }}
                onClick={() => handleSkillClick(skill)}
              >
                <div className="skill-circle">
                  <span className="skill-level">{skill.level}</span>
                </div>
                <div className="skill-name">{skill.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Lessons);
