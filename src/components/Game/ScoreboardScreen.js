import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function ScoreboardScreen({ gameState }) {
  const { roomData } = gameState;
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!roomData) return <div>Loading...</div>;
  
  const players = Object.entries(roomData.players || {});
  const sortedPlayers = players
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  
  const currentRound = roomData.game?.currentRound || 1;
  const totalRounds = roomData.game?.totalRounds || 4;
  const nextCategory = roomData.game?.categories?.[currentRound] || '';
  
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
      className="scoreboard-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#667eea' }}>
          Round {currentRound} Complete!
        </h1>
        <div style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#666', marginTop: '10px' }}>
          {currentRound < totalRounds ? (
            <>Next round starts in: <strong style={{ color: '#667eea' }}>{countdown}s</strong></>
          ) : (
            'Calculating final scores...'
          )}
        </div>
      </div>

      <div className="scoreboard">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          Current Standings
        </h2>
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
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em' }}>{getEmoji(index)}</span>
              <span style={{ fontWeight: '600', fontSize: '1.1em' }}>{player.name}</span>
            </div>
            <div style={{ 
              fontSize: '1.3em', 
              fontWeight: 'bold', 
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {player.score || 0} pts
            </div>
          </motion.div>
        ))}
      </div>

      {currentRound < totalRounds && (
        <motion.div 
          className="next-round-preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '20px',
            borderRadius: '20px',
            marginTop: '30px',
            textAlign: 'center',
            boxShadow: '0 5px 20px rgba(102, 126, 234, 0.3)'
          }}
        >
          <div style={{ fontSize: '0.9em', opacity: 0.9, marginBottom: '8px' }}>
            Round {currentRound + 1} Category:
          </div>
          <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 'bold' }}>
            "{nextCategory}"
          </div>
        </motion.div>
      )}

      <div style={{ 
        textAlign: 'center', 
        fontSize: '0.85em', 
        color: '#666', 
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(102, 126, 234, 0.05)',
        borderRadius: '10px'
      }}>
        💡 <strong>Scoring:</strong> 20 pts for correct guesses • 5 pts when someone picks your wrong answer
      </div>

      <div className="progress-indicator" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '20px'
        }}>
          {[...Array(totalRounds)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i < currentRound ? '#667eea' : '#e0e0e0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ScoreboardScreen;