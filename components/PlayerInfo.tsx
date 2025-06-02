import React from 'react';
import { GameState, Player, GameMode } from '../types';
import { PLAYER_NAMES, AI_PLAYER_NAME } from '../constants';

// SVG Pawn Icon
const PawnIcon: React.FC<{ colorClass: string, strokeClass?: string }> = ({ colorClass, strokeClass }) => (
  <svg viewBox="0 0 24 24" className={`w-10 h-10 sm:w-12 sm:h-12 ${colorClass} ${strokeClass || ''}`} strokeWidth="1.5" fill="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);


const PlayerCard: React.FC<{
  playerName: string;
  playerEnum: Player;
  piecesToPlace: number;
  isCurrentPlayer: boolean;
  isWinner?: boolean;
}> = ({ playerName, playerEnum, piecesToPlace, isCurrentPlayer, isWinner }) => {
  const iconColorClass = playerEnum === Player.PLAYER_1 ? 'text-player1-color' : 'text-player2-color';
  // const iconStrokeClass = playerEnum === Player.PLAYER_2 ? 'stroke-player2-color-stroke' : 'stroke-player1-color'; // Not directly used on PawnIcon but good for consistency
  
  const totalDots = 9; // Display 9 dots to represent all pieces
  const activeDots = piecesToPlace; // piecesToPlace counts down from 9

  return (
    <div 
      className={`flex-1 p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300
                  ${isCurrentPlayer && !isWinner ? (playerEnum === Player.PLAYER_1 ? 'ring-4 ring-primary' : 'ring-4 ring-primary') : 'ring-2 ring-transparent'}
                  bg-board-bg-color`} // Using board-bg-color (white) for cards
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-full ${playerEnum === Player.PLAYER_1 ? 'bg-player1-color' : 'bg-player2-color-stroke'}`}>
          <PawnIcon 
            colorClass={playerEnum === Player.PLAYER_1 ? 'text-secondary' : 'text-player2-color'} 
            strokeClass={playerEnum === Player.PLAYER_1 ? '' : 'stroke-player2-color-stroke'}
          />
        </div>
        <div className="flex flex-col items-end">
            <span className="text-sm sm:text-md font-semibold text-text-dark">{playerName}</span>
            <div className="flex space-x-1 mt-2"> {/* Adjusted space for more dots */}
            {[...Array(totalDots)].map((_, i) => {
              let dotClasses = "block w-2.5 h-2.5 rounded-full transition-all duration-200"; // Smaller dots
              if (i < activeDots) { // This dot represents a piece yet to be placed
                if (playerEnum === Player.PLAYER_1) {
                  dotClasses += " bg-player1-color";
                } else { // Player.PLAYER_2
                  dotClasses += " bg-player2-color border border-player2-color-stroke";
                }
              } else { // This dot represents a piece already placed or not available
                dotClasses += " bg-gray-300 opacity-60"; 
              }
              return <span key={i} className={dotClasses}></span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerInfo: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const { player1Pieces, player2Pieces, currentPlayer, gameMode, winner } = gameState;

  const player1Name = PLAYER_NAMES[Player.PLAYER_1];
  const player2Name = gameMode === GameMode.PVA ? AI_PLAYER_NAME : PLAYER_NAMES[Player.PLAYER_2];
  
  return (
    <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 w-full px-2 sm:px-0">
      <PlayerCard
        playerName={player1Name}
        playerEnum={Player.PLAYER_1}
        piecesToPlace={player1Pieces.toPlace}
        isCurrentPlayer={currentPlayer === Player.PLAYER_1}
        isWinner={winner === Player.PLAYER_1}
      />
      <PlayerCard
        playerName={player2Name}
        playerEnum={Player.PLAYER_2}
        piecesToPlace={player2Pieces.toPlace}
        isCurrentPlayer={currentPlayer === Player.PLAYER_2}
        isWinner={winner === Player.PLAYER_2}
      />
    </div>
  );
};

export default PlayerInfo;