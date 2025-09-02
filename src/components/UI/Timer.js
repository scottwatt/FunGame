import React, { useEffect, useState } from 'react';

function Timer({ duration = 30, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const percentage = (timeLeft / duration) * 100;

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="timer-container">
      <div className="timer-bar">
        <div 
          className="timer-fill" 
          style={{ 
            width: `${percentage}%`,
            background: timeLeft <= 10 ? 'linear-gradient(90deg, #ff4458, #ffa751)' : 'linear-gradient(90deg, #667eea, #764ba2)'
          }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold' }}>
        {timeLeft}s
      </div>
    </div>
  );
}

export default Timer;