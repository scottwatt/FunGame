import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';

function WritingPhase({ gameState }) {
  const { roomCode, playerId, roomData } = gameState;
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  
  if (!roomData || !roomData.game) return <div>Loading...</div>;

  const players = Object.entries(roomData.players || {});
  const subjects = players.map(([id, data]) => ({ id, ...data }));
  const categories = roomData.game.categories || [];
  const totalRounds = categories.length;
  const currentCategory = categories[currentRoundIndex];
  const currentSubject = subjects[currentSubjectIndex];
  
  // Calculate total progress
  const totalAnswersNeeded = totalRounds * subjects.length;
  const totalAnswersSubmitted = Object.keys(answersSubmitted).length;
  const overallProgress = (totalAnswersSubmitted / totalAnswersNeeded) * 100;

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      alert('Please write an answer!');
      return;
    }

    try {
      // Submit answer to the current round's answers
      await gameService.submitAnswerForRound(
        roomCode, 
        playerId, 
        currentSubject.id, 
        currentAnswer,
        currentRoundIndex + 1
      );
      
      // Track submitted answers
      const answerKey = `round${currentRoundIndex + 1}_${currentSubject.id}`;
      const newSubmitted = { ...answersSubmitted, [answerKey]: true };
      setAnswersSubmitted(newSubmitted);
      setCurrentAnswer('');
      
      // Move to next subject or round
      if (currentSubjectIndex < subjects.length - 1) {
        // Next subject in current round
        setCurrentSubjectIndex(currentSubjectIndex + 1);
      } else if (currentRoundIndex < totalRounds - 1) {
        // Next round
        setCurrentRoundIndex(currentRoundIndex + 1);
        setCurrentSubjectIndex(0);
      } else {
        // All done!
        setIsComplete(true);
        await gameService.markPlayerWritingComplete(roomCode, playerId);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (isComplete) {
    return (
      <motion.div 
        className="waiting-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            style={{ fontSize: '4em', marginBottom: '20px' }}
          >
            ✅
          </motion.div>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
            All Answers Submitted!
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666' }}>
            Great job! You've completed all {totalAnswersNeeded} answers.
          </p>
          <div className="progress-indicator" style={{ marginTop: '30px' }}>
            <p>Waiting for other players to finish...</p>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '15px',
              marginTop: '15px'
            }}>
              Players completed: {
                Object.values(roomData.game.playersCompleted || {}).filter(Boolean).length
              } / {subjects.length}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="writing-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Overall Progress Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        padding: '15px',
        borderRadius: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: 'bold' }}>
            Overall Progress
          </span>
          <span style={{ fontSize: '0.9rem', color: '#667eea' }}>
            {totalAnswersSubmitted} / {totalAnswersNeeded} answers
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${overallProgress}%`,
              height: '10px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Round and Category Info */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '15px',
        padding: '10px',
        background: 'white',
        borderRadius: '15px',
        border: '2px solid #e0e0e0'
      }}>
        <div style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', color: '#888', marginBottom: '5px' }}>
          Round {currentRoundIndex + 1} of {totalRounds}
        </div>
        <div style={{ fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: '#333', fontWeight: 'bold' }}>
          Question {currentSubjectIndex + 1} of {subjects.length}
        </div>
      </div>

      <div className="category-card">
        <div className="category-text">{currentCategory}</div>
        <div style={{ margin: '15px 0' }}>Write your answer for:</div>
        <div className="subject-name">{currentSubject.name}</div>
        {currentSubject.id === playerId && (
          <div style={{ 
            color: '#667eea', 
            marginTop: '10px', 
            fontSize: '0.9em',
            padding: '10px',
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '10px'
          }}>
            ✨ This is YOU - write your TRUE answer about yourself!<br/>
            <span style={{ fontSize: '0.85em', opacity: 0.9 }}>
              (Others will try to guess which answer is yours)
            </span>
          </div>
        )}
      </div>

      <textarea
        className="answer-input"
        placeholder="Take your time and write a creative answer..."
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

      <div style={{ 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '0.9em',
        margin: '15px 0'
      }}>
        💡 No time limit - be creative!
      </div>

      <Button onClick={handleSubmit} variant="primary">
        {currentSubjectIndex < subjects.length - 1 
          ? `Next Person (${currentSubjectIndex + 2}/${subjects.length})`
          : currentRoundIndex < totalRounds - 1
            ? `Next Round (Round ${currentRoundIndex + 2})`
            : 'Submit Final Answer 🎉'
        }
      </Button>

      {/* Round Progress Dots */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '5px',
        marginTop: '20px'
      }}>
        {[...Array(totalRounds)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i < currentRoundIndex ? '#667eea' 
                : i === currentRoundIndex ? '#a0b0ff'
                : '#e0e0e0',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Category Preview */}
      {currentRoundIndex < totalRounds - 1 && (
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '15px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '5px' }}>
            Next category:
          </div>
          <div style={{ fontSize: '0.95em', color: '#667eea', fontWeight: '600' }}>
            "{categories[currentRoundIndex + 1]}"
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default WritingPhase;