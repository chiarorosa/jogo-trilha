
import { useState, useCallback, useEffect } from 'react';
import { Player, GamePhase, GameState, BoardPositionState, GameMode } from '../types';
import { 
    TOTAL_PIECES_PER_PLAYER, POSITIONS_COUNT, TRILHA_LINES, ADJACENCY_LIST, 
    PLAYER_NAMES, PT_BR_MESSAGES, AI_PLAYER_NAME
} from '../constants';

const initialBoard = (): BoardPositionState[] => Array(POSITIONS_COUNT).fill(null);

const getInitialState = (gameMode: GameMode): GameState => {
    const firstPlayerName = PLAYER_NAMES[Player.PLAYER_1];
    return {
        board: initialBoard(),
        currentPlayer: Player.PLAYER_1,
        phase: GamePhase.PLACING,
        player1Pieces: { onBoard: 0, toPlace: TOTAL_PIECES_PER_PLAYER },
        player2Pieces: { onBoard: 0, toPlace: TOTAL_PIECES_PER_PLAYER },
        selectedPieceIndex: null,
        winner: null,
        message: `${PT_BR_MESSAGES.turn(firstPlayerName)} ${PT_BR_MESSAGES.placePiece}`,
        justFormedTrilha: false,
        gameMode: gameMode,
    };
};

export function useTrilhaGame(initialGameMode: GameMode) {
  const [gameState, setGameState] = useState<GameState>(getInitialState(initialGameMode));
  const [aiTurnInProgress, setAiTurnInProgress] = useState<boolean>(false);

  const getPlayerName = useCallback((player: Player, gameMode: GameMode) => {
    if (player === Player.PLAYER_2 && gameMode === GameMode.PVA) {
      return AI_PLAYER_NAME;
    }
    return PLAYER_NAMES[player];
  }, []);

  const switchPlayer = useCallback((currentState: GameState): Player => {
    return currentState.currentPlayer === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
  }, []);

  const checkTrilhaAt = useCallback((board: BoardPositionState[], player: Player, movedIndex: number): boolean => {
    for (const line of TRILHA_LINES) {
      if (line.includes(movedIndex)) {
        if (line.every(pos => board[pos] === player)) {
          return true;
        }
      }
    }
    return false;
  }, []);
  
  const isPieceInTrilha = useCallback((board: BoardPositionState[], pieceIndex: number): boolean => {
    if (board[pieceIndex] === null) return false;
    const player = board[pieceIndex] as Player;
    return checkTrilhaAt(board, player, pieceIndex);
  }, [checkTrilhaAt]);


  const canPlayerMove = useCallback((board: BoardPositionState[], player: Player, playerPiecesOnBoard: number, currentPhase: GamePhase): boolean => {
    if (playerPiecesOnBoard < 3) return false;
    
    const isFlying = playerPiecesOnBoard === 3 && (currentPhase === GamePhase.MOVING || currentPhase === GamePhase.FLYING);
    if (isFlying) {
       return board.some(pos => pos === null); 
    }

    for (let i = 0; i < POSITIONS_COUNT; i++) {
      if (board[i] === player) {
        for (const adj of ADJACENCY_LIST[i]) {
          if (board[adj] === null) {
            return true; 
          }
        }
      }
    }
    return false;
  }, []);
  
  const updateGameMessageAndPhase = useCallback((newState: GameState) => {
    let message = "";
    const nextPlayer = newState.currentPlayer;
    const nextPlayerName = getPlayerName(nextPlayer, newState.gameMode);

    if (newState.phase === GamePhase.REMOVE_PIECE) {
        const removingPlayerName = getPlayerName(newState.currentPlayer, newState.gameMode);
        message = PT_BR_MESSAGES.selectPieceToRemove(removingPlayerName);
    } else if (newState.winner) {
        const winnerName = getPlayerName(newState.winner, newState.gameMode);
        message = `${PT_BR_MESSAGES.playerWins(winnerName)} ${PT_BR_MESSAGES.gameOver}`;
    } else if (newState.phase === GamePhase.PLACING) {
        message = `${PT_BR_MESSAGES.turn(nextPlayerName)} ${PT_BR_MESSAGES.placePiece}`;
    } else if (newState.phase === GamePhase.MOVING || newState.phase === GamePhase.FLYING) {
        const playerPieces = nextPlayer === Player.PLAYER_1 ? newState.player1Pieces.onBoard : newState.player2Pieces.onBoard;
        
        // Transition to flying phase if necessary BEFORE checking canPlayerMove for this phase
        if (playerPieces === 3 && newState.phase === GamePhase.MOVING) {
            newState.phase = GamePhase.FLYING;
        }
        
        if (newState.phase === GamePhase.FLYING) {
            message = `${PT_BR_MESSAGES.turn(nextPlayerName)} ${PT_BR_MESSAGES.flyPhase}`;
        } else {
            message = `${PT_BR_MESSAGES.turn(nextPlayerName)} ${PT_BR_MESSAGES.movePiece}`;
        }

        if (!canPlayerMove(newState.board, nextPlayer, playerPieces, newState.phase)) {
            newState.winner = switchPlayer(newState); // The other player wins
            newState.phase = GamePhase.GAME_OVER;
            const actualWinnerName = getPlayerName(newState.winner!, newState.gameMode);
            message = `${PT_BR_MESSAGES.playerWins(actualWinnerName)} ${PT_BR_MESSAGES.gameOver}`;
        }
    }
     if (newState.gameMode === GameMode.PVA && newState.currentPlayer === Player.PLAYER_2 && 
        newState.phase !== GamePhase.GAME_OVER && newState.phase !== GamePhase.REMOVE_PIECE) {
        message = PT_BR_MESSAGES.aiThinking;
    }
    newState.message = message;
  }, [canPlayerMove, switchPlayer, getPlayerName]);


  const handlePieceClick = useCallback((index: number) => {
    if (gameState.gameMode === GameMode.PVA && gameState.currentPlayer === Player.PLAYER_2 && !aiTurnInProgress && gameState.phase !== GamePhase.REMOVE_PIECE) {
        // This check prevents manual clicks for AI if AI is supposed to move.
        // AI remove piece clicks are triggered by AI logic so they are fine.
        // However, AI logic itself calls handlePieceClick, so aiTurnInProgress is main guard.
    }
    if (aiTurnInProgress && !(gameState.currentPlayer === Player.PLAYER_2 && gameState.gameMode === GameMode.PVA)) {
      // If it's AI's turn, allow calls from AI. Otherwise, block if AI is thinking for human.
      // This logic seems a bit complex. The main guard is that human player cannot click if it's AI's turn.
      // And AI's calls to handlePieceClick are sequenced by setAiTurnInProgress.
    }

    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState; 

      if (newState.winner) return newState;

      const { currentPlayer, phase, board, selectedPieceIndex, gameMode } = newState;
      const playerPieces = currentPlayer === Player.PLAYER_1 ? newState.player1Pieces : newState.player2Pieces;
      const opponentPieces = currentPlayer === Player.PLAYER_1 ? newState.player2Pieces : newState.player1Pieces;
      const opponent = currentPlayer === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
      const currentTurnPlayerName = getPlayerName(currentPlayer, gameMode);

      if (phase === GamePhase.REMOVE_PIECE) {
        if (board[index] === opponent) {
          const opponentIsInTrilha = isPieceInTrilha(board, index);
          const allOpponentPiecesInTrilha = Array(POSITIONS_COUNT).fill(0)
            .map((_, i) => i)
            .filter(i => board[i] === opponent)
            .every(i => isPieceInTrilha(board, i));

          if (opponentIsInTrilha && !allOpponentPiecesInTrilha) {
            newState.message = PT_BR_MESSAGES.cannotRemoveTrilhaPiece;
            return newState;
          }

          board[index] = null;
          opponentPieces.onBoard--;
          newState.justFormedTrilha = false; 

          if (opponentPieces.onBoard < 3 && (newState.player1Pieces.toPlace === 0 && newState.player2Pieces.toPlace === 0)) { 
            newState.winner = currentPlayer;
            newState.phase = GamePhase.GAME_OVER;
          } else {
            newState.currentPlayer = switchPlayer(newState);
            if (newState.player1Pieces.toPlace > 0 || newState.player2Pieces.toPlace > 0) {
                newState.phase = GamePhase.PLACING;
            } else {
                const nextPlayerPcs = newState.currentPlayer === Player.PLAYER_1 ? newState.player1Pieces.onBoard : newState.player2Pieces.onBoard;
                newState.phase = nextPlayerPcs === 3 ? GamePhase.FLYING : GamePhase.MOVING;
            }
          }
        } else {
           newState.message = PT_BR_MESSAGES.invalidMove + " Selecione uma peça do oponente.";
           return newState;
        }
      } else if (phase === GamePhase.PLACING) {
        if (board[index] === null) {
          board[index] = currentPlayer;
          playerPieces.toPlace--;
          playerPieces.onBoard++;
          if (checkTrilhaAt(board, currentPlayer, index)) {
            newState.phase = GamePhase.REMOVE_PIECE;
            newState.justFormedTrilha = true;
          } else {
            newState.currentPlayer = switchPlayer(newState);
            if (newState.player1Pieces.toPlace === 0 && newState.player2Pieces.toPlace === 0) {
               const nextPlayerPcs = newState.currentPlayer === Player.PLAYER_1 ? newState.player1Pieces.onBoard : newState.player2Pieces.onBoard;
               newState.phase = nextPlayerPcs <= 3 ? GamePhase.FLYING : GamePhase.MOVING; // <=3 for flying
                 if (nextPlayerPcs <3) newState.phase = GamePhase.MOVING; // to trigger loss if no moves
            }
          }
        } else {
            newState.message = PT_BR_MESSAGES.invalidMove + " Posição ocupada.";
            return newState;
        }
      } else if (phase === GamePhase.MOVING || phase === GamePhase.FLYING) {
        if (selectedPieceIndex === null) { 
          if (board[index] === currentPlayer) {
            newState.selectedPieceIndex = index;
            newState.message = PT_BR_MESSAGES.selectDestination;
          } else {
            newState.message = PT_BR_MESSAGES.invalidMove + " Selecione sua peça.";
            return newState;
          }
        } else { 
          if (board[index] === null) {
            const isFlyingNow = phase === GamePhase.FLYING && playerPieces.onBoard === 3;
            const isValidRegularMove = phase === GamePhase.MOVING && ADJACENCY_LIST[selectedPieceIndex].includes(index);
            
            if (isFlyingNow || isValidRegularMove) {
              board[selectedPieceIndex] = null;
              board[index] = currentPlayer;
              newState.selectedPieceIndex = null;
              if (checkTrilhaAt(board, currentPlayer, index)) {
                newState.phase = GamePhase.REMOVE_PIECE;
                newState.justFormedTrilha = true;
              } else {
                newState.currentPlayer = switchPlayer(newState);
                const nextPlayerPcs = newState.currentPlayer === Player.PLAYER_1 ? newState.player1Pieces.onBoard : newState.player2Pieces.onBoard;
                newState.phase = nextPlayerPcs === 3 ? GamePhase.FLYING : GamePhase.MOVING; 
              }
            } else {
              newState.message = PT_BR_MESSAGES.invalidMove + " Destino inválido.";
              newState.selectedPieceIndex = null; 
              return newState;
            }
          } else if (index === selectedPieceIndex) { 
             newState.selectedPieceIndex = null;
             const currentPhaseMessage = (phase === GamePhase.FLYING && playerPieces.onBoard === 3) ? PT_BR_MESSAGES.flyPhase : PT_BR_MESSAGES.selectPieceToMove;
             newState.message = `${PT_BR_MESSAGES.turn(currentTurnPlayerName)} ${currentPhaseMessage}`;
          } else {
            newState.message = PT_BR_MESSAGES.invalidMove + " Destino ocupado.";
            return newState;
          }
        }
      }
      
      updateGameMessageAndPhase(newState);
      return newState;
    });
  }, [checkTrilhaAt, isPieceInTrilha, switchPlayer, updateGameMessageAndPhase, getPlayerName, gameState.gameMode, gameState.currentPlayer, aiTurnInProgress]);

  const restartGame = useCallback(() => {
    setGameState(getInitialState(initialGameMode)); // Restart with the same game mode
    setAiTurnInProgress(false);
  }, [initialGameMode]);
  
  useEffect(() => {
    setGameState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      if (newState.winner || newState.phase === GamePhase.REMOVE_PIECE || newState.justFormedTrilha) {
        return newState; 
      }

      const player = newState.currentPlayer;
      const playerPcs = player === Player.PLAYER_1 ? newState.player1Pieces.onBoard : newState.player2Pieces.onBoard;
      const totalPiecesPlaced = TOTAL_PIECES_PER_PLAYER * 2 - (newState.player1Pieces.toPlace + newState.player2Pieces.toPlace);


      if ((newState.phase === GamePhase.MOVING || newState.phase === GamePhase.FLYING) && playerPcs >=3 && totalPiecesPlaced === TOTAL_PIECES_PER_PLAYER * 2 ) {
         if (!canPlayerMove(newState.board, player, playerPcs, newState.phase)) {
          newState.winner = player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
          newState.phase = GamePhase.GAME_OVER;
          const winnerName = getPlayerName(newState.winner!, newState.gameMode);
          newState.message = `${PT_BR_MESSAGES.playerWins(winnerName)} ${PT_BR_MESSAGES.gameOver}`;
        }
      }
      return newState;
    });
  }, [gameState.currentPlayer, gameState.phase, gameState.board, gameState.gameMode, getPlayerName, canPlayerMove, gameState.justFormedTrilha, gameState.winner]);


  // --- AI LOGIC ---
    const getPossiblePlacements = (board: BoardPositionState[]): number[] => {
        return board.map((p, i) => (p === null ? i : -1)).filter(i => i !== -1);
    };

    const getPossibleMoves = (board: BoardPositionState[], player: Player, piecesOnBoard: number, currentPhase: GamePhase): { from: number; to: number }[] => {
        const moves: { from: number; to: number }[] = [];
        const isFlying = piecesOnBoard === 3 && (currentPhase === GamePhase.FLYING || currentPhase === GamePhase.MOVING);
        const emptySpots = getPossiblePlacements(board);

        for (let i = 0; i < POSITIONS_COUNT; i++) {
            if (board[i] === player) {
                if (isFlying) {
                    emptySpots.forEach(to => moves.push({ from: i, to }));
                } else {
                    ADJACENCY_LIST[i].forEach(adj => {
                        if (board[adj] === null) {
                            moves.push({ from: i, to: adj });
                        }
                    });
                }
            }
        }
        return moves;
    };
    
    const findBestPieceToRemoveByAI = (board: BoardPositionState[], opponent: Player): number | null => {
        const opponentPiecesIndices = board.map((p, i) => (p === opponent ? i : -1)).filter(i => i !== -1);
        let removablePieces = opponentPiecesIndices.filter(idx => !isPieceInTrilha(board, idx));

        if (removablePieces.length === 0) { // All opponent pieces are in trilhas
            removablePieces = opponentPiecesIndices;
        }
        if (removablePieces.length > 0) {
            return removablePieces[Math.floor(Math.random() * removablePieces.length)]; // Random valid removal
        }
        return null;
    };


    const determineAIMove = (currentGameState: GameState): { type: 'PLACE'; index: number } | { type: 'MOVE'; from: number; to: number } | null => {
        const { board, currentPlayer, phase, player2Pieces } = currentGameState; // AI is Player.PLAYER_2
        const opponent = Player.PLAYER_1;

        if (phase === GamePhase.PLACING) {
            const placements = getPossiblePlacements(board);
            // 1. Can AI place to form a Trilha?
            for (const p of placements) {
                const tempBoard = [...board];
                tempBoard[p] = currentPlayer;
                if (checkTrilhaAt(tempBoard, currentPlayer, p)) return { type: 'PLACE', index: p };
            }
            // 2. Can opponent form a Trilha? Block it.
            for (const p of placements) { // Iterate AI's possible placements
                const opponentPlacements = getPossiblePlacements(board.map((val, idx) => idx === p ? currentPlayer : val)); // Spots opponent could use if AI places at p
                for (const op of opponentPlacements) { // Iterate opponent's hypothetical next placements
                     const tempBoardOpponent = [...board];
                     tempBoardOpponent[op] = opponent; // Simulate opponent placing
                     if (checkTrilhaAt(tempBoardOpponent, opponent, op)) {
                         // Check if placing at 'p' by AI prevents this by occupying 'op'
                         if (p === op) return { type: 'PLACE', index: p }; // AI takes the critical spot
                         // If AI placing at 'p' doesn't block 'op', consider if 'op' itself is a good spot for AI
                         // More complex: find a placement that blocks any of opponent's trilha spots
                         // Simple block: if opponent can make trilha at 'op', AI takes 'op' if available
                         if (board[op] === null) return { type: 'PLACE', index: op };
                     }
                }
            }
            // Simplified block: iterate through empty spots, if opponent places there and makes trilha, AI takes that spot.
            for (const p of placements) {
                const tempBoard = [...board];
                tempBoard[p] = opponent;
                if (checkTrilhaAt(tempBoard, opponent, p)) return { type: 'PLACE', index: p }; // AI takes the blocking spot
            }

            // 3. Setup 2-in-a-row
            for (const p of placements) {
                for (const line of TRILHA_LINES) {
                    if (line.includes(p)) {
                        const piecesInLine = line.map(pos => board[pos]);
                        const aiPieces = piecesInLine.filter(pc => pc === currentPlayer).length;
                        const emptySlots = piecesInLine.filter(pc => pc === null).length;
                        if (aiPieces === 1 && emptySlots === 2) { // Placing at p would make 2 AI pieces
                           if (board[p] === null) return { type: 'PLACE', index: p };
                        }
                    }
                }
            }
            // 4. Random
            if (placements.length > 0) return { type: 'PLACE', index: placements[Math.floor(Math.random() * placements.length)] };

        } else if (phase === GamePhase.MOVING || phase === GamePhase.FLYING) {
            const moves = getPossibleMoves(board, currentPlayer, player2Pieces.onBoard, phase);
            // 1. Can AI move to form a Trilha?
            for (const move of moves) {
                const tempBoard = [...board];
                tempBoard[move.from] = null;
                tempBoard[move.to] = currentPlayer;
                if (checkTrilhaAt(tempBoard, currentPlayer, move.to)) return { type: 'MOVE', ...move };
            }
            // 2. Block opponent's Trilha move.
            const opponentMoves = getPossibleMoves(board, opponent, gameState.player1Pieces.onBoard, gameState.player1Pieces.onBoard === 3 ? GamePhase.FLYING : GamePhase.MOVING);
            for (const oppMove of opponentMoves) {
                const tempBoardOpp = [...board];
                tempBoardOpp[oppMove.from] = null;
                tempBoardOpp[oppMove.to] = opponent;
                if (checkTrilhaAt(tempBoardOpp, opponent, oppMove.to)) {
                    // AI tries to move to oppMove.to if possible
                    const blockingMove = moves.find(aiMove => aiMove.to === oppMove.to);
                    if (blockingMove) return { type: 'MOVE', ...blockingMove };
                }
            }
             // 3. Setup 2-in-a-row
            for (const move of moves) {
                const tempBoard = [...board];
                tempBoard[move.from] = null;
                tempBoard[move.to] = currentPlayer;
                for (const line of TRILHA_LINES) {
                    if (line.includes(move.to)) {
                        const piecesInLine = line.map(pos => tempBoard[pos]);
                        const aiPieces = piecesInLine.filter(pc => pc === currentPlayer).length;
                        const emptySlots = piecesInLine.filter(pc => pc === null).length;
                        if (aiPieces === 2 && emptySlots === 1) { // Moving to 'move.to' creates 2 AI pieces
                            return { type: 'MOVE', ...move };
                        }
                    }
                }
            }
            // 4. Random
            if (moves.length > 0) return { type: 'MOVE', ...moves[Math.floor(Math.random() * moves.length)] };
        }
        return null;
    };

    useEffect(() => {
        if (
            gameState.gameMode === GameMode.PVA &&
            gameState.currentPlayer === Player.PLAYER_2 && // AI is Player 2
            !gameState.winner &&
            !aiTurnInProgress
        ) {
            setAiTurnInProgress(true);
            setGameState(g => ({...g, message: PT_BR_MESSAGES.aiThinking }));

            // Calculate random delays
            const baseActionDelay = 500; // ms
            const randomActionAddition = Math.random() * 800; // 0 to 800 ms (total 500-1300ms)
            const currentActionDelay = baseActionDelay + randomActionAddition;

            const baseMoveCompletionDelay = 200; // ms
            const randomMoveCompletionAddition = Math.random() * 500; // 0 to 500 ms (total 200-700ms)
            const currentMoveCompletionDelay = baseMoveCompletionDelay + randomMoveCompletionAddition;

            if (gameState.phase === GamePhase.REMOVE_PIECE && gameState.justFormedTrilha) {
                setTimeout(() => {
                    const pieceToRemove = findBestPieceToRemoveByAI(gameState.board, Player.PLAYER_1);
                    if (pieceToRemove !== null) {
                        handlePieceClick(pieceToRemove);
                    }
                    setAiTurnInProgress(false);
                }, currentActionDelay);
            } else if (gameState.phase === GamePhase.PLACING || gameState.phase === GamePhase.MOVING || gameState.phase === GamePhase.FLYING) {
                setTimeout(() => {
                    const aiAction = determineAIMove(gameState);
                    if (aiAction) {
                        if (aiAction.type === 'PLACE') {
                            handlePieceClick(aiAction.index);
                            setAiTurnInProgress(false);
                        } else if (aiAction.type === 'MOVE') {
                            handlePieceClick(aiAction.from); // Select piece
                            setTimeout(() => {
                                handlePieceClick(aiAction.to);   // Move to destination
                                setAiTurnInProgress(false);
                            }, currentMoveCompletionDelay); 
                        }
                    } else {
                        console.warn("AI could not determine a move.");
                        setAiTurnInProgress(false); 
                    }
                }, currentActionDelay); // Initial delay for deciding action (place, or select piece to move)
            } else {
                 setAiTurnInProgress(false); 
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.currentPlayer, gameState.phase, gameState.winner, gameState.gameMode, aiTurnInProgress, gameState.board, gameState.justFormedTrilha]);

  return { gameState, handlePieceClick, restartGame, aiTurnInProgress };
}
