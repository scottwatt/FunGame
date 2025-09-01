import { database } from './config';
import { 
  ref, 
  set, 
  get, 
  onValue, 
  push, 
  remove, 
  serverTimestamp,
  onDisconnect 
} from 'firebase/database';

export const categories = [
  "If they were a movie, they'd be:",
  "If they were a superhero, their power would be:",
  "Their spirit animal is:",
  "If they were a food, they'd be:",
  "Their theme song would be:",
  "If they wrote a book, it would be titled:",
  "Their secret talent is probably:",
  "In a zombie apocalypse, they would:",
  "If they were a weather pattern, they'd be:",
  "Their ideal vacation is:",
  "If they were a meme, they'd be:",
  "Their catchphrase should be:",
  "If they had a warning label, it would say:",
  "They're secretly plotting to:",
  "Their autobiography would be called:"
];

class GameService {
  // Generate random 6-character room code
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Create a new room
  async createRoom(playerName) {
    const roomCode = this.generateRoomCode();
    const playerId = push(ref(database)).key;
    
    const roomData = {
      code: roomCode,
      host: playerId,
      createdAt: serverTimestamp(),
      phase: 'waiting',
      players: {
        [playerId]: {
          name: playerName,
          score: 0,
          isHost: true,
          joinedAt: serverTimestamp()
        }
      },
      settings: {
        maxPlayers: 10,
        timePerRound: 30
      }
    };

    try {
      await set(ref(database, `rooms/${roomCode}`), roomData);
      
      // Set up disconnect handler
      const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
      onDisconnect(playerRef).remove();
      
      return { roomCode, playerId, playerName };
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  // Join existing room
  async joinRoom(roomCode, playerName) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const roomSnapshot = await get(roomRef);
    
    if (!roomSnapshot.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomSnapshot.val();
    const playerCount = Object.keys(roomData.players || {}).length;
    
    if (playerCount >= roomData.settings.maxPlayers) {
      throw new Error('Room is full');
    }
    
    if (roomData.phase !== 'waiting') {
      throw new Error('Game already in progress');
    }
    
    const playerId = push(ref(database)).key;
    const playerData = {
      name: playerName,
      score: 0,
      isHost: false,
      joinedAt: serverTimestamp()
    };
    
    await set(ref(database, `rooms/${roomCode}/players/${playerId}`), playerData);
    
    // Set up disconnect handler
    const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
    onDisconnect(playerRef).remove();
    
    return { roomCode, playerId, playerName };
  }

  // Start the game
  async startGame(roomCode) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const players = Object.keys(snapshot.val().players);
    
    const gameData = {
      phase: 'writing',
      currentCategory: category,
      currentRound: 0,
      currentSubjectIndex: 0,
      answers: {},
      startedAt: serverTimestamp()
    };
    
    // Initialize answer structure
    players.forEach(playerId => {
      gameData.answers[playerId] = {};
    });
    
    await set(ref(database, `rooms/${roomCode}/game`), gameData);
    await set(ref(database, `rooms/${roomCode}/phase`), 'writing');
  }

  // Submit an answer
  async submitAnswer(roomCode, writerId, subjectId, answer) {
    const answerRef = ref(database, `rooms/${roomCode}/game/answers/${subjectId}/${writerId}`);
    await set(answerRef, {
      text: answer,
      submittedAt: serverTimestamp()
    });
    
    // Check if all answers are submitted
    await this.checkAllAnswersSubmitted(roomCode);
  }

  // Check if all answers are submitted
  async checkAllAnswersSubmitted(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    const players = Object.keys(roomData.players);
    const answers = roomData.game?.answers || {};
    
    let totalExpected = players.length * players.length;
    let totalSubmitted = 0;
    
    Object.values(answers).forEach(subjectAnswers => {
      totalSubmitted += Object.keys(subjectAnswers).length;
    });
    
    if (totalSubmitted >= totalExpected) {
      // Move to guessing phase
      await set(ref(database, `rooms/${roomCode}/phase`), 'guessing');
      await set(ref(database, `rooms/${roomCode}/game/currentSubjectIndex`), 0);
    }
  }

  // Submit a guess
  async submitGuess(roomCode, playerId, subjectId, guessedWriterId) {
    const guessRef = ref(database, `rooms/${roomCode}/game/guesses/${subjectId}/${playerId}`);
    await set(guessRef, {
      guessedWriter: guessedWriterId,
      submittedAt: serverTimestamp()
    });
    
    // Update score if correct
    if (guessedWriterId === subjectId) {
      const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}/score`);
      const snapshot = await get(playerRef);
      const currentScore = snapshot.val() || 0;
      await set(playerRef, currentScore + 10);
    } else {
      // Give points to the subject for fooling someone
      const subjectRef = ref(database, `rooms/${roomCode}/players/${subjectId}/score`);
      const snapshot = await get(subjectRef);
      const currentScore = snapshot.val() || 0;
      await set(subjectRef, currentScore + 5);
    }
  }

  // Move to next round
  async nextRound(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    const players = Object.keys(roomData.players);
    const currentIndex = roomData.game.currentSubjectIndex;
    
    if (currentIndex + 1 < players.length) {
      // Next subject
      await set(ref(database, `rooms/${roomCode}/game/currentSubjectIndex`), currentIndex + 1);
    } else {
      // Game over - show final results
      await set(ref(database, `rooms/${roomCode}/phase`), 'results');
    }
  }

  // Listen to room updates
  subscribeToRoom(roomCode, callback) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    return onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }

  // Clean up room
  async deleteRoom(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    await remove(roomRef);
  }

  // Leave room
  async leaveRoom(roomCode, playerId) {
    const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
    await remove(playerRef);
  }
}

export default new GameService();