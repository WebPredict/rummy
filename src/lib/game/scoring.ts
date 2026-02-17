import { Card, GameState, Player } from './types';
import { WIN_SCORE, JOKER_PENALTY } from './constants';

/**
 * Count jokers in a hand
 */
export function countJokersInHand(hand: Card[]): number {
  return hand.filter((c) => c.isJoker).length;
}

/**
 * Calculate points scored when a player goes out
 * Winner gets 1 point per joker held by opponent
 * Loser gets -1 point per joker they're holding
 */
export function calculateRoundScore(
  winner: Player,
  loser: Player
): { winnerPoints: number; loserPenalty: number } {
  const loserJokers = countJokersInHand(loser.hand);

  return {
    winnerPoints: loserJokers > 0 ? loserJokers : 1, // At least 1 point for going out
    loserPenalty: loserJokers * JOKER_PENALTY,
  };
}

/**
 * Check if game is over (someone exceeded WIN_SCORE)
 */
export function checkGameOver(state: GameState): 'player' | 'opponent' | null {
  if (state.player.score > WIN_SCORE) return 'player';
  if (state.opponent.score > WIN_SCORE) return 'opponent';
  return null;
}

/**
 * Calculate card value for AI decision making
 * Higher values are worse to hold
 */
export function getCardValue(card: Card): number {
  if (card.isJoker) return 15; // Jokers are valuable to play but costly to hold
  return card.rank; // Face cards worth more
}

/**
 * Calculate total hand value
 */
export function getHandValue(hand: Card[]): number {
  return hand.reduce((sum, card) => sum + getCardValue(card), 0);
}
