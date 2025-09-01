import React, { useState } from 'react';
import gameService from '../../firebase/gameService';
import Button from '../UI/Button';
import Input from '../UI/Input';

function JoinRoom({ isCreating, onJoinRoom, onBack }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!isCreating && !roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isCreating) {
        result = await gameService.createRoom(name);
        result.isHost = true;
      } else {
        result = await gameService.joinRoom(roomCode.toUpperCase(), name);
        result.isHost = false;
      }
      
      onJoinRoom(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="join-screen">
      <h2>{isCreating ? 'Create New Game' : 'Join Game'}</h2>
      
      <Input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
      />
      
      {!isCreating && (
        <Input
          placeholder="ROOM CODE"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="code-input"
        />
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Loading...' : (isCreating ? 'Create Room' : 'Join Room')}
        </Button>
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
      </div>
    </div>
  );
}

export default JoinRoom;