import React from 'react';
import { motion } from 'framer-motion';

function RoomCode({ code }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <motion.div 
      className="room-code-display"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
    >
      <div style={{ fontSize: '1.1em', marginBottom: '10px' }}>
        Share this code with your friends:
      </div>
      <div className="room-code-text" onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
        {code}
      </div>
      <div style={{ fontSize: '0.9em', marginTop: '10px', opacity: 0.8 }}>
        Tap to copy
      </div>
    </motion.div>
  );
}

export default RoomCode;