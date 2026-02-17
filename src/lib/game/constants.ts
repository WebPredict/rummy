import { Suit, Rank } from './types';

export const SUITS: Suit[] = ['swords', 'spade', 'cups', 'hearts'];

export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const SUIT_COLORS: Record<Suit, string> = {
  swords: '#eab308', // yellow/gold
  spade: '#f97316',  // orange
  cups: '#3b82f6',   // blue
  hearts: '#ec4899', // pink/magenta
};

export const SUIT_ICONS: Record<Suit, string> = {
  swords: '/',   // sword symbol
  spade: '^',    // spade symbol
  cups: 'U',     // cup symbol
  hearts: '<3',  // heart symbol
};

export const RANK_DISPLAY: Record<Rank, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const CARDS_PER_HAND = 10;
export const WIN_SCORE = 25;
export const JOKER_PENALTY = -1;

export const BOT_NAMES = [
  'Rummy Rex',
  'Card Shark',
  'Meld Master',
  'Lucky Draw',
  'Wild Card',
  'Ace Hunter',
];
