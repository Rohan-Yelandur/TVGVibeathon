import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PianoLesson from '../components/PianoLesson';

const PianoLessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/lessons');
  };

  return <PianoLesson lessonId={lessonId} onExit={handleExit} />;
};

export default PianoLessonPage;
