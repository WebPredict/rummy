'use client';

import { Card as CardType } from '@/lib/game/types';
import { Card } from './Card';

interface HandProps {
  cards: CardType[];
  selectedCards: CardType[];
  onCardClick: (card: CardType) => void;
  disabled?: boolean;
  label?: string;
  cardCount?: number;
}

export function Hand({
  cards,
  selectedCards,
  onCardClick,
  disabled = false,
  label,
  cardCount,
}: HandProps) {
  const selectedIds = new Set(selectedCards.map((c) => c.id));

  // Calculate overlap based on number of cards (less overlap = more spread out)
  const getOverlapClass = () => {
    if (cards.length <= 7) return '-ml-3 sm:-ml-1';
    if (cards.length <= 10) return '-ml-5 sm:-ml-3';
    return '-ml-7 sm:-ml-5';
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-500 font-semibold text-sm">{label}</span>
          {cardCount !== undefined && (
            <span className="px-2 py-0.5 bg-emerald-800/50 border border-emerald-600/50 rounded-full text-emerald-400 text-xs">
              {cardCount} cards
            </span>
          )}
        </div>
      )}
      <div className="flex justify-center">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`${index > 0 ? getOverlapClass() : ''} transition-all duration-150`}
            style={{ zIndex: index }}
          >
            <Card
              card={card}
              selected={selectedIds.has(card.id)}
              onClick={() => onCardClick(card)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface OpponentHandProps {
  cardCount: number;
  label: string;
  jokersHeld?: number;
}

export function OpponentHand({ cardCount, label, jokersHeld }: OpponentHandProps) {
  // Show cards in two rows if more than 7
  const topRowCount = Math.ceil(cardCount / 2);
  const bottomRowCount = cardCount - topRowCount;

  const renderRow = (count: number) => (
    <div className="flex justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${i > 0 ? '-ml-10' : ''}`} style={{ zIndex: i }}>
          <Card
            card={{ id: `back-${i}`, suit: 'swords', rank: 1, isJoker: false }}
            faceDown
            small
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-stone-400 font-medium text-sm">{label}</span>
        <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-amber-500 text-[10px] font-medium">
          AI
        </span>
        <span className="px-2 py-0.5 bg-emerald-800/50 border border-emerald-600/50 rounded-full text-emerald-400 text-xs">
          {cardCount} cards
        </span>
        {jokersHeld !== undefined && jokersHeld > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" />
            </svg>
            {jokersHeld} held
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {renderRow(topRowCount)}
        {bottomRowCount > 0 && renderRow(bottomRowCount)}
      </div>
    </div>
  );
}
