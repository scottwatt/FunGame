
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

  const getEmoji = (index) => {
    switch(index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎯';
    }
  };

  return (
    <motion.div 
      className="results-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎉 Game Over! 🎉
      </h1>

      <div className="scoreboard">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Final Scores</h2>
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="score-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              margin: '10px 0',
              background: index === 0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1))' : 'white',
              border: index === 0 ? '3px solid gold' : '2px solid #e0e0e0',
              borderRadius: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em' }}>{getEmoji(index)}</span>
              <span style={{ fontWeight: '600', fontSize: '1.1em' }}>{player.name}</span>
            </div>
            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#667eea' }}>
              {player.score || 0} pts
            </div>
          </motion.div>
        ))}
      </div>

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