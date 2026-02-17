import { Card, Suit, Rank } from './types';
import { SUITS, RANKS } from './constants';

/**
 * Create a standard deck with 4 suits (13 cards each) + 4 jokers = 56 cards
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  // Add regular cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isJoker: false,
      });
    }
  }

  // Add jokers (one per suit, colored to match)
  for (const suit of SUITS) {
    deck.push({
      id: `joker-${suit}`,
      suit,
      rank: 0 as Rank, // Jokers have no rank
      isJoker: true,
    });
  }

  return deck;
}

/**
 * Shuffle deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal cards from deck
 */
export function dealCards(
  deck: Card[],
  numCards: number
): { hand: Card[]; remaining: Card[] } {
  const hand = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  return { hand, remaining };
}

/**
 * Sort hand by suit then rank
 */
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    swords: 0,
    spade: 1,
    cups: 2,
    hearts: 3,
  };

  return [...hand].sort((a, b) => {
    // Jokers go to the end
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    if (a.isJoker && b.isJoker) return suitOrder[a.suit] - suitOrder[b.suit];

    // Sort by suit first
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;

    // Then by rank
    return a.rank - b.rank;
  });
}

/**
 * Remove specific cards from a hand
 */
export function removeCardsFromHand(hand: Card[], cardsToRemove: Card[]): Card[] {
  const idsToRemove = new Set(cardsToRemove.map((c) => c.id));
  return hand.filter((c) => !idsToRemove.has(c.id));
}
