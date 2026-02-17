import { BotStrategy, Card, GameState, Meld } from '../game/types';
import { findPossibleMelds, canAddToMeld, canReplaceJoker } from '../game/validation';
import { getCardValue, getHandValue } from '../game/scoring';

/**
 * Create a basic Rummy bot that:
 * - Draws from discard if it helps form melds
 * - Plays any valid melds it can
 * - Adds cards to existing melds when possible
 * - Discards highest value card not part of potential melds
 */
export function createRummyBot(): BotStrategy {
  return {
    chooseDrawAction(state: GameState): { type: 'deck' } | { type: 'discard'; fromIndex: number } {
      const hand = state.opponent.hand;
      const discardPile = state.discardPile;

      if (discardPile.length === 0) {
        return { type: 'deck' };
      }

      // Check if any card in discard pile helps complete a meld
      for (let i = discardPile.length - 1; i >= 0; i--) {
        const cardsToTake = discardPile.slice(i);
        const potentialHand = [...hand, ...cardsToTake];

        // Check if we can form any new melds with these cards
        const currentMelds = findPossibleMelds(hand);
        const newMelds = findPossibleMelds(potentialHand);

        // If taking from discard gives us more/better melds, do it
        if (newMelds.length > currentMelds.length) {
          return { type: 'discard', fromIndex: i };
        }

        // Also check if top discard completes a near-meld
        if (i === discardPile.length - 1) {
          const topCard = discardPile[i];
          if (wouldCompleteNearMeld(hand, topCard)) {
            return { type: 'discard', fromIndex: i };
          }
        }
      }

      // Default to drawing from deck
      return { type: 'deck' };
    },

    chooseMeldsToPlay(state: GameState): Card[][] | null {
      const hand = state.opponent.hand;
      const possibleMelds = findPossibleMelds(hand);

      if (possibleMelds.length === 0) return null;

      // Find non-overlapping melds to play
      const meldsToPlay: Card[][] = [];
      const usedCardIds = new Set<string>();

      // Sort by size (bigger melds first) to maximize cards played
      const sortedMelds = possibleMelds.sort((a, b) => b.length - a.length);

      for (const meld of sortedMelds) {
        // Check if any card in this meld is already used
        const hasOverlap = meld.some((c) => usedCardIds.has(c.id));
        if (!hasOverlap) {
          meldsToPlay.push(meld);
          meld.forEach((c) => usedCardIds.add(c.id));
        }
      }

      return meldsToPlay.length > 0 ? meldsToPlay : null;
    },

    chooseCardsToAddToMelds(state: GameState): Array<{ card: Card; meldId: string }> | null {
      const hand = state.opponent.hand;
      const additions: Array<{ card: Card; meldId: string }> = [];

      for (const card of hand) {
        for (const meld of state.melds) {
          // Try to add card to meld
          if (canAddToMeld(card, meld)) {
            additions.push({ card, meldId: meld.id });
            break; // Only add each card once
          }

          // Try to replace a joker
          const replacement = canReplaceJoker(card, meld);
          if (replacement && !card.isJoker) {
            // Only replace if it's beneficial (frees up a joker for us)
            additions.push({ card, meldId: meld.id });
            break;
          }
        }
      }

      return additions.length > 0 ? additions : null;
    },

    chooseMeldsToClose(state: GameState): string[] {
      // Close melds with jokers when opponent might steal them
      // For simplicity, don't close melds (keep options open)
      return [];
    },

    chooseDiscard(state: GameState): Card {
      const hand = state.opponent.hand;

      // Can't discard first card drawn from discard pile
      const excludeId = state.drawnFromDiscard?.[0]?.id;

      // Score each card based on its value and whether it's part of potential melds
      const cardScores = hand
        .filter((c) => c.id !== excludeId)
        .map((card) => {
          let score = getCardValue(card);

          // Penalize cards that are part of potential melds
          const possibleMelds = findPossibleMelds(hand);
          for (const meld of possibleMelds) {
            if (meld.some((m) => m.id === card.id)) {
              score -= 20; // Much less likely to discard
            }
          }

          // Penalize cards that are close to forming melds
          const nearMeldScore = getNearMeldScore(hand, card);
          score -= nearMeldScore;

          return { card, score };
        });

      // Sort by score descending (higher score = more likely to discard)
      cardScores.sort((a, b) => b.score - a.score);

      // Discard highest scoring card
      return cardScores[0]?.card ?? hand[0];
    },
  };
}

/**
 * Check if a card would complete a near-meld (2 cards that almost form a meld)
 */
function wouldCompleteNearMeld(hand: Card[], newCard: Card): boolean {
  // Check sets: do we have 2 cards of same rank?
  const sameRank = hand.filter((c) => c.rank === newCard.rank && !c.isJoker);
  if (sameRank.length >= 2) {
    // Check if suits are different
    const suits = new Set([...sameRank.map((c) => c.suit), newCard.suit]);
    if (suits.size === sameRank.length + 1) return true;
  }

  // Check runs: do we have 2 consecutive cards of same suit?
  const sameSuit = hand.filter((c) => c.suit === newCard.suit && !c.isJoker);
  for (const card of sameSuit) {
    // Check if newCard is consecutive
    if (Math.abs(card.rank - newCard.rank) === 1) {
      // Look for another card that would complete the run
      const hasThird = sameSuit.some(
        (c) =>
          c.id !== card.id &&
          (c.rank === newCard.rank + 1 ||
            c.rank === newCard.rank - 1 ||
            c.rank === card.rank + 1 ||
            c.rank === card.rank - 1) &&
          Math.abs(c.rank - card.rank) <= 2 &&
          Math.abs(c.rank - newCard.rank) <= 2
      );
      if (hasThird) return true;
    }
  }

  return false;
}

/**
 * Score how close a card is to forming melds with other cards in hand
 * Higher score = more valuable to keep
 */
function getNearMeldScore(hand: Card[], card: Card): number {
  if (card.isJoker) return 15; // Jokers are always valuable

  let score = 0;

  // Check for same-rank cards (potential sets)
  const sameRank = hand.filter((c) => c.rank === card.rank && c.id !== card.id && !c.isJoker);
  score += sameRank.length * 5;

  // Check for same-suit consecutive cards (potential runs)
  const sameSuit = hand.filter((c) => c.suit === card.suit && c.id !== card.id && !c.isJoker);
  for (const other of sameSuit) {
    const diff = Math.abs(other.rank - card.rank);
    if (diff === 1) score += 8; // Adjacent card
    else if (diff === 2) score += 3; // One gap
  }

  return score;
}
