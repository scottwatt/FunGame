import React from 'react';
import { motion } from 'framer-motion';

function PlayerList({ players }) {
  return (
    <div className="player-list">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`player-item ${player.isYou ? 'player-you' : ''}`}
        >
          <span>
            {player.isHost && '👑 '}
            {player.name}
            {player.isYou && ' (You)'}
          </span>
          <span style={{ fontSize: '0.9em', color: '#888' }}>
            {player.score > 0 && `${player.score} pts`}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default PlayerList;
