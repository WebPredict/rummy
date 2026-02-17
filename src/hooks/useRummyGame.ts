'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, GameState, Meld, TurnAction } from '@/lib/game/types';
import {
  createInitialState,
  startRound,
  handleDrawFromDeck,
  handleDrawFromDiscard,
  handlePlayMeld,
  handleAddToMeld,
  handleReplaceJoker,
  canDiscard,
} from '@/lib/game/engine';
import { identifyMeld } from '@/lib/game/validation';
import { createRummyBot } from '@/lib/bot/rummy-bot';
import { sortHand, removeCardsFromHand } from '@/lib/game/deck';

const STORAGE_KEY = 'rummy-game-state';
const BOT_DELAY = 1200;

interface UseRummyGameConfig {
  playerName: string;
}

interface UseRummyGameReturn {
  gameState: GameState | null;
  selectedCards: Card[];
  toggleCardSelection: (card: Card) => void;
  clearSelection: () => void;
  drawFromDeck: () => void;
  drawFromDiscard: (fromIndex: number) => void;
  playSelectedMeld: () => boolean;
  addCardToMeld: (card: Card, meldId: string) => boolean;
  replaceJokerInMeld: (card: Card, meldId: string) => boolean;
  closeMeld: (meldId: string) => void;
  openMeld: (meldId: string) => void;
  discard: (card: Card) => boolean;
  startNewRound: () => void;
  restartGame: () => void;
  canDiscardCard: (card: Card) => boolean;
  isMyTurn: boolean;
  myHand: Card[];
}

export function useRummyGame(config: UseRummyGameConfig): UseRummyGameReturn {
  const { playerName } = config;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const botRef = useRef(createRummyBot());
  const prevStateRef = useRef<GameState | null>(null);

  // Load game from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate it's a valid game state
        if (parsed && parsed.player && parsed.opponent) {
          setGameState(parsed);
          return;
        }
      } catch (e) {
        // Invalid saved state, start new game
      }
    }

    // Start new game
    const initialState = createInitialState(playerName);
    const stateWithCards = startRound(initialState);
    setGameState(stateWithCards);
  }, [playerName]);

  // Save game to localStorage whenever state changes
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  // Run bot turns
  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase !== 'playing') return;
    if (gameState.currentPlayer !== 'opponent') return;

    const bot = botRef.current;
    let timeoutId: NodeJS.Timeout;

    const runBotTurn = () => {
      setGameState((prev) => {
        if (!prev) return null;
        if (prev.currentPlayer !== 'opponent') return prev;
        if (prev.phase !== 'playing') return prev;

        let state = prev;

        // Draw phase
        if (state.turnPhase === 'draw') {
          const drawChoice = bot.chooseDrawAction(state);
          if (drawChoice.type === 'deck') {
            state = handleDrawFromDeck(state);
          } else {
            state = handleDrawFromDiscard(state, drawChoice.fromIndex);
          }
        }

        return state;
      });

      // Play melds after a short delay
      timeoutId = setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return null;
          if (prev.currentPlayer !== 'opponent') return prev;
          if (prev.turnPhase !== 'play') return prev;

          let state = prev;

          // Play any melds
          const meldsToPlay = bot.chooseMeldsToPlay(state);
          if (meldsToPlay) {
            for (const meld of meldsToPlay) {
              state = handlePlayMeld(state, meld);
            }
          }

          // Add cards to existing melds
          const additions = bot.chooseCardsToAddToMelds(state);
          if (additions) {
            for (const { card, meldId } of additions) {
              // Check if it's a replacement or addition
              const targetMeld = state.melds.find((m) => m.id === meldId);
              if (targetMeld?.cards.some((c) => c.isJoker)) {
                state = handleReplaceJoker(state, card, meldId);
              } else {
                state = handleAddToMeld(state, card, meldId);
              }
            }
          }

          return state;
        });

        // Discard after another delay
        timeoutId = setTimeout(() => {
          setGameState((prev) => {
            if (!prev) return null;
            if (prev.currentPlayer !== 'opponent') return prev;
            if (prev.turnPhase !== 'play') return prev;

            // Choose and execute discard
            const discardCard = bot.chooseDiscard(prev);

            // Import and call the discard handler
            const currentPlayer = prev.opponent;
            const excludeId = prev.drawnFromDiscard?.[0]?.id;

            if (discardCard.id === excludeId) {
              // Can't discard this card, pick another
              const otherCard = currentPlayer.hand.find((c) => c.id !== excludeId);
              if (otherCard) {
                return executeDiscard(prev, otherCard);
              }
            }

            return executeDiscard(prev, discardCard);
          });
        }, BOT_DELAY);
      }, BOT_DELAY);
    };

    timeoutId = setTimeout(runBotTurn, BOT_DELAY);

    return () => clearTimeout(timeoutId);
  }, [gameState?.currentPlayer, gameState?.phase, gameState?.turnPhase]);

  // Helper to execute discard
  const executeDiscard = (state: GameState, card: Card): GameState => {
    const currentPlayerKey = state.currentPlayer;
    const currentPlayer = state[currentPlayerKey];

    const newHand = removeCardsFromHand(currentPlayer.hand, [card]);

    const newHistory: TurnAction[] = [
      ...state.turnHistory,
      { type: 'discard', playerName: currentPlayer.name, card },
    ];

    // Check if player went out
    if (newHand.length === 0) {
      const winner = state.currentPlayer;
      const loser = winner === 'player' ? 'opponent' : 'player';
      const loserPlayer = state[loser];
      const loserJokers = loserPlayer.hand.filter((c) => c.isJoker).length;
      const winnerPoints = loserJokers > 0 ? loserJokers : 1;
      const loserPenalty = loserJokers * -1;

      const goOutHistory: TurnAction[] = [
        ...newHistory,
        { type: 'go_out', playerName: currentPlayer.name },
      ];

      const newState: GameState = {
        ...state,
        phase: 'round_end',
        [currentPlayerKey]: {
          ...currentPlayer,
          hand: newHand,
        },
        [winner]: {
          ...state[winner],
          hand: winner === currentPlayerKey ? newHand : state[winner].hand,
          score: state[winner].score + (winner === currentPlayerKey ? winnerPoints : 0),
        },
        [loser]: {
          ...state[loser],
          score: state[loser].score + loserPenalty,
        },
        discardPile: [...state.discardPile, card],
        turnHistory: goOutHistory,
      };

      // Check for game over
      if (newState.player.score > 25 || newState.opponent.score > 25) {
        return { ...newState, phase: 'game_over' };
      }

      return newState;
    }

    // Switch turns
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
  };

  // Toggle card selection
  const toggleCardSelection = useCallback((card: Card) => {
    setSelectedCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      }
      return [...prev, card];
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  // Draw from deck
  const drawFromDeck = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'draw') return prev;
      return handleDrawFromDeck(prev);
    });
  }, []);

  // Draw from discard pile
  const drawFromDiscard = useCallback((fromIndex: number) => {
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'draw') return prev;
      return handleDrawFromDiscard(prev, fromIndex);
    });
  }, []);

  // Play selected cards as a meld
  const playSelectedMeld = useCallback((): boolean => {
    if (selectedCards.length < 3) return false;

    const meldInfo = identifyMeld(selectedCards);
    if (!meldInfo) return false;

    let success = false;
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'play') return prev;

      const newState = handlePlayMeld(prev, selectedCards);
      if (newState !== prev) {
        success = true;
        return newState;
      }
      return prev;
    });

    if (success) {
      setSelectedCards([]);
    }
    return success;
  }, [selectedCards]);

  // Add a card to an existing meld
  const addCardToMeld = useCallback((card: Card, meldId: string): boolean => {
    let success = false;
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'play') return prev;

      const newState = handleAddToMeld(prev, card, meldId);
      if (newState !== prev) {
        success = true;
        return newState;
      }
      return prev;
    });

    if (success) {
      setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    }
    return success;
  }, []);

  // Replace a joker in a meld
  const replaceJokerInMeld = useCallback((card: Card, meldId: string): boolean => {
    let success = false;
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'play') return prev;

      const newState = handleReplaceJoker(prev, card, meldId);
      if (newState !== prev) {
        success = true;
        return newState;
      }
      return prev;
    });

    if (success) {
      setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
    }
    return success;
  }, []);

  // Close a meld
  const closeMeld = useCallback((meldId: string) => {
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;

      const meldIndex = prev.melds.findIndex((m) => m.id === meldId);
      if (meldIndex === -1) return prev;

      const meld = prev.melds[meldIndex];
      if (meld.owner !== 'player') return prev;

      const newMelds = [...prev.melds];
      newMelds[meldIndex] = { ...meld, isClosed: true };

      return { ...prev, melds: newMelds };
    });
  }, []);

  // Open a closed meld
  const openMeld = useCallback((meldId: string) => {
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;

      const meldIndex = prev.melds.findIndex((m) => m.id === meldId);
      if (meldIndex === -1) return prev;

      const meld = prev.melds[meldIndex];
      if (meld.owner !== 'player') return prev;
      if (!meld.isClosed) return prev;

      const newMelds = [...prev.melds];
      newMelds[meldIndex] = { ...meld, isClosed: false };

      return { ...prev, melds: newMelds };
    });
  }, []);

  // Discard a card
  const discard = useCallback((card: Card): boolean => {
    let success = false;
    setGameState((prev) => {
      if (!prev) return null;
      if (prev.currentPlayer !== 'player') return prev;
      if (prev.turnPhase !== 'play') return prev;
      if (!canDiscard(prev, card)) return prev;

      const newState = executeDiscard(prev, card);
      if (newState !== prev) {
        success = true;
        return newState;
      }
      return prev;
    });

    if (success) {
      setSelectedCards([]);
    }
    return success;
  }, []);

  // Check if a card can be discarded
  const canDiscardCard = useCallback(
    (card: Card): boolean => {
      if (!gameState) return false;
      return canDiscard(gameState, card);
    },
    [gameState]
  );

  // Start new round
  const startNewRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return null;
      return startRound({
        ...prev,
        roundNumber: prev.roundNumber + 1,
      });
    });
    setSelectedCards([]);
  }, []);

  // Restart entire game
  const restartGame = useCallback(() => {
    const initialState = createInitialState(playerName);
    const stateWithCards = startRound(initialState);
    setGameState(stateWithCards);
    setSelectedCards([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [playerName]);

  // Computed values
  const isMyTurn = gameState?.currentPlayer === 'player' && gameState?.phase === 'playing';
  const myHand = gameState?.player?.hand ?? [];

  return {
    gameState,
    selectedCards,
    toggleCardSelection,
    clearSelection,
    drawFromDeck,
    drawFromDiscard,
    playSelectedMeld,
    addCardToMeld,
    replaceJokerInMeld,
    closeMeld,
    openMeld,
    discard,
    startNewRound,
    restartGame,
    canDiscardCard,
    isMyTurn,
    myHand: sortHand(myHand),
  };
}
