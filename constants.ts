
import { Player, PointCoordinate } from './types';

export const TOTAL_PIECES_PER_PLAYER = 9;
export const POSITIONS_COUNT = 24;

// Visual coordinates for SVG rendering (example: 400x400 viewbox)
export const BOARD_POINTS_COORDS: PointCoordinate[] = [
  // Outer ring
  { x: 50, y: 50 }, { x: 200, y: 50 }, { x: 350, y: 50 }, // 0, 1, 2
  { x: 350, y: 200 }, { x: 350, y: 350 }, // 3, 4
  { x: 200, y: 350 }, { x: 50, y: 350 }, // 5, 6
  { x: 50, y: 200 }, // 7

  // Middle ring
  { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 }, // 8, 9, 10
  { x: 300, y: 200 }, { x: 300, y: 300 }, // 11, 12
  { x: 200, y: 300 }, { x: 100, y: 300 }, // 13, 14
  { x: 100, y: 200 }, // 15

  // Inner ring
  { x: 150, y: 150 }, { x: 200, y: 150 }, { x: 250, y: 150 }, // 16, 17, 18
  { x: 250, y: 200 }, { x: 250, y: 250 }, // 19, 20
  { x: 200, y: 250 }, { x: 150, y: 250 }, // 21, 22
  { x: 150, y: 200 }, // 23
];

export const ADJACENCY_LIST: number[][] = [
  /*0*/ [1, 7], /*1*/ [0, 2, 9], /*2*/ [1, 3], /*3*/ [2, 4, 11], /*4*/ [3, 5], /*5*/ [4, 6, 13], /*6*/ [5, 7], /*7*/ [0, 6, 15],
  /*8*/ [9, 15], /*9*/ [1, 8, 10, 17], /*10*/ [9, 11], /*11*/ [3, 10, 12, 19], /*12*/ [11, 13], /*13*/ [5, 12, 14, 21], /*14*/ [13, 15], /*15*/ [7, 8, 14, 23],
  /*16*/ [17, 23], /*17*/ [9, 16, 18], /*18*/ [17, 19], /*19*/ [11, 18, 20], /*20*/ [19, 21], /*21*/ [13, 20, 22], /*22*/ [21, 23], /*23*/ [15, 16, 22]
];

export const TRILHA_LINES: number[][] = [
  // Horizontal lines for each ring
  [0, 1, 2], [8, 9, 10], [16, 17, 18], // Top edges
  [6, 5, 4], [14, 13, 12], [22, 21, 20], // Bottom edges
  // Vertical lines for each ring
  [0, 7, 6], [8, 15, 14], [16, 23, 22], // Left edges
  [2, 3, 4], [10, 11, 12], [18, 19, 20], // Right edges
  // Spokes connecting rings
  [1, 9, 17], // Top-center spoke
  [7, 15, 23], // Mid-left spoke
  [3, 11, 19], // Mid-right spoke
  [5, 13, 21]  // Bottom-center spoke
];

// Updated to reflect new design: P1 is dark, P2 is light with dark stroke
export const PLAYER_PIECE_CLASSES: { [key in Player]: { fill: string; stroke?: string } } = {
  [Player.PLAYER_1]: { fill: 'fill-player1-color' },
  [Player.PLAYER_2]: { fill: 'fill-player2-color', stroke: 'stroke-player2-color-stroke' },
};

export const PLAYER_NAMES: { [key in Player]: string } = {
  [Player.PLAYER_1]: 'Jogador 1', // Simplified name
  [Player.PLAYER_2]: 'Jogador 2', // Simplified name
};

export const AI_PLAYER_NAME = 'I.A.'; // Simplified AI name
export const AI_THINKING_MESSAGE = 'I.A. está pensando...';

export const PT_BR_MESSAGES = {
  turn: (playerName: string) => `Vez de ${playerName}`, // Changed from "Turno de"
  placePiece: 'Posicione sua peça.', // Simplified
  movePiece: 'Mova sua peça.', // Simplified
  selectPieceToMove: 'Selecione uma peça para mover.',
  selectDestination: 'Selecione um local vazio adjacente.',
  selectPieceToRemove: (playerName: string) => `TRILHA! ${playerName}, remova uma peça do oponente.`, // Emphasized TRILHA
  playerWins: (playerName: string) => `${playerName} venceu!`,
  gameOver: 'Fim de Jogo!',
  invalidMove: 'Movimento inválido.',
  cannotRemoveTrilhaPiece: 'Não pode remover peça de uma trilha, a menos que todas as peças do oponente estejam em trilhas.',
  startGame: 'Bem-vindo ao Jogo da Trilha!',
  flyPhase: 'Você tem 3 peças, pode voar para qualquer local vazio!',
  aiThinking: AI_THINKING_MESSAGE,
  chooseMode: 'Escolha o Modo de Jogo',
  playerVsPlayer: 'Jogador vs Jogador',
  playerVsAI: 'Jogador vs I.A.',
};

export const INSTRUCTIONS_TITLE = "Regras do Jogo da Trilha"; // Changed from "Como Jogar Trilha"
export const INSTRUCTIONS_CONTENT: { title: string; text: string }[] = [
  {
    title: "Objetivo",
    text: "O objetivo do jogo é reduzir o número de peças do oponente a duas, ou deixá-lo sem movimentos válidos."
  },
  {
    title: "Preparação",
    text: "Cada jogador começa com 9 peças. O tabuleiro está inicialmente vazio. Jogadores se alternam para colocar suas peças no tabuleiro."
  },
  {
    title: "Fase 1: Colocação das Peças",
    text: "Os jogadores alternam turnos colocando uma de suas peças em qualquer interseção vazia do tabuleiro. Esta fase continua até que ambos os jogadores tenham colocado todas as suas 9 peças."
  },
  {
    title: "Moinho (Trilha)",
    text: "Se um jogador formar uma linha de três de suas peças (horizontal, vertical ou nas linhas centrais que conectam os quadrados), ele forma um 'moinho' (ou 'trilha'). Como recompensa, o jogador deve remover uma peça do oponente do tabuleiro. A peça removida não pode ser parte de um moinho do oponente, a menos que todas as peças do oponente façam parte de moinhos. Peças removidas não retornam ao jogo."
  },
  {
    title: "Fase 2: Movimentação das Peças",
    text: "Após todas as 18 peças serem colocadas, os jogadores alternam turnos movendo uma de suas peças. Uma peça pode ser movida para qualquer ponto adjacente vazio ao longo de uma linha. Se um jogador formar um moinho com seu movimento, ele remove uma peça do oponente (seguindo as mesmas regras da fase de colocação)."
  },
  {
    title: "Fase 3: Voar",
    text: "Quando um jogador fica com apenas três peças restantes, suas peças ganham a habilidade de 'voar'. Isso significa que, no seu turno, o jogador pode mover uma de suas três peças para qualquer interseção vazia no tabuleiro, não apenas para as adjacentes."
  },
  {
    title: "Fim de Jogo",
    text: "O jogo termina quando:\n- Um jogador tem menos de três peças no tabuleiro.\n- Um jogador não pode fazer um movimento legal no seu turno.\nO jogador adversário é o vencedor."
  },
];
