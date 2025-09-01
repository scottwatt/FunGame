import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import Timer from '../UI/Timer';

function WritingPhase({ gameState }) {
  const { roomCode, playerId, roomData } = gameState;
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answersSubmitted, setAnswersSubmitted] = useState([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  
  if (!roomData || !roomData.game) return <div>Loading...</div>;

  const players = Object.entries(roomData.players || {});
  const subjects = players.map(([id, data]) => ({ id, ...data }));
  const currentSubject = subjects[currentSubjectIndex];
  const category = roomData.game.currentCategory;

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      alert('Please write an answer!');
      return;
    }

    try {
      await gameService.submitAnswer(roomCode, playerId, currentSubject.id, currentAnswer);
      
      const newSubmitted = [...answersSubmitted, currentSubject.id];
      setAnswersSubmitted(newSubmitted);
      setCurrentAnswer('');
      
      if (currentSubjectIndex < subjects.length - 1) {
        setCurrentSubjectIndex(currentSubjectIndex + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const progress = (answersSubmitted.length / subjects.length) * 100;

  if (answersSubmitted.length >= subjects.length) {
    return (
      <div className="waiting-screen">
        <h2>All answers submitted! ✅</h2>
        <p>Waiting for other players to finish...</p>
        <div className="progress-indicator">
          {Object.keys(roomData.game.answers || {}).reduce((total, subjectId) => {
            return total + Object.keys(roomData.game.answers[subjectId] || {}).length;
          }, 0)} / {subjects.length * subjects.length} answers collected
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="writing-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="category-card">
        <div className="category-text">{category}</div>
        <div style={{ margin: '15px 0' }}>Write your answer for:</div>
        <div className="subject-name">{currentSubject.name}</div>
        {currentSubject.id === playerId && (
          <div style={{ color: '#667eea', marginTop: '10px', fontSize: '0.9em' }}>
            (This is you - write about yourself!)
          </div>
        )}
      </div>

      <textarea
        className="answer-input"
        placeholder="Type your answer here..."
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '15px',
          border: '2px solid #e0e0e0',
          borderRadius: '15px',
          fontSize: '1em',
          resize: 'vertical',
          marginTop: '20px'
        }}
      />

      <Timer duration={30} onComplete={handleSubmit} />

      <Button onClick={handleSubmit} variant="primary">
        Submit Answer ({answersSubmitted.length + 1}/{subjects.length})
      </Button>

      <div className="progress-bar" style={{ marginTop: '20px' }}>
        <div 
          className="progress-fill" 
          style={{ 
            width: `${progress}%`,
            height: '8px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '10px',
            transition: 'width 0.5s ease'
          }}
        />
      </div>
    </motion.div>
  );
}

export default WritingPhase;