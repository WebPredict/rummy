'use client';

import { Card as CardType } from '@/lib/game/types';
import { Card } from './Card';

interface DrawAreaProps {
  deck: CardType[];
  discardPile: CardType[];
  onDrawFromDeck: () => void;
  onDrawFromDiscard: (fromIndex: number) => void;
  canDraw: boolean;
}

export function DrawArea({
  deck,
  discardPile,
  onDrawFromDeck,
  onDrawFromDiscard,
  canDraw,
}: DrawAreaProps) {
  // Show last few cards of discard pile (fanned out)
  const visibleDiscardCount = Math.min(discardPile.length, 5);
  const visibleDiscard = discardPile.slice(-visibleDiscardCount);

  return (
    <div className="flex items-center gap-8">
      {/* Draw Deck */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-amber-500/80 text-xs font-semibold uppercase tracking-wider">
          Draw Deck
        </span>
        <div className="relative">
          {/* Stack effect */}
          {deck.length > 2 && (
            <div className="absolute top-1 left-1 w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-emerald-900 border-2 border-emerald-700" />
          )}
          {deck.length > 1 && (
            <div className="absolute top-0.5 left-0.5 w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-emerald-850 border-2 border-emerald-650" />
          )}
          {/* Top card */}
          <div
            onClick={canDraw ? onDrawFromDeck : undefined}
            className={`
              relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg
              bg-gradient-to-br from-emerald-800 to-emerald-900
              border-2 border-emerald-600
              flex items-center justify-center
              ${canDraw ? 'cursor-pointer hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all' : 'opacity-70'}
            `}
          >
            <span className="text-emerald-500 font-bold text-2xl">R</span>
          </div>
          {/* Card count */}
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-700 border border-emerald-500 rounded-full text-emerald-200 text-xs font-semibold">
            {deck.length}
          </div>
        </div>
        {canDraw && (
          <button
            onClick={onDrawFromDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/50 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Draw from Deck
          </button>
        )}
      </div>

      {/* Discard Pile */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-500/80 text-xs font-semibold uppercase tracking-wider">
            Discard Pile
          </span>
          {discardPile.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-400 text-xs">
              {discardPile.length}
            </span>
          )}
        </div>
        <div className="relative min-w-[80px] sm:min-w-[100px] min-h-[96px] sm:min-h-[112px]">
          {discardPile.length === 0 ? (
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-stone-600 flex items-center justify-center">
              <span className="text-stone-500 text-xs">Empty</span>
            </div>
          ) : (
            <>
              {/* Show fanned discard pile */}
              {visibleDiscard.map((card, i) => {
                const isTop = i === visibleDiscard.length - 1;
                const offset = i * 20;
                const actualIndex = discardPile.length - visibleDiscardCount + i;

                return (
                  <div
                    key={card.id}
                    className="absolute transition-all"
                    style={{
                      left: `${offset}px`,
                      zIndex: i,
                    }}
                  >
                    <Card
                      card={card}
                      onClick={canDraw ? () => onDrawFromDiscard(actualIndex) : undefined}
                      highlight={canDraw && isTop}
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
        {canDraw && discardPile.length > 0 && (
          <p className="text-stone-400 text-xs text-center max-w-[180px]">
            Click any card to draw it (and all cards above it)
          </p>
        )}
      </div>
    </div>
  );
}
