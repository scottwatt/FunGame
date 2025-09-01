import React from 'react';
import { motion } from 'framer-motion';

function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export default Button;