// Core game types for 8-Suited Rummy

export type Suit = 'swords' | 'spade' | 'cups' | 'hearts';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isJoker: boolean;
}

export interface Meld {
  id: string;
  cards: Card[];
  type: 'set' | 'run';
  isClosed: boolean;
  owner: 'player' | 'opponent';
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
}

export type TurnPhase = 'draw' | 'play' | 'discard';
export type GamePhase = 'playing' | 'round_end' | 'game_over';

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentPlayer: 'player' | 'opponent';
  player: Player;
  opponent: Player;
  deck: Card[];
  discardPile: Card[];
  melds: Meld[];
  roundNumber: number;
  drawnFromDiscard: Card[] | null; // Cards drawn from discard pile this turn (can't discard the first one)
  turnHistory: TurnAction[];
}

export type TurnAction =
  | { type: 'draw_deck'; playerName: string }
  | { type: 'draw_discard'; playerName: string; cardCount: number }
  | { type: 'play_meld'; playerName: string; meldType: 'set' | 'run'; cardCount: number }
  | { type: 'add_to_meld'; playerName: string; cardRank: Rank; cardSuit: Suit }
  | { type: 'close_meld'; playerName: string; meldId: string }
  | { type: 'replace_joker'; playerName: string; meldId: string }
  | { type: 'discard'; playerName: string; card: Card }
  | { type: 'go_out'; playerName: string };

// Bot strategy interface
export interface BotStrategy {
  chooseDrawAction(state: GameState): { type: 'deck' } | { type: 'discard'; fromIndex: number };
  chooseMeldsToPlay(state: GameState): Card[][] | null;
  chooseCardsToAddToMelds(state: GameState): Array<{ card: Card; meldId: string }> | null;
  chooseMeldsToClose(state: GameState): string[];
  chooseDiscard(state: GameState): Card;
}
