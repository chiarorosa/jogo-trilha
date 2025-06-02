
import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import PlayerInfo from './components/PlayerInfo';
import GameStatus from './components/GameStatus';
import InstructionsModal from './components/InstructionsModal';
import { useTrilhaGame } from './hooks/useTrilhaGame';
import { PT_BR_MESSAGES, PLAYER_NAMES, AI_PLAYER_NAME, INSTRUCTIONS_TITLE } from './constants';
import { GameMode, Player, GamePhase } from './types';

// SVG Icons
const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className || ''}`}>
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 8.75A.75.75 0 012.75 8h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 8.75zM2 12.75a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM11.72 15.22a.75.75 0 011.06 0l3 3a.75.75 0 11-1.06 1.06l-2.47-2.47V18.5a.75.75 0 01-1.5 0v-1.69l-2.47 2.47a.75.75 0 11-1.06-1.06l3-3z" clipRule="evenodd" />
     <path d="M2.25 3h15.5A2.25 2.25 0 0120 5.25v10.5A2.25 2.25 0 0117.75 18H2.25A2.25 2.25 0 010 15.75V5.25A2.25 2.25 0 012.25 3zm0 1.5v10.5a.75.75 0 00.75.75h14.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75z" />
  </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className || ''}`}>
    <path fillRule="evenodd" d="M15.323 4.677a.75.75 0 00-1.06-1.06l-2.5 2.5a.75.75 0 000 1.06l2.5 2.5a.75.75 0 101.06-1.06L13.31 6.5l2.012-2.013zM4.677 15.323a.75.75 0 001.06 1.06l2.5-2.5a.75.75 0 000-1.06l-2.5-2.5a.75.75 0 10-1.06 1.06L6.69 13.5l-2.013 2.013zM10 2.5a.75.75 0 00-1.06-.024l-2.254 2.061A7.497 7.497 0 002.5 10a7.5 7.5 0 007.5 7.5c2.071 0 3.99-.84 5.385-2.226a.75.75 0 00-1.024-1.102A5.998 5.998 0 0110 16a6 6 0 115.726-4.555.75.75 0 00.507-1.012A7.499 7.499 0 0010 2.5z" clipRule="evenodd" />
  </svg>
);

const StartScreen: React.FC<{ onSelectMode: (mode: GameMode) => void }> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-bold text-primary">
          Jogo da Trilha
        </h1>
        <p className="text-text-dark opacity-80 mt-3 text-lg">{PT_BR_MESSAGES.chooseMode}</p>
      </div>
      <div className="bg-board-bg-color p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md flex flex-col gap-5">
        <button
          onClick={() => onSelectMode(GameMode.PVP)}
          className="w-full px-6 py-3.5 bg-primary text-text-light font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-all duration-150 ease-in-out transform hover:scale-105 text-md sm:text-lg"
        >
          {PT_BR_MESSAGES.playerVsPlayer}
        </button>
        <button
          onClick={() => onSelectMode(GameMode.PVA)}
          className="w-full px-6 py-3.5 bg-primary-light text-text-light font-semibold rounded-lg shadow-md hover:bg-primary transition-all duration-150 ease-in-out transform hover:scale-105 text-md sm:text-lg"
        >
          {PT_BR_MESSAGES.playerVsAI}
        </button>
      </div>
       <footer className="mt-12 text-center text-text-dark opacity-70 text-sm">
        <p>&copy; {new Date().getFullYear()} Jogo da Trilha. Divirta-se!</p>
      </footer>
    </div>
  );
};

const GameScreen: React.FC<{ 
    gameMode: GameMode; 
    onReturnToMenu: () => void;
}> = ({ gameMode, onReturnToMenu }) => {
  const { gameState, handlePieceClick, restartGame, aiTurnInProgress } = useTrilhaGame(gameMode);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  
  const effectivePlayerName = (player: Player) => {
    if (gameState.gameMode === GameMode.PVA && player === Player.PLAYER_2) {
        return AI_PLAYER_NAME;
    }
    return PLAYER_NAMES[player];
  };
  
  let displayMessage = gameState.message;
   if (gameState.message === PT_BR_MESSAGES.aiThinking && gameState.currentPlayer === Player.PLAYER_2 && gameState.gameMode === GameMode.PVA) {
     displayMessage = PT_BR_MESSAGES.aiThinking;
   } else if (gameState.phase !== GamePhase.GAME_OVER && gameState.phase !== GamePhase.REMOVE_PIECE) {
      displayMessage = `${PT_BR_MESSAGES.turn(effectivePlayerName(gameState.currentPlayer))} ${
        gameState.phase === GamePhase.PLACING ? PT_BR_MESSAGES.placePiece : 
        (gameState.phase === GamePhase.FLYING ? PT_BR_MESSAGES.flyPhase : PT_BR_MESSAGES.movePiece)
      }`;
      if (gameState.selectedPieceIndex !== null && (gameState.phase === GamePhase.MOVING || gameState.phase === GamePhase.FLYING)) {
        displayMessage = `${PT_BR_MESSAGES.turn(effectivePlayerName(gameState.currentPlayer))} ${PT_BR_MESSAGES.selectDestination}`;
      }
   } else if (gameState.phase === GamePhase.REMOVE_PIECE) {
     displayMessage = PT_BR_MESSAGES.selectPieceToRemove(effectivePlayerName(gameState.currentPlayer));
   } else if (gameState.winner) {
     displayMessage = `${PT_BR_MESSAGES.playerWins(effectivePlayerName(gameState.winner))} ${PT_BR_MESSAGES.gameOver}`;
   }

  const isErrorMessage = displayMessage.toLowerCase().includes("inválido") || 
                         displayMessage.toLowerCase().includes("não pode");

  const disableBoardClicks = (gameState.gameMode === GameMode.PVA && gameState.currentPlayer === Player.PLAYER_2 && aiTurnInProgress) || gameState.winner !== null;

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-stretch justify-between p-0 font-sans">
      {/* Header */}
      <header className="bg-primary text-text-light p-3 sm:p-4 shadow-lg w-full sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center max-w-5xl">
          <h1 className="text-xl sm:text-2xl font-bold">Jogo da Trilha</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-light text-text-light font-medium rounded-lg shadow hover:bg-primary-dark transition-colors text-xs sm:text-sm"
              aria-label="Regras do Jogo"
            >
              <BookIcon className="w-4 h-4 sm:w-5 sm:h-5"/> Regras
            </button>
            <button
              onClick={restartGame}
              className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-light text-text-light font-medium rounded-lg shadow hover:bg-primary-dark transition-colors text-xs sm:text-sm"
              aria-label="Reiniciar Jogo"
            >
              <RefreshIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Reiniciar
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center py-4 sm:py-6 px-2 sm:px-4 w-full max-w-5xl mt-2 mb-16"> {/* Added margin-top for header and margin-bottom for footer */}
        <div className="w-full max-w-md mb-4 sm:mb-6">
            <PlayerInfo gameState={gameState} />
        </div>
        
        <div className={`w-full ${disableBoardClicks ? 'pointer-events-none opacity-60' : ''}`}>
            <Board gameState={gameState} onPieceClick={handlePieceClick} />
        </div>
        
        {/* Return to menu button - can be styled or placed differently if needed */}
        <button
            onClick={onReturnToMenu}
            className="mt-6 sm:mt-8 px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow hover:bg-gray-500 transition-colors text-sm"
          >
            Voltar ao Menu Principal
        </button>
      </main>

      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
      
      {/* Footer - Game Status */}
      <GameStatus message={displayMessage || PT_BR_MESSAGES.startGame} isError={isErrorMessage} />
    </div>
  );
};


const App: React.FC = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);

  const handleSelectMode = (mode: GameMode) => {
    setSelectedGameMode(mode);
  };

  const handleReturnToMenu = () => {
    setSelectedGameMode(null);
  };

  if (!selectedGameMode) {
    return <StartScreen onSelectMode={handleSelectMode} />;
  }

  return <GameScreen gameMode={selectedGameMode} onReturnToMenu={handleReturnToMenu} />;
};

export default App;