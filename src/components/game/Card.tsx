'use client';

import { Card as CardType, Suit, Rank } from '@/lib/game/types';
import { SUIT_COLORS, RANK_DISPLAY } from '@/lib/game/constants';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  faceDown?: boolean;
  showBack?: boolean;
  highlight?: boolean;
}

// SVG suit icons
const SuitIcon = ({ suit, size = 24 }: { suit: Suit; size?: number }) => {
  const color = SUIT_COLORS[suit];

  switch (suit) {
    case 'swords':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2L14 8L12 22L10 8L12 2Z" />
          <path d="M8 10H16L12 14L8 10Z" />
        </svg>
      );
    case 'spade':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2C12 2 4 10 4 14C4 17 6 18 8 18C9.5 18 10.5 17 11 16L10 22H14L13 16C13.5 17 14.5 18 16 18C18 18 20 17 20 14C20 10 12 2 12 2Z" />
        </svg>
      );
    case 'cups':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M5 4H19V6C19 10 16 14 14 15V18H16V20H8V18H10V15C8 14 5 10 5 6V4Z" />
          <ellipse cx="12" cy="5" rx="6" ry="1.5" fill={color} />
        </svg>
      );
    case 'hearts':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
        </svg>
      );
  }
};

export function Card({
  card,
  onClick,
  selected = false,
  disabled = false,
  small = false,
  faceDown = false,
  showBack = false,
  highlight = false,
}: CardProps) {
  const color = SUIT_COLORS[card.suit];
  const rankDisplay = card.isJoker ? 'J' : RANK_DISPLAY[card.rank];
  const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);

  const baseSize = small ? 'w-12 h-16' : 'w-16 h-24 sm:w-20 sm:h-28';

  if (faceDown || showBack) {
    return (
      <div
        className={`
          ${baseSize} rounded-lg
          bg-gradient-to-br from-emerald-800 to-emerald-900
          border-2 border-emerald-600
          flex items-center justify-center
          shadow-lg
          ${onClick ? 'cursor-pointer hover:border-emerald-400 transition-colors' : ''}
        `}
        onClick={onClick}
      >
        <span className="text-emerald-500 font-bold text-lg">R</span>
      </div>
    );
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseSize} rounded-lg relative
        bg-gradient-to-br from-stone-100 to-stone-200
        border-2 transition-all duration-150
        ${selected ? 'border-amber-400 ring-2 ring-amber-400/50 -translate-y-2' : 'border-stone-300'}
        ${highlight ? 'border-emerald-400 ring-2 ring-emerald-400/50' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : onClick ? 'cursor-pointer hover:border-stone-400 hover:shadow-lg' : ''}
        shadow-md
        flex flex-col
      `}
    >
      {/* Top left rank and suit */}
      <div className="absolute top-1 left-1 flex flex-col items-center" style={{ color }}>
        <span className={`font-bold leading-none ${small ? 'text-xs' : 'text-sm'}`}>
          {rankDisplay}
        </span>
        <SuitIcon suit={card.suit} size={small ? 10 : 14} />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {card.isJoker ? (
          <>
            <SuitIcon suit={card.suit} size={small ? 20 : 32} />
            <span
              className={`font-bold uppercase tracking-wider ${small ? 'text-[8px]' : 'text-[10px]'}`}
              style={{ color }}
            >
              Joker
            </span>
          </>
        ) : (
          <>
            <SuitIcon suit={card.suit} size={small ? 24 : 36} />
            <span
              className={`font-semibold uppercase tracking-wider mt-1 ${small ? 'text-[6px]' : 'text-[8px]'}`}
              style={{ color }}
            >
              {suitName}
            </span>
          </>
        )}
      </div>

      {/* Bottom right rank and suit (rotated) */}
      <div
        className="absolute bottom-1 right-1 flex flex-col items-center rotate-180"
        style={{ color }}
      >
        <span className={`font-bold leading-none ${small ? 'text-xs' : 'text-sm'}`}>
          {rankDisplay}
        </span>
        <SuitIcon suit={card.suit} size={small ? 10 : 14} />
      </div>
    </div>
  );
}
