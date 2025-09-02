import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import Timer from '../UI/Timer';

function GuessingPhase({ gameState }) {
  const { roomCode, playerId, roomData } = gameState;
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  
  const currentSubjectIndex = roomData?.game?.currentSubjectIndex || 0;
  const currentRound = roomData?.game?.currentRound || 1;
  const totalRounds = roomData?.game?.totalRounds || 4;
  const revealAnswers = roomData?.game?.revealAnswers || false;
  
  const players = roomData ? Object.entries(roomData.players || {}) : [];
  const subjects = players.map(([id, data]) => ({ id, ...data }));
  const currentSubject = subjects[currentSubjectIndex] || null;
  
  // Check if this is the player's own question
  const isOwnQuestion = currentSubject && currentSubject.id === playerId;
  
  // Get submission status
  const guessesSubmitted = roomData?.game?.guessesSubmitted?.[currentSubject?.id] || {};
  const playersWhoNeedToSubmit = players.filter(([pid]) => pid !== currentSubject?.id);
  const submittedCount = Object.values(guessesSubmitted).filter(val => val === true).length;
  const totalNeeded = playersWhoNeedToSubmit.length;
  
  // Debug logging
  console.log('Current subject ID:', currentSubject?.id);
  console.log('Guesses submitted object:', guessesSubmitted);
  console.log('Submitted count:', submittedCount, 'Total needed:', totalNeeded);
  
  // Reset state when moving to a new subject or round
  useEffect(() => {
    setSelectedAnswer(null);
    setHasGuessed(false);
  }, [currentSubjectIndex, currentRound]);
  
  // Check if current player has already submitted for this subject
  useEffect(() => {
    if (currentSubject && guessesSubmitted[playerId]) {
      setHasGuessed(true);
    }
  }, [currentSubject?.id, guessesSubmitted, playerId]);
  
  // Early returns after all hooks
  if (!roomData || !roomData.game) return <div>Loading...</div>;
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
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const handleTimeout = async () => {
    if (!hasGuessed && !isOwnQuestion) {
      try {
        await gameService.submitTimeoutGuess(roomCode, playerId, currentSubject.id);
        setHasGuessed(true);
      } catch (error) {
        console.error('Error submitting timeout:', error);
      }
    }
  };

  // Special view for own question
  if (isOwnQuestion) {
    return (
      <motion.div 
        className="guessing-phase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '15px',
          padding: '10px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
          borderRadius: '15px'
        }}>
          <span style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)', color: '#667eea', fontWeight: 'bold' }}>
            Round {currentRound} of {totalRounds} • Person {currentSubjectIndex + 1} of {subjects.length}
          </span>
          <div style={{ fontSize: '0.8em', color: '#10b981', marginTop: '5px' }}>
            (Your question - watching only)
          </div>
        </div>

        <div className="category-card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
          border: '2px solid #10b981'
        }}>
          <div style={{ fontSize: '1em', color: '#10b981', marginBottom: '10px', fontWeight: 'bold' }}>
            ✨ This is YOUR question! ✨
          </div>
          <div className="category-text">{roomData.game.currentCategory}</div>
          <div style={{ margin: '15px 0', fontSize: '1.1em' }}>
            Watch others guess which answer YOU wrote about yourself!
          </div>
          <div style={{ 
            fontSize: '0.9em', 
            color: '#666', 
            marginTop: '10px',
            padding: '10px',
            background: 'white',
            borderRadius: '10px'
          }}>
            💰 You earn 5 points for each person who guesses wrong or times out!
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '15px',
          margin: '20px 0'
        }}>
          {!revealAnswers ? (
            <div>
              <div style={{ fontSize: '1.2em', marginBottom: '10px', color: '#333' }}>
                Waiting for others to guess...
              </div>
              <div style={{ fontSize: '1em', color: '#667eea', fontWeight: 'bold' }}>
                {submittedCount} / {totalNeeded} players answered
              </div>
              <div style={{ marginTop: '15px' }}>
                {playersWhoNeedToSubmit.map(([pid, pdata]) => (
                  <div key={pid} style={{
                    display: 'inline-block',
                    margin: '5px',
                    padding: '5px 10px',
                    background: guessesSubmitted[pid] ? '#10b981' : '#e0e0e0',
                    color: guessesSubmitted[pid] ? 'white' : '#666',
                    borderRadius: '15px',
                    fontSize: '0.85em'
                  }}>
                    {guessesSubmitted[pid] && '✓ '}{pdata.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.1em', marginBottom: '15px', color: '#10b981', fontWeight: 'bold' }}>
                Here are all the answers:
              </div>
            </div>
          )}
        </div>

        {revealAnswers && (
          <div className="answers-grid">
            {shuffledAnswers.map(([writerId, answerData], index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={writerId === playerId ? 'correct' : ''}
                style={{
                  padding: '15px',
                  margin: '10px 0',
                  border: writerId === playerId ? '3px solid #10b981' : '3px solid #e0e0e0',
                  borderRadius: '15px',
                  background: writerId === playerId ? 'rgba(16, 185, 129, 0.1)' : 'white',
                  position: 'relative'
                }}
              >
                <div>{answerData.text}</div>
                {writerId === playerId && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    right: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    ✓ YOUR ANSWER
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}
                >
                  Written by: {players.find(([id]) => id === writerId)?.[1].name}
                  {writerId === playerId && ' ✅ (CORRECT)'}
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {revealAnswers && (
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
            Moving to next person in a moment...
          </div>
        )}

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
                background: i < currentRound ? '#667eea' : '#e0e0e0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Normal guessing view for others' questions
  return (
    <motion.div 
      className="guessing-phase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '15px',
        padding: '10px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        borderRadius: '15px'
      }}>
        <span style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)', color: '#667eea', fontWeight: 'bold' }}>
          Round {currentRound} of {totalRounds} • Person {currentSubjectIndex + 1} of {subjects.length}
        </span>
        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
          20 points for correct guess!
        </div>
      </div>

      <div className="category-card">
        <div className="category-text">{roomData.game.currentCategory}</div>
        <div style={{ margin: '15px 0' }}>Which answer did</div>
        <div className="subject-name">{currentSubject.name}</div>
        <div style={{ marginTop: '10px' }}>write about themselves?</div>
      </div>

      {/* Show waiting status if player has already guessed */}
      {hasGuessed && !revealAnswers && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '15px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '1.1em', marginBottom: '10px', color: '#10b981' }}>
            ✓ Answer submitted!
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Waiting for other players...
          </div>
          <div style={{ fontSize: '1em', color: '#667eea', fontWeight: 'bold', marginTop: '10px' }}>
            {submittedCount} / {totalNeeded} players answered
          </div>
        </div>
      )}

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
            onClick={() => !hasGuessed && !revealAnswers && setSelectedAnswer(writerId)}
            style={{
              padding: '15px',
              margin: '10px 0',
              border: '3px solid #e0e0e0',
              borderRadius: '15px',
              cursor: hasGuessed || revealAnswers ? 'default' : 'pointer',
              background: selectedAnswer === writerId ? 'rgba(102, 126, 234, 0.1)' : 'white',
              opacity: hasGuessed && !revealAnswers ? 0.6 : 1
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

      {!hasGuessed && !revealAnswers && (
        <>
          <Timer 
            key={`timer-guess-${currentSubject.id}-${currentSubjectIndex}-round${currentRound}`} 
            duration={30} 
            onComplete={handleTimeout} 
          />
          <Button onClick={handleGuess} variant="primary" disabled={!selectedAnswer}>
            Lock In Guess! 🔒
          </Button>
        </>
      )}

      {/* Show submission status */}
      {!revealAnswers && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
            Players answered: {submittedCount} / {totalNeeded}
          </div>
          <div>
            {playersWhoNeedToSubmit.map(([pid, pdata]) => (
              <div key={pid} style={{
                display: 'inline-block',
                margin: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: guessesSubmitted[pid] ? '#10b981' : '#e0e0e0'
              }} />
            ))}
          </div>
        </div>
      )}

      {revealAnswers && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>{currentSubjectIndex + 1 < subjects.length 
            ? 'Moving to next person...' 
            : currentRound < totalRounds
              ? 'Round complete! Showing scores...'
              : 'Game complete! Calculating final scores...'
          }</p>
        </div>
      )}

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
              background: i < currentRound ? '#667eea' : '#e0e0e0',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default GuessingPhase;