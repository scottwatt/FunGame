import React from 'react';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import RoomCode from '../UI/RoomCode';
import PlayerList from '../UI/PlayerList';

function WaitingRoom({ gameState, onStartGame }) {
  const { roomCode, roomData, isHost, playerId } = gameState;
  
  if (!roomData) return <div>Loading...</div>;
  
  const players = Object.entries(roomData.players || {}).map(([id, data]) => ({
    id,
    ...data,
    isYou: id === playerId
  }));
  
  const canStart = isHost && players.length >= 3;

  return (
    <div className="waiting-room">
      <RoomCode code={roomCode} />
      
      <div className="players-section">
        <h3>Players ({players.length}/10)</h3>
        <PlayerList players={players} />
      </div>
      
      {isHost ? (
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
      ) : (
        <div className="waiting-message">
          Waiting for host to start the game...
        </div>
      )}
    </div>
  );
}

export default WaitingRoom;