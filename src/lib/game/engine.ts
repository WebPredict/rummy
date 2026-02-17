import { Card, GameState, Meld, Player, TurnAction, TurnPhase } from './types';
import { createDeck, dealCards, shuffleDeck, removeCardsFromHand, sortHand } from './deck';
import { identifyMeld, canAddToMeld, canReplaceJoker } from './validation';
import { calculateRoundScore, checkGameOver } from './scoring';
import { CARDS_PER_HAND, BOT_NAMES } from './constants';

let meldIdCounter = 0;

/**
 * Create initial game state
 */
export function createInitialState(playerName: string): GameState {
  const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];

  return {
    phase: 'playing',
    turnPhase: 'draw',
    currentPlayer: 'player',
    player: {
      id: 'player',
      name: playerName,
      hand: [],
      score: 0,
    },
    opponent: {
      id: 'opponent',
      name: botName,
      hand: [],
      score: 0,
    },
    deck: [],
    discardPile: [],
    melds: [],
    roundNumber: 1,
    drawnFromDiscard: null,
    turnHistory: [],
  };
}

/**
 * Start a new round
 */
export function startRound(state: GameState): GameState {
  // Create and shuffle deck
  let deck = shuffleDeck(createDeck());

  // Deal 10 cards to each player
  const { hand: playerHand, remaining: afterPlayerDeal } = dealCards(deck, CARDS_PER_HAND);
  const { hand: opponentHand, remaining: afterBothDeal } = dealCards(afterPlayerDeal, CARDS_PER_HAND);

  // Turn over top card to start discard pile
  const discardPile = [afterBothDeal[0]];
  const remainingDeck = afterBothDeal.slice(1);

  return {
    ...state,
    phase: 'playing',
    turnPhase: 'draw',
    currentPlayer: 'player',
    player: {
      ...state.player,
      hand: sortHand(playerHand),
    },
    opponent: {
      ...state.opponent,
      hand: sortHand(opponentHand),
    },
    deck: remainingDeck,
    discardPile,
    melds: [],
    drawnFromDiscard: null,
    turnHistory: [],
  };
}

/**
 * Process a game action
 */
export function processAction(state: GameState, action: TurnAction): GameState {
  const newHistory = [...state.turnHistory, action];
  let newState = { ...state, turnHistory: newHistory };

  switch (action.type) {
    case 'draw_deck':
      return handleDrawFromDeck(newState);

    case 'draw_discard':
      return handleDrawFromDiscard(newState, action.cardCount);

    case 'play_meld':
      return newState; // Meld playing is handled separately

    case 'add_to_meld':
      return newState; // Adding to meld is handled separately

    case 'close_meld':
      return handleCloseMeld(newState, action.meldId);

    case 'discard':
      return handleDiscard(newState, action.card);

    case 'go_out':
      return handleGoOut(newState);

    default:
      return state;
  }
}

/**
 * Draw from deck
 */
export function handleDrawFromDeck(state: GameState): GameState {
  if (state.turnPhase !== 'draw') return state;
  if (state.deck.length === 0) {
    // Reshuffle discard pile into deck
    const topCard = state.discardPile[state.discardPile.length - 1];
    const reshuffled = shuffleDeck(state.discardPile.slice(0, -1));
    return handleDrawFromDeck({
      ...state,
      deck: reshuffled,
      discardPile: [topCard],
    });
  }

  const [drawnCard, ...remainingDeck] = state.deck;
  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'draw_deck', playerName: currentPlayer.name },
  ];

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: sortHand([...currentPlayer.hand, drawnCard]),
    },
    deck: remainingDeck,
    turnPhase: 'play',
    drawnFromDiscard: null,
    turnHistory: newHistory,
  };
}

/**
 * Draw from discard pile
 * Takes the specified card and all cards above it
 */
export function handleDrawFromDiscard(state: GameState, fromIndex: number): GameState {
  if (state.turnPhase !== 'draw') return state;
  if (fromIndex < 0 || fromIndex >= state.discardPile.length) return state;

  // Take cards from index to the top
  const cardsToTake = state.discardPile.slice(fromIndex);
  const remainingDiscard = state.discardPile.slice(0, fromIndex);

  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'draw_discard', playerName: currentPlayer.name, cardCount: cardsToTake.length },
  ];

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: sortHand([...currentPlayer.hand, ...cardsToTake]),
    },
    discardPile: remainingDiscard.length > 0 ? remainingDiscard : [],
    turnPhase: 'play',
    drawnFromDiscard: cardsToTake, // Remember what was drawn
    turnHistory: newHistory,
  };
}

/**
 * Play a meld
 */
export function handlePlayMeld(state: GameState, cards: Card[]): GameState {
  if (state.turnPhase !== 'play') return state;

  const meldInfo = identifyMeld(cards);
  if (!meldInfo) return state;

  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  // Check all cards are in hand
  const handIds = new Set(currentPlayer.hand.map((c) => c.id));
  if (!cards.every((c) => handIds.has(c.id))) return state;

  const newMeld: Meld = {
    id: `meld-${++meldIdCounter}`,
    cards: [...cards],
    type: meldInfo.type,
    isClosed: false,
    owner: state.currentPlayer,
  };

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    {
      type: 'play_meld',
      playerName: currentPlayer.name,
      meldType: meldInfo.type,
      cardCount: cards.length,
    },
  ];

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: sortHand(removeCardsFromHand(currentPlayer.hand, cards)),
    },
    melds: [...state.melds, newMeld],
    turnHistory: newHistory,
  };
}

/**
 * Add a card to an existing meld
 */
export function handleAddToMeld(state: GameState, card: Card, meldId: string): GameState {
  if (state.turnPhase !== 'play') return state;

  const meldIndex = state.melds.findIndex((m) => m.id === meldId);
  if (meldIndex === -1) return state;

  const meld = state.melds[meldIndex];
  if (!canAddToMeld(card, meld)) return state;

  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  // Check card is in hand
  if (!currentPlayer.hand.some((c) => c.id === card.id)) return state;

  const newMelds = [...state.melds];
  newMelds[meldIndex] = {
    ...meld,
    cards: [...meld.cards, card],
  };

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    {
      type: 'add_to_meld',
      playerName: currentPlayer.name,
      cardRank: card.rank,
      cardSuit: card.suit,
    },
  ];

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: sortHand(removeCardsFromHand(currentPlayer.hand, [card])),
    },
    melds: newMelds,
    turnHistory: newHistory,
  };
}

/**
 * Replace a joker in a meld
 */
export function handleReplaceJoker(state: GameState, card: Card, meldId: string): GameState {
  if (state.turnPhase !== 'play') return state;

  const meldIndex = state.melds.findIndex((m) => m.id === meldId);
  if (meldIndex === -1) return state;

  const meld = state.melds[meldIndex];
  const replacement = canReplaceJoker(card, meld);
  if (!replacement) return state;

  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  // Check card is in hand
  if (!currentPlayer.hand.some((c) => c.id === card.id)) return state;

  // Get the joker being replaced
  const joker = meld.cards[replacement.jokerIndex];

  // Create new meld with card replacing joker
  const newMeldCards = [...meld.cards];
  newMeldCards[replacement.jokerIndex] = card;

  const newMelds = [...state.melds];
  newMelds[meldIndex] = {
    ...meld,
    cards: newMeldCards,
  };

  // Remove played card from hand and add joker to hand
  const newHand = removeCardsFromHand(currentPlayer.hand, [card]);
  newHand.push(joker);

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'replace_joker', playerName: currentPlayer.name, meldId },
  ];

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: sortHand(newHand),
    },
    melds: newMelds,
    turnHistory: newHistory,
  };
}

/**
 * Close a meld (lock it so jokers can't be replaced)
 */
function handleCloseMeld(state: GameState, meldId: string): GameState {
  const meldIndex = state.melds.findIndex((m) => m.id === meldId);
  if (meldIndex === -1) return state;

  const meld = state.melds[meldIndex];

  // Only the owner can close their meld
  if (meld.owner !== state.currentPlayer) return state;

  const newMelds = [...state.melds];
  newMelds[meldIndex] = {
    ...meld,
    isClosed: true,
  };

  const currentPlayer = state[state.currentPlayer];
  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'close_meld', playerName: currentPlayer.name, meldId },
  ];

  return {
    ...state,
    melds: newMelds,
    turnHistory: newHistory,
  };
}

/**
 * Discard a card to end turn
 */
function handleDiscard(state: GameState, card: Card): GameState {
  if (state.turnPhase !== 'play' && state.turnPhase !== 'discard') return state;

  const currentPlayerKey = state.currentPlayer;
  const currentPlayer = state[currentPlayerKey];

  // Check card is in hand
  if (!currentPlayer.hand.some((c) => c.id === card.id)) return state;

  // Can't discard a card that was just drawn from discard pile
  if (
    state.drawnFromDiscard &&
    state.drawnFromDiscard.length > 0 &&
    state.drawnFromDiscard[0].id === card.id
  ) {
    return state;
  }

  const newHand = removeCardsFromHand(currentPlayer.hand, [card]);

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'discard', playerName: currentPlayer.name, card },
  ];

  // Check if player went out
  if (newHand.length === 0) {
    return handleGoOut({
      ...state,
      [currentPlayerKey]: {
        ...currentPlayer,
        hand: newHand,
      },
      discardPile: [...state.discardPile, card],
      turnHistory: newHistory,
    });
  }

  // Switch to other player's turn
  const nextPlayer = state.currentPlayer === 'player' ? 'opponent' : 'player';

  return {
    ...state,
    [currentPlayerKey]: {
      ...currentPlayer,
      hand: newHand,
    },
    discardPile: [...state.discardPile, card],
    currentPlayer: nextPlayer,
    turnPhase: 'draw',
    drawnFromDiscard: null,
    turnHistory: newHistory,
  };
}

/**
 * Handle player going out (emptying their hand)
 */
function handleGoOut(state: GameState): GameState {
  const winner = state.currentPlayer;
  const loser = winner === 'player' ? 'opponent' : 'player';

  const winnerPlayer = state[winner];
  const loserPlayer = state[loser];

  const { winnerPoints, loserPenalty } = calculateRoundScore(winnerPlayer, loserPlayer);

  const newHistory: TurnAction[] = [
    ...state.turnHistory,
    { type: 'go_out', playerName: winnerPlayer.name },
  ];

  const newState: GameState = {
    ...state,
    phase: 'round_end',
    [winner]: {
      ...winnerPlayer,
      score: winnerPlayer.score + winnerPoints,
    },
    [loser]: {
      ...loserPlayer,
      score: loserPlayer.score + loserPenalty,
    },
    turnHistory: newHistory,
  };

  // Check for game over
  const gameWinner = checkGameOver(newState);
  if (gameWinner) {
    return {
      ...newState,
      phase: 'game_over',
    };
  }

  return newState;
}

/**
 * Check if current player can discard a specific card
 */
export function canDiscard(state: GameState, card: Card): boolean {
  if (state.turnPhase !== 'play' && state.turnPhase !== 'discard') return false;

  // Can't discard the first card drawn from discard pile
  if (
    state.drawnFromDiscard &&
    state.drawnFromDiscard.length > 0 &&
    state.drawnFromDiscard[0].id === card.id
  ) {
    return false;
  }

  return true;
}

/**
 * Get the current player's hand
 */
export function getCurrentPlayerHand(state: GameState): Card[] {
  return state[state.currentPlayer].hand;
}
