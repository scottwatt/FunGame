import React from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';

function ResultsScreen({ gameState, onPlayAgain, onExit }) {
  const { roomData, isHost } = gameState;
  
  if (!roomData) return <div>Loading...</div>;
  
  const players = Object.entries(roomData.players || {});
  const sortedPlayers = players
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const totalRounds = roomData.game?.totalRounds || 4;
  const categories = roomData.game?.categories || [];

  const getEmoji = (index) => {
    switch(index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎯';
    }
  };

  const getTrophy = (index) => {
    if (index === 0) return '👑 CHAMPION 👑';
    if (index === 1) return 'Runner Up';
    if (index === 2) return 'Third Place';
    return `${index + 1}th Place`;
  };

  return (
    <motion.div 
      className="results-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.h1 
        style={{ textAlign: 'center', marginBottom: '30px' }}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        🎉 Final Results! 🎉
      </motion.h1>

      {/* Winner Spotlight */}
      {sortedPlayers[0] && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            padding: '20px',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)'
          }}
        >
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>🏆</div>
          <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>
            {sortedPlayers[0].name}
          </div>
          <div style={{ fontSize: '1.2em', color: '#666', marginTop: '5px' }}>
            {sortedPlayers[0].score} points
          </div>
        </motion.div>
      )}

      <div className="scoreboard">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Final Standings</h2>
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="score-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              margin: '10px 0',
              background: index === 0 
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1))' 
                : index === 1
                  ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(169, 169, 169, 0.1))'
                  : index === 2
                    ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(184, 115, 51, 0.1))'
                    : 'white',
              border: index === 0 
                ? '3px solid gold' 
                : index === 1
                  ? '3px solid silver'
                  : index === 2
                    ? '3px solid #cd7f32'
                    : '2px solid #e0e0e0',
              borderRadius: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em' }}>{getEmoji(index)}</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '1.1em' }}>{player.name}</div>
                <div style={{ fontSize: '0.8em', color: '#888', marginTop: '2px' }}>
                  {getTrophy(index)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#667eea' }}>
              {player.score || 0} pts
            </div>
          </motion.div>
        ))}
      </div>

      {/* Game Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginTop: '30px'
        }}
      >
        <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>
          Game Summary
        </h3>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>{totalRounds}</strong> rounds completed
          </div>
          <div style={{ fontSize: '0.9em', marginBottom: '10px' }}>
            <strong>Scoring:</strong> 20 pts for correct guesses • 5 pts per person fooled
          </div>
          <div style={{ fontSize: '0.9em', fontStyle: 'italic' }}>
            Categories played:
          </div>
          <div style={{ marginTop: '10px' }}>
            {categories.slice(0, totalRounds).map((cat, index) => (
              <div key={index} style={{ 
                fontSize: '0.85em', 
                padding: '5px',
                margin: '5px 0',
                background: 'white',
                borderRadius: '10px'
              }}>
                Round {index + 1}: "{cat}"
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="button-group" style={{ marginTop: '30px' }}>
        {isHost ? (
          <Button onClick={onPlayAgain} variant="primary">
            Play Again! 🔄
          </Button>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginBottom: '15px' }}>
            Waiting for host to start new game...
          </div>
        )}
        <Button onClick={onExit} variant="secondary">
          Exit to Home
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '0.9em' }}>
        Thanks for playing! 🎭
      </div>
    </motion.div>
  );
}

export default ResultsScreen;