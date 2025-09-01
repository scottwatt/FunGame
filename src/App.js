import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gameService from './firebase/gameService';
import HomeScreen from './components/Game/HomeScreen';
import JoinRoom from './components/Game/JoinRoom';
import WaitingRoom from './components/Game/WaitingRoom';
import WritingPhase from './components/Game/WritingPhase';
import GuessingPhase from './components/Game/GuessingPhase';
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
            setGameState(prev => ({ ...prev, screen: 'writing' }));
          } else if (roomData.phase === 'guessing') {
            setGameState(prev => ({ ...prev, screen: 'guessing' }));
          } else if (roomData.phase === 'results') {
            setGameState(prev => ({ ...prev, screen: 'results' }));
          }
        }
      );

      return () => unsubscribe();
    }
  }, [gameState.roomCode]);

  const renderScreen = () => {
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
        return <WaitingRoom 
          gameState={gameState}
          onStartGame={() => gameService.startGame(gameState.roomCode)}
        />;
      
      case 'writing':
        return <WritingPhase gameState={gameState} />;
      
      case 'guessing':
        return <GuessingPhase gameState={gameState} />;
      
      case 'results':
        return <ResultsScreen 
          gameState={gameState}
          onPlayAgain={() => gameService.startGame(gameState.roomCode)}
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
            key={gameState.screen}
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