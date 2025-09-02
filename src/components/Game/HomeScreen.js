import React from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';

function HomeScreen({ onNavigate }) {
  return (
    <div className="home-screen">
      <motion.h1 
        className="game-title"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        ITG Game
      </motion.h1>
      <p className="subtitle">The Perception Party Game!</p>
      
      <div className="button-group">
        <Button 
          onClick={() => onNavigate('create')}
          variant="primary"
        >
          Create New Game 🎮
        </Button>
        <Button 
          onClick={() => onNavigate('join')}
          variant="secondary"
        >
          Join Game 🔗
        </Button>
      </div>
      
      <div className="features">
        <p>✨ 100% Free • No Sign-up • Instant Play</p>
        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#667eea' }}>
          🎯 4 Rounds • 40+ Categories • No Time Pressure Writing
        </p>
      </div>

      <motion.div 
        className="how-to-play"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(102, 126, 234, 0.05)',
          padding: '20px',
          borderRadius: '15px',
          marginTop: '30px',
          textAlign: 'center'
        }}
      >
        <h3 style={{ marginBottom: '15px', color: '#333' }}>How to Play</h3>
        <div style={{ textAlign: 'left', fontSize: '0.9em', color: '#666', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}>
            📝 <strong>Phase 1 - Write:</strong> Take your time to write creative answers for all 4 rounds upfront
          </div>
          <div style={{ marginBottom: '8px' }}>
            ⏸️ <strong>Wait:</strong> Once everyone's done writing, the host starts the guessing phase
          </div>
          <div style={{ marginBottom: '8px' }}>
            🤔 <strong>Phase 2 - Guess:</strong> 30 seconds to guess who wrote what (skip your own)
          </div>
          <div style={{ marginBottom: '8px' }}>
            📊 <strong>Scoreboards:</strong> See standings between each round
          </div>
          <div>
            🏆 <strong>Win:</strong> 20 pts for correct guesses, 5 pts for each person you fool!
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))',
          borderRadius: '15px'
        }}
      >
        <div style={{ fontSize: '0.85em', color: '#10b981', fontWeight: 'bold' }}>
          💡No time limit during writing phase!
        </div>
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
          Be as creative as you want with your answers
        </div>
      </motion.div>
    </div>
  );
}

export default HomeScreen;