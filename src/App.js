import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gameService from './firebase/gameService';
import HomeScreen from './components/Game/HomeScreen';
import JoinRoom from './components/Game/JoinRoom';
import WaitingRoom from './components/Game/WaitingRoom';
import WritingPhase from './components/Game/WritingPhase';
import GuessingPhase from './components/Game/GuessingPhase';
import ScoreboardScreen from './components/Game/ScoreboardScreen';
import ResultsScreen from './components/Game/ResultsScreen';
import './styles/App.css';

function App() {
  const [gameState, setGameState] = useState({
    screen: 'home',
    roomCode: null,
    playerId: null,
    playerName: null,
    roomData: null,
    isHost: false
  });

  useEffect(() => {
    if (gameState.roomCode) {
      // Subscribe to room updates
      const unsubscribe = gameService.subscribeToRoom(
        gameState.roomCode,
        (roomData) => {
          setGameState(prev => ({ ...prev, roomData }));
          
          // Auto-navigate based on phase
          if (roomData.phase === 'writing') {
            // Check if current player has completed writing
            const playerComplete = roomData.game?.playersCompleted?.[gameState.playerId];
            const allComplete = roomData.game?.allWritingComplete;
            
            if (playerComplete || allComplete) {
              // Show waiting room for completed players or host notification
              setGameState(prev => ({ ...prev, screen: 'waiting' }));
            } else {
              // Continue writing
              setGameState(prev => ({ ...prev, screen: 'writing' }));
            }
          } else if (roomData.phase === 'guessing') {
            setGameState(prev => ({ ...prev, screen: 'guessing' }));
          } else if (roomData.phase === 'scoreboard') {
            setGameState(prev => ({ ...prev, screen: 'scoreboard' }));
          } else if (roomData.phase === 'results') {
            setGameState(prev => ({ ...prev, screen: 'results' }));
          } else if (roomData.phase === 'waiting') {
            setGameState(prev => ({ ...prev, screen: 'waiting' }));
          }
        }
      );

      return () => unsubscribe();
    }
  }, [gameState.roomCode, gameState.playerId]);

  const handlePlayAgain = async () => {
    if (gameState.isHost) {
      await gameService.resetGame(gameState.roomCode);
      // Don't auto-start, let host start when ready
      setGameState(prev => ({ ...prev, screen: 'waiting' }));
    }
  };

  const renderScreen = () => {
    const { roomData, isHost, playerId } = gameState;
    
    switch (gameState.screen) {
      case 'home':
        return <HomeScreen onNavigate={(screen) => 
          setGameState(prev => ({ ...prev, screen }))} />;
      
      case 'join':
      case 'create':
        return <JoinRoom 
          isCreating={gameState.screen === 'create'}
          onJoinRoom={(data) => setGameState(prev => ({ 
            ...prev, 
            ...data, 
            screen: 'waiting' 
          }))}
          onBack={() => setGameState(prev => ({ ...prev, screen: 'home' }))}
        />;
      
      case 'waiting':
        // Handle different waiting states
        if (roomData?.phase === 'writing') {
          const playerComplete = roomData.game?.playersCompleted?.[playerId];
          const allComplete = roomData.game?.allWritingComplete;
          
          if (playerComplete || allComplete || isHost) {
            // Show waiting room with completion status
            return <WaitingRoom 
              gameState={gameState}
              onStartGame={() => gameService.startGame(gameState.roomCode)}
            />;
          } else {
            // Should be writing
            return <WritingPhase gameState={gameState} />;
          }
        }
        // Normal waiting room
        return <WaitingRoom 
          gameState={gameState}
          onStartGame={() => gameService.startGame(gameState.roomCode)}
        />;
      
      case 'writing':
        // Check if player has already completed
        if (roomData?.game?.playersCompleted?.[playerId]) {
          return <WaitingRoom 
            gameState={gameState}
            onStartGame={() => gameService.startGame(gameState.roomCode)}
          />;
        }
        return <WritingPhase gameState={gameState} />;
      
      case 'guessing':
        return <GuessingPhase gameState={gameState} />;
      
      case 'scoreboard':
        return <ScoreboardScreen gameState={gameState} />;
      
      case 'results':
        return <ResultsScreen 
          gameState={gameState}
          onPlayAgain={handlePlayAgain}
          onExit={() => setGameState({
            screen: 'home',
            roomCode: null,
            playerId: null,
            playerName: null,
            roomData: null,
            isHost: false
          })}
        />;
      
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app">
      <div className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${gameState.screen}-${gameState.roomData?.phase}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;