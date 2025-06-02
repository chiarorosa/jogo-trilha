
export enum Player {
  PLAYER_1 = 1,
  PLAYER_2 = 2,
}

export enum GamePhase {
  PLACING = 'PLACING',
  MOVING = 'MOVING',
  FLYING = 'FLYING', // When a player has only 3 pieces
  REMOVE_PIECE = 'REMOVE_PIECE',
  GAME_OVER = 'GAME_OVER',
}

export enum GameMode {
  PVP = 'PVP', // Player vs Player
  PVA = 'PVA', // Player vs AI
}

export type BoardPositionState = Player | null; // null means empty

export interface GameState {
  board: BoardPositionState[];
  currentPlayer: Player;
  phase: GamePhase;
  player1Pieces: { onBoard: number; toPlace: number };
  player2Pieces: { onBoard: number; toPlace: number };
  selectedPieceIndex: number | null;
  winner: Player | null;
  message: string;
  justFormedTrilha: boolean; // To track if a trilha was formed in the current move
  gameMode: GameMode; // Added game mode
}

export interface PointCoordinate {
  x: number;
  y: number;
}
