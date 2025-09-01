import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import Timer from '../UI/Timer';

function GuessingPhase({ gameState }) {
  const { roomCode, playerId, roomData } = gameState;
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  
  if (!roomData || !roomData.game) return <div>Loading...</div>;

  const currentSubjectIndex = roomData.game.currentSubjectIndex || 0;
  const players = Object.entries(roomData.players || {});
  const subjects = players.map(([id, data]) => ({ id, ...data }));
  const currentSubject = subjects[currentSubjectIndex];
  
  if (!currentSubject) return <div>Loading next round...</div>;
  
  const answers = roomData.game.answers[currentSubject.id] || {};
  const answerEntries = Object.entries(answers);
  
  // Shuffle answers for display
  const shuffledAnswers = [...answerEntries].sort(() => Math.random() - 0.5);

  const handleGuess = async () => {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    try {
      await gameService.submitGuess(roomCode, playerId, currentSubject.id, selectedAnswer);
      setHasGuessed(true);
      setRevealAnswers(true);
      
      // Move to next round after delay
      setTimeout(async () => {
        await gameService.nextRound(roomCode);
      }, 3000);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  return (
    <motion.div 
      className="guessing-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="category-card">
        <div className="category-text">{roomData.game.currentCategory}</div>
        <div style={{ margin: '15px 0' }}>Which answer did</div>
        <div className="subject-name">{currentSubject.name}</div>
        <div style={{ marginTop: '10px' }}>write about themselves?</div>
      </div>

      <div className="answers-grid">
        {shuffledAnswers.map(([writerId, answerData], index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`answer-option ${selectedAnswer === writerId ? 'selected' : ''} ${
              revealAnswers ? (writerId === currentSubject.id ? 'correct' : 'incorrect') : ''
            }`}
            onClick={() => !hasGuessed && setSelectedAnswer(writerId)}
            style={{
              padding: '15px',
              margin: '10px 0',
              border: '3px solid #e0e0e0',
              borderRadius: '15px',
              cursor: hasGuessed ? 'default' : 'pointer',
              background: selectedAnswer === writerId ? 'rgba(102, 126, 234, 0.1)' : 'white',
            }}
          >
            <div>{answerData.text}</div>
            {revealAnswers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}
              >
                Written by: {players.find(([id]) => id === writerId)?.[1].name}
                {writerId === currentSubject.id && ' ✅ (CORRECT)'}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {!hasGuessed && (
        <>
          <Timer duration={30} onComplete={handleGuess} />
          <Button onClick={handleGuess} variant="primary" disabled={!selectedAnswer}>
            Lock In Guess! 🔒
          </Button>
        </>
      )}

      {hasGuessed && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Moving to next round...</p>
        </div>
      )}
    </motion.div>
  );
}

export default GuessingPhase;
