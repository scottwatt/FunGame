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
      </div>
    </div>
  );
}

export default HomeScreen;