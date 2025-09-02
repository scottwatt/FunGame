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
  // Original categories
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
  "Their autobiography would be called:",
  
  // New categories
  "If they were a Disney character, they'd be:",
  "Their dating profile headline would be:",
  "If they were a drink, they'd be:",
  "Their superhero weakness would be:",
  "If they ran for president, their slogan would be:",
  "Their biggest fear is probably:",
  "If they were a TV show, they'd be:",
  "Their dream job would be:",
  "If they were a social media app, they'd be:",
  "Their most likely to award would be:",
  "If they were a holiday, they'd be:",
  "Their karaoke song would be:",
  "If they were a conspiracy theory, they'd be:",
  "Their worst nightmare would be:",
  "If they were a video game, they'd be:",
  "Their hidden talent is:",
  "If they were a historical figure, they'd be:",
  "Their life motto is:",
  "If they were a kitchen appliance, they'd be:",
  "Their celebrity doppelganger is:",
  "If they were a pizza topping, they'd be:",
  "Their reality show would be called:",
  "If they were a genre of music, they'd be:",
  "Their supervillain name would be:",
  "If they were a car, they'd be:"
];

class GameService {
  // Generate random 6-character room code
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get 4 random unique categories
  getRandomCategories() {
    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
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
        totalRounds: 4
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

  // Start the writing phase with all 4 categories
  async startGame(roomCode) {
    const selectedCategories = this.getRandomCategories();
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const players = Object.keys(snapshot.val().players);
    
    const gameData = {
      phase: 'writing',
      categories: selectedCategories,
      currentRound: 0, // Will be set to 1 when guessing starts
      totalRounds: 4,
      currentSubjectIndex: 0,
      allAnswers: {}, // Store all answers from all rounds
      playersCompleted: {}, // Track which players have finished writing
      startedAt: serverTimestamp()
    };
    
    // Initialize answer structure for all rounds
    for (let round = 1; round <= 4; round++) {
      gameData.allAnswers[`round${round}`] = {};
      players.forEach(playerId => {
        gameData.allAnswers[`round${round}`][playerId] = {};
      });
    }
    
    // Initialize player completion tracking
    players.forEach(playerId => {
      gameData.playersCompleted[playerId] = false;
    });
    
    await set(ref(database, `rooms/${roomCode}/game`), gameData);
    await set(ref(database, `rooms/${roomCode}/phase`), 'writing');
  }

  // Submit an answer for a specific round
  async submitAnswerForRound(roomCode, writerId, subjectId, answer, roundNumber) {
    const answerRef = ref(database, `rooms/${roomCode}/game/allAnswers/round${roundNumber}/${subjectId}/${writerId}`);
    await set(answerRef, {
      text: answer,
      submittedAt: serverTimestamp()
    });
  }

  // Mark a player as having completed all writing
  async markPlayerWritingComplete(roomCode, playerId) {
    const completeRef = ref(database, `rooms/${roomCode}/game/playersCompleted/${playerId}`);
    await set(completeRef, true);
    
    // Check if all players are done
    await this.checkAllPlayersComplete(roomCode);
  }

  // Check if all players have finished writing
  async checkAllPlayersComplete(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    const playersCompleted = roomData.game?.playersCompleted || {};
    const allComplete = Object.values(playersCompleted).every(completed => completed === true);
    
    if (allComplete) {
      // All players done - notify host to start guessing phase
      await set(ref(database, `rooms/${roomCode}/game/allWritingComplete`), true);
    }
  }

  // Start the guessing phase (called by host after all writing is complete)
  async startGuessingPhase(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    // Set up for first round of guessing
    const firstRoundAnswers = roomData.game.allAnswers.round1;
    
    await set(ref(database, `rooms/${roomCode}/game/currentRound`), 1);
    await set(ref(database, `rooms/${roomCode}/game/currentCategory`), roomData.game.categories[0]);
    await set(ref(database, `rooms/${roomCode}/game/answers`), firstRoundAnswers);
    await set(ref(database, `rooms/${roomCode}/game/currentSubjectIndex`), 0);
    await set(ref(database, `rooms/${roomCode}/phase`), 'guessing');
  }

  // Submit a guess
  async submitGuess(roomCode, playerId, subjectId, guessedWriterId) {
    const guessRef = ref(database, `rooms/${roomCode}/game/guesses/${subjectId}/${playerId}`);
    await set(guessRef, {
      guessedWriter: guessedWriterId,
      submittedAt: serverTimestamp()
    });
    
    // Update score if correct - 20 points for correct guess
    if (guessedWriterId === subjectId) {
      const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}/score`);
      const snapshot = await get(playerRef);
      const currentScore = snapshot.val() || 0;
      await set(playerRef, currentScore + 20);
    } else {
      // Give 5 points to the subject for fooling someone
      const subjectRef = ref(database, `rooms/${roomCode}/players/${subjectId}/score`);
      const snapshot = await get(subjectRef);
      const currentScore = snapshot.val() || 0;
      await set(subjectRef, currentScore + 5);
    }
  }

  // Move to next round or subject
  async nextRound(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    const players = Object.keys(roomData.players);
    const currentIndex = roomData.game.currentSubjectIndex;
    
    if (currentIndex + 1 < players.length) {
      // Next subject in current round
      await set(ref(database, `rooms/${roomCode}/game/currentSubjectIndex`), currentIndex + 1);
    } else {
      // Round complete - check if more rounds remain
      const currentRound = roomData.game.currentRound;
      
      if (currentRound < roomData.game.totalRounds) {
        // Show scoreboard between rounds
        await set(ref(database, `rooms/${roomCode}/phase`), 'scoreboard');
        
        // After scoreboard, automatically move to next round
        setTimeout(async () => {
          const nextRound = currentRound + 1;
          const nextCategory = roomData.game.categories[nextRound - 1];
          const nextRoundAnswers = roomData.game.allAnswers[`round${nextRound}`];
          
          await set(ref(database, `rooms/${roomCode}/game/currentRound`), nextRound);
          await set(ref(database, `rooms/${roomCode}/game/currentCategory`), nextCategory);
          await set(ref(database, `rooms/${roomCode}/game/currentSubjectIndex`), 0);
          await set(ref(database, `rooms/${roomCode}/game/answers`), nextRoundAnswers);
          await set(ref(database, `rooms/${roomCode}/game/guesses`), {});
          await set(ref(database, `rooms/${roomCode}/phase`), 'guessing');
        }, 10000); // 10 second scoreboard display
      } else {
        // Game over - show final results
        await set(ref(database, `rooms/${roomCode}/phase`), 'results');
      }
    }
  }

  // Reset game for replay
  async resetGame(roomCode) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    const roomData = snapshot.val();
    
    // Reset all player scores
    const players = roomData.players;
    for (let playerId in players) {
      await set(ref(database, `rooms/${roomCode}/players/${playerId}/score`), 0);
    }
    
    // Clear game data and return to waiting
    await remove(ref(database, `rooms/${roomCode}/game`));
    await set(ref(database, `rooms/${roomCode}/phase`), 'waiting');
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