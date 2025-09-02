import React from 'react';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import RoomCode from '../UI/RoomCode';
import PlayerList from '../UI/PlayerList';
import { motion } from 'framer-motion';

function WaitingRoom({ gameState, onStartGame }) {
  const { roomCode, roomData, isHost, playerId } = gameState;
  
  if (!roomData) return <div>Loading...</div>;
  
  const players = Object.entries(roomData.players || {}).map(([id, data]) => ({
    id,
    ...data,
    isYou: id === playerId
  }));
  
  const canStart = isHost && players.length >= 3;
  const allWritingComplete = roomData.game?.allWritingComplete;
  
  // If we're in the writing phase and all writing is complete
  if (roomData.phase === 'writing' && allWritingComplete && isHost) {
    return (
      <motion.div 
        className="waiting-room"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '30px',
          borderRadius: '20px',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            style={{ fontSize: '4em', marginBottom: '20px' }}
          >
            ✅
          </motion.div>
          <h2 style={{ marginBottom: '15px' }}>All Players Ready!</h2>
          <p style={{ fontSize: '1.1em', opacity: 0.95 }}>
            Everyone has submitted their answers for all 4 rounds.
          </p>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Ready to Start Guessing!</h3>
          <div style={{ color: '#666', lineHeight: '1.6' }}>
            <p>📝 All answers have been collected</p>
            <p>🎯 4 rounds of guessing await</p>
            <p>⏱️ 30 seconds per guess (waits for all players)</p>
            <p>🎖️ 20 points for correct guesses</p>
            <p>🎭 5 points when others guess wrong on your question</p>
            <p>⏭️ You'll skip your own questions</p>
          </div>
        </div>

        <Button 
          onClick={() => gameService.startGuessingPhase(roomCode)} 
          variant="primary"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            fontSize: '1.2em',
            padding: '20px'
          }}
        >
          Start Guessing Phase! 🎮
        </Button>
      </motion.div>
    );
  }

  // Normal waiting room before game starts
  if (roomData.phase === 'waiting') {
    return (
      <div className="waiting-room">
        <RoomCode code={roomCode} />
        
        <div className="players-section">
          <h3>Players ({players.length}/10)</h3>
          <PlayerList players={players} />
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
          padding: '15px',
          borderRadius: '15px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1em', marginBottom: '5px', color: '#333' }}>
            Game Format
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            📝 Write all answers first • 🎯 4 Rounds of guessing • 🏆 20/5 pt scoring
          </div>
        </div>
        
        {isHost ? (
          <>
            <Button
              onClick={onStartGame}
              disabled={!canStart}
              variant="primary"
            >
              {canStart 
                ? `Start Game with ${players.length} Players 🚀` 
                : `Waiting for Players (Need ${3 - players.length} more)`
              }
            </Button>
            {!canStart && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '15px', 
                fontSize: '0.9em', 
                color: '#888' 
              }}>
                Minimum 3 players required • Maximum 10 players
              </div>
            )}
          </>
        ) : (
          <div className="waiting-message">
            Waiting for host to start the game...
            <div style={{ fontSize: '0.9em', marginTop: '10px', opacity: 0.8 }}>
              Get ready for 4 rounds of fun! 🎉
            </div>
          </div>
        )}
      </div>
    );
  }

  // During writing phase, show who's completed
  if (roomData.phase === 'writing' && !allWritingComplete) {
    const playersCompleted = roomData.game?.playersCompleted || {};
    const completedCount = Object.values(playersCompleted).filter(Boolean).length;
    
    return (
      <div className="waiting-room">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
          Writing Phase In Progress
        </h2>
        
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '1.2em', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            textAlign: 'center',
            color: '#333'
          }}>
            Players Completed: {completedCount} / {players.length}
          </div>
          
          <div className="player-list">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="player-item"
                style={{
                  background: playersCompleted[player.id] 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
                    : 'white',
                  border: playersCompleted[player.id] 
                    ? '2px solid #10b981'
                    : '2px solid #e0e0e0'
                }}
              >
                <span>
                  {playersCompleted[player.id] && '✅ '}
                  {player.isHost && '👑 '}
                  {player.name}
                  {player.isYou && ' (You)'}
                </span>
                <span style={{ fontSize: '0.9em', color: playersCompleted[player.id] ? '#10b981' : '#888' }}>
                  {playersCompleted[player.id] ? 'Complete' : 'Writing...'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
          borderRadius: '15px'
        }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Players are writing answers for all 4 rounds
          </p>
          <p style={{ fontSize: '0.9em', color: '#888' }}>
            No time limit - be creative! 💭
          </p>
        </div>

        {isHost && allWritingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '20px' }}
          >
            <Button 
              onClick={() => gameService.startGuessingPhase(roomCode)} 
              variant="primary"
            >
              Everyone's Done! Start Guessing Phase 🎮
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Default return for other states
  return <div>Loading...</div>;
}

export default WaitingRoom;