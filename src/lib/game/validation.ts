import { Card, Meld, Suit, Rank } from './types';
import { SUITS } from './constants';

/**
 * Check if cards form a valid set (3+ of same rank, different suits)
 * Jokers can substitute for any card
 */
export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  if (cards.length > 4) return false; // Max 4 cards in a set (one per suit)

  const nonJokers = cards.filter((c) => !c.isJoker);
  const jokerCount = cards.length - nonJokers.length;

  if (nonJokers.length === 0) return false; // Need at least one real card

  // All non-jokers must have the same rank
  const rank = nonJokers[0].rank;
  if (!nonJokers.every((c) => c.rank === rank)) return false;

  // All non-jokers must have different suits
  const suits = new Set(nonJokers.map((c) => c.suit));
  if (suits.size !== nonJokers.length) return false;

  return true;
}

/**
 * Check if cards form a valid run (3+ consecutive same suit)
 * Jokers can substitute for any card
 */
export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;

  const nonJokers = cards.filter((c) => !c.isJoker);
  const jokerCount = cards.length - nonJokers.length;

  if (nonJokers.length === 0) return false; // Need at least one real card

  // All non-jokers must have the same suit
  const suit = nonJokers[0].suit;
  if (!nonJokers.every((c) => c.suit === suit)) return false;

  // Check if we can form a consecutive sequence
  const ranks = nonJokers.map((c) => c.rank).sort((a, b) => a - b);

  // Find the span needed
  const minRank = ranks[0];
  const maxRank = ranks[ranks.length - 1];
  const span = maxRank - minRank + 1;

  // The span must equal the total number of cards
  if (span !== cards.length) return false;

  // Check that non-jokers are in correct positions within the span
  const positions = new Set(ranks.map((r) => r - minRank));
  const neededJokers = span - nonJokers.length;

  if (neededJokers !== jokerCount) return false;

  // No duplicate positions
  if (positions.size !== nonJokers.length) return false;

  return true;
}

/**
 * Identify if cards form a valid meld (set or run)
 */
export function identifyMeld(cards: Card[]): { type: 'set' | 'run' } | null {
  if (isValidSet(cards)) return { type: 'set' };
  if (isValidRun(cards)) return { type: 'run' };
  return null;
}

/**
 * Check if a card can be added to an existing meld
 */
export function canAddToMeld(card: Card, meld: Meld): boolean {
  // Can't add to closed melds
  if (meld.isClosed) return false;

  // Try adding the card and check if still valid
  const newCards = [...meld.cards, card];

  if (meld.type === 'set') {
    return isValidSet(newCards);
  } else {
    return isValidRun(newCards);
  }
}

/**
 * Check if a card can replace a joker in a meld
 * Returns the index of the joker that can be replaced, or null
 */
export function canReplaceJoker(
  card: Card,
  meld: Meld
): { canReplace: boolean; jokerIndex: number } | null {
  // Can't replace in closed melds
  if (meld.isClosed) return null;

  // Card can't be a joker
  if (card.isJoker) return null;

  // Find jokers in the meld
  const jokerIndices = meld.cards
    .map((c, i) => (c.isJoker ? i : -1))
    .filter((i) => i !== -1);

  if (jokerIndices.length === 0) return null;

  // For sets: card must match the rank
  if (meld.type === 'set') {
    const nonJokers = meld.cards.filter((c) => !c.isJoker);
    if (nonJokers.length === 0) return null;

    const rank = nonJokers[0].rank;
    if (card.rank !== rank) return null;

    // Card's suit must not already be in the set
    const suits = new Set(nonJokers.map((c) => c.suit));
    if (suits.has(card.suit)) return null;

    return { canReplace: true, jokerIndex: jokerIndices[0] };
  }

  // For runs: card must fit in the sequence
  if (meld.type === 'run') {
    const nonJokers = meld.cards.filter((c) => !c.isJoker);
    if (nonJokers.length === 0) return null;

    const suit = nonJokers[0].suit;
    if (card.suit !== suit) return null;

    // Determine the range of the run
    const ranks = nonJokers.map((c) => c.rank).sort((a, b) => a - b);
    const minRank = ranks[0];
    const maxRank = ranks[ranks.length - 1];

    // The card's rank must be within or extending the run
    // But for replacement, it must be in a position currently held by a joker
    const positionsUsed = new Set(ranks);

    // Find what positions jokers occupy
    // Assume jokers fill gaps in the sequence from minRank to maxRank
    for (let r = minRank; r <= maxRank; r++) {
      if (!positionsUsed.has(r as Rank)) {
        // This position is filled by a joker
        if (card.rank === r) {
          return { canReplace: true, jokerIndex: jokerIndices[0] };
        }
      }
    }

    return null;
  }

  return null;
}

/**
 * Find all possible melds in a hand
 */
export function findPossibleMelds(hand: Card[]): Card[][] {
  const melds: Card[][] = [];
  const n = hand.length;

  // Check all combinations of 3+ cards
  for (let size = 3; size <= Math.min(n, 13); size++) {
    const combinations = getCombinations(hand, size);
    for (const combo of combinations) {
      if (identifyMeld(combo)) {
        melds.push(combo);
      }
    }
  }

  return melds;
}

/**
 * Get all combinations of size k from array
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];

  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map((combo) => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);

  return [...withFirst, ...withoutFirst];
}

/**
 * Get the effective rank of a run (for determining where cards fit)
 */
export function getRunRange(meld: Meld): { minRank: Rank; maxRank: Rank; suit: Suit } | null {
  if (meld.type !== 'run') return null;

  const nonJokers = meld.cards.filter((c) => !c.isJoker);
  if (nonJokers.length === 0) return null;

  const suit = nonJokers[0].suit;
  const ranks = nonJokers.map((c) => c.rank).sort((a, b) => a - b);

  // Calculate actual range including joker positions
  const minRank = ranks[0];
  const maxRank = ranks[ranks.length - 1];
  const jokerCount = meld.cards.length - nonJokers.length;

  // The full range is from minRank to minRank + total cards - 1
  const actualMax = (minRank + meld.cards.length - 1) as Rank;

  return {
    minRank,
    maxRank: actualMax > 13 ? 13 as Rank : actualMax,
    suit,
  };
}
