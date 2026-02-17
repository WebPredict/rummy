'use client';

import { useState } from 'react';
import { useRummyGame } from '@/hooks/useRummyGame';
import { Hand, OpponentHand } from './Hand';
import { DrawArea } from './DrawArea';
import { MeldsArea } from './MeldsArea';
import { Scoreboard } from './Scoreboard';
import { GameLog } from './GameLog';
import { HelpModal } from './HelpModal';
import { Card } from './Card';
import { identifyMeld, canAddToMeld, canReplaceJoker } from '@/lib/game/validation';
import { Card as CardType, Meld } from '@/lib/game/types';

interface GameBoardProps {
  playerName: string;
}

export function GameBoard({ playerName }: GameBoardProps) {
  const {
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
    myHand,
  } = useRummyGame({ playerName });

  const [showHelp, setShowHelp] = useState(false);
  const [selectedMeldId, setSelectedMeldId] = useState<string | null>(null);

  if (!gameState) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center">
        <div className="text-amber-500 text-lg animate-pulse">Loading game...</div>
      </div>
    );
  }

  const canDraw = isMyTurn && gameState.turnPhase === 'draw';
  const canPlay = isMyTurn && gameState.turnPhase === 'play';

  // Check if selected cards form a valid meld
  const canPlayMeld = selectedCards.length >= 3 && identifyMeld(selectedCards) !== null;

  // Check if a single selected card can be added to the selected meld
  const canAddToSelectedMeld = () => {
    if (selectedCards.length !== 1 || !selectedMeldId) return false;
    const meld = gameState.melds.find((m) => m.id === selectedMeldId);
    if (!meld) return false;
    return canAddToMeld(selectedCards[0], meld) || canReplaceJoker(selectedCards[0], meld) !== null;
  };

  // Handle meld click
  const handleMeldClick = (meldId: string) => {
    if (!canPlay) return;

    if (selectedCards.length === 1) {
      const meld = gameState.melds.find((m) => m.id === meldId);
      if (meld) {
        // Try to add or replace
        const replacement = canReplaceJoker(selectedCards[0], meld);
        if (replacement) {
          replaceJokerInMeld(selectedCards[0], meldId);
        } else if (canAddToMeld(selectedCards[0], meld)) {
          addCardToMeld(selectedCards[0], meldId);
        }
      }
    } else {
      setSelectedMeldId(selectedMeldId === meldId ? null : meldId);
    }
  };

  // Handle discard
  const handleDiscard = () => {
    if (selectedCards.length === 1) {
      discard(selectedCards[0]);
    }
  };

  // Opponent joker count
  const opponentJokers = gameState.opponent.hand.filter((c) => c.isJoker).length;

  // Turn phase indicator
  const getTurnPhaseText = () => {
    if (!isMyTurn) return `${gameState.opponent.name}'s turn`;
    switch (gameState.turnPhase) {
      case 'draw':
        return 'Draw a card';
      case 'play':
        return 'Play melds or discard';
      default:
        return '';
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 relative overflow-hidden">
      {/* Felt texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-noise" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 bg-gradient-to-b from-black/40 to-transparent z-20">
        <div className="flex items-center gap-3">
          <span className="font-serif text-amber-500 font-semibold tracking-widest uppercase text-sm">
            8-Suited Rummy
          </span>
          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 rounded-lg bg-emerald-800/50 border border-emerald-600/30 text-stone-400 hover:text-stone-200 hover:bg-emerald-700/50 transition-colors"
            title="Rules & Help"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Turn indicator */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isMyTurn
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {getTurnPhaseText()}
        </div>
      </div>

      {/* Left sidebar - Scoreboard & Log */}
      <div className="absolute left-4 top-16 flex flex-col gap-4 z-10">
        <Scoreboard gameState={gameState} />
        <GameLog turnHistory={gameState.turnHistory} roundNumber={gameState.roundNumber} />
      </div>

      {/* Opponent hand (top) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <OpponentHand
          cardCount={gameState.opponent.hand.length}
          label={gameState.opponent.name}
          jokersHeld={opponentJokers}
        />
      </div>

      {/* Main play area (center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
        {/* Draw area */}
        <DrawArea
          deck={gameState.deck}
          discardPile={gameState.discardPile}
          onDrawFromDeck={drawFromDeck}
          onDrawFromDiscard={drawFromDiscard}
          canDraw={canDraw}
        />

        {/* Melds area */}
        <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-4 min-w-[400px] min-h-[100px]">
          <MeldsArea
            melds={gameState.melds}
            onMeldClick={handleMeldClick}
            onCloseMeld={closeMeld}
            onOpenMeld={openMeld}
            selectedMeldId={selectedMeldId}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
      </div>

      {/* Player's hand (bottom) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 w-full px-4">
        <Hand
          cards={myHand}
          selectedCards={selectedCards}
          onCardClick={toggleCardSelection}
          disabled={!canPlay && !canDraw}
          label={`${playerName}'s Hand`}
          cardCount={myHand.length}
        />
      </div>

      {/* Action buttons */}
      {canPlay && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {/* Play Meld button */}
          {canPlayMeld && (
            <button
              onClick={playSelectedMeld}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Play Meld
            </button>
          )}

          {/* Add to Meld button */}
          {canAddToSelectedMeld() && (
            <button
              onClick={() => {
                if (selectedMeldId) {
                  const meld = gameState.melds.find((m) => m.id === selectedMeldId);
                  if (meld) {
                    const replacement = canReplaceJoker(selectedCards[0], meld);
                    if (replacement) {
                      replaceJokerInMeld(selectedCards[0], selectedMeldId);
                    } else {
                      addCardToMeld(selectedCards[0], selectedMeldId);
                    }
                  }
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Meld
            </button>
          )}

          {/* Discard button */}
          {selectedCards.length === 1 && canDiscardCard(selectedCards[0]) && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Discard
            </button>
          )}

          {/* Clear selection */}
          {selectedCards.length > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-2 px-4 py-2 bg-stone-600 hover:bg-stone-500 text-white rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Round end overlay */}
      {gameState.phase === 'round_end' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-emerald-900 p-8 rounded-xl shadow-2xl text-center max-w-md">
            <h2 className="text-2xl font-bold text-amber-500 mb-4">Round Over!</h2>

            <div className="mb-6">
              <p className="text-stone-300 mb-2">
                {gameState.player.hand.length === 0
                  ? 'You went out!'
                  : `${gameState.opponent.name} went out!`}
              </p>

              {/* Show remaining cards if any */}
              {gameState.player.hand.length > 0 && (
                <div className="mb-4">
                  <p className="text-stone-400 text-sm mb-2">Your remaining cards:</p>
                  <div className="flex justify-center gap-1">
                    {gameState.player.hand.map((card) => (
                      <Card key={card.id} card={card} small />
                    ))}
                  </div>
                  <p className="text-amber-400 text-sm mt-2">
                    Joker penalty: {gameState.player.hand.filter((c) => c.isJoker).length} x -1 = {gameState.player.hand.filter((c) => c.isJoker).length * -1} pts
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-800/50 rounded-lg p-4">
                <div className="text-emerald-400 font-semibold mb-1">{gameState.player.name}</div>
                <div className="text-2xl font-bold text-emerald-300">{gameState.player.score}</div>
              </div>
              <div className="bg-amber-800/30 rounded-lg p-4">
                <div className="text-amber-400 font-semibold mb-1">{gameState.opponent.name}</div>
                <div className="text-2xl font-bold text-amber-300">{gameState.opponent.score}</div>
              </div>
            </div>

            <button
              onClick={startNewRound}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg transition-colors"
            >
              Next Round
            </button>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameState.phase === 'game_over' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-emerald-900 p-8 rounded-xl shadow-2xl text-center max-w-md">
            <h2 className="text-3xl font-bold text-amber-500 mb-4">
              {gameState.player.score > gameState.opponent.score ? 'You Win!' : 'Game Over'}
            </h2>

            <p className="text-stone-300 mb-6">
              {gameState.player.score > gameState.opponent.score
                ? 'Congratulations!'
                : `${gameState.opponent.name} wins!`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-800/50 rounded-lg p-4">
                <div className="text-emerald-400 font-semibold mb-1">{gameState.player.name}</div>
                <div className="text-3xl font-bold text-emerald-300">{gameState.player.score}</div>
              </div>
              <div className="bg-amber-800/30 rounded-lg p-4">
                <div className="text-amber-400 font-semibold mb-1">{gameState.opponent.name}</div>
                <div className="text-3xl font-bold text-amber-300">{gameState.opponent.score}</div>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Help modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
