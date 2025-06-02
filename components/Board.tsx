import React from 'react';
import { GameState, Player, PointCoordinate, GamePhase } from '../types';
import { BOARD_POINTS_COORDS, PLAYER_PIECE_CLASSES, ADJACENCY_LIST } from '../constants';

interface BoardProps {
  gameState: GameState;
  onPieceClick: (index: number) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onPieceClick }) => {
  const { board, selectedPieceIndex, phase, currentPlayer } = gameState;
  const pieceRadius = 12; 
  const clickAreaRadius = 18;

  const getHighlightClass = (index: number): string => {
    // Highlight for the currently selected piece (this is a piece, not an empty spot)
    if (selectedPieceIndex === index) {
      return 'fill-highlight-selected opacity-70';
    }

    // Highlight for an opponent's piece that can be removed
    if (phase === GamePhase.REMOVE_PIECE && board[index] !== null && board[index] !== currentPlayer) {
       return 'hover:fill-highlight-remove opacity-70 cursor-pointer';
    }

    // For empty spots during PLACING phase: large circle should be transparent
    if (phase === GamePhase.PLACING && board[index] === null) {
      return 'fill-transparent'; // No visible highlight for the large clickable area
    }

    // For empty spots during MOVING or FLYING phase (valid destinations): large circle should be transparent
    if ((phase === GamePhase.MOVING || phase === GamePhase.FLYING) && selectedPieceIndex !== null && board[index] === null) {
      const playerPieces = currentPlayer === Player.PLAYER_1 ? gameState.player1Pieces.onBoard : gameState.player2Pieces.onBoard;
      // Ensure selectedPieceIndex is not null before accessing ADJACENCY_LIST
      const isFlying = phase === GamePhase.FLYING && playerPieces === 3;
      if (ADJACENCY_LIST[selectedPieceIndex] && (isFlying || ADJACENCY_LIST[selectedPieceIndex].includes(index))) {
        return 'fill-transparent'; // No visible highlight for the large clickable area
      }
    }
    
    return 'fill-transparent'; // Default to transparent for the click area
  };


  return (
    <div className="bg-board-wood-bg p-3 sm:p-4 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md aspect-square mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Lines */}
        <g strokeWidth="3" className="stroke-board-wood-lines">
          {/* Outer square */}
          <line x1="50" y1="50" x2="350" y2="50" />
          <line x1="350" y1="50" x2="350" y2="350" />
          <line x1="350" y1="350" x2="50" y2="350" />
          <line x1="50" y1="350" x2="50" y2="50" />
          {/* Middle square */}
          <line x1="100" y1="100" x2="300" y2="100" />
          <line x1="300" y1="100" x2="300" y2="300" />
          <line x1="300" y1="300" x2="100" y2="300" />
          <line x1="100" y1="300" x2="100" y2="100" />
          {/* Inner square */}
          <line x1="150" y1="150" x2="250" y2="150" />
          <line x1="250" y1="150" x2="250" y2="250" />
          <line x1="250" y1="250" x2="150" y2="250" />
          <line x1="150" y1="250" x2="150" y2="150" />
          {/* Spokes */}
          <line x1="200" y1="50" x2="200" y2="150" />
          <line x1="350" y1="200" x2="250" y2="200" />
          <line x1="200" y1="350" x2="200" y2="250" />
          <line x1="50" y1="200" x2="150" y2="200" />
        </g>

        {/* Clickable points & Pieces */}
        {BOARD_POINTS_COORDS.map((coord: PointCoordinate, index: number) => (
          <g key={index} onClick={() => onPieceClick(index)} className="cursor-pointer group">
            {/* Clickable area - transparent but larger. Highlight class applies here. */}
            <circle
              cx={coord.x}
              cy={coord.y}
              r={clickAreaRadius}
              className={getHighlightClass(index)} 
            />
            {/* Visible board point if empty. Shows subtle hover effect via group-hover. */}
            {board[index] === null && (
              <circle
                cx={coord.x}
                cy={coord.y}
                r={pieceRadius / 2.5} 
                className="fill-board-wood-points group-hover:opacity-80 transition-opacity"
              />
            )}
            {/* Piece if position is occupied */}
            {board[index] !== null && (
              <circle
                cx={coord.x}
                cy={coord.y}
                r={pieceRadius}
                className={`
                  ${PLAYER_PIECE_CLASSES[board[index] as Player].fill} 
                  ${PLAYER_PIECE_CLASSES[board[index] as Player].stroke || ''}
                  stroke-1 
                  ${selectedPieceIndex === index ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-board-wood-bg' : ''}
                `}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Board;