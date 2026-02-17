'use client';

import { Card as CardType, Meld } from '@/lib/game/types';
import { Card } from './Card';

interface MeldsAreaProps {
  melds: Meld[];
  onMeldClick?: (meldId: string) => void;
  onCloseMeld?: (meldId: string) => void;
  onOpenMeld?: (meldId: string) => void;
  selectedMeldId?: string | null;
  currentPlayer: 'player' | 'opponent';
}

export function MeldsArea({
  melds,
  onMeldClick,
  onCloseMeld,
  onOpenMeld,
  selectedMeldId,
  currentPlayer,
}: MeldsAreaProps) {
  const playerMelds = melds.filter((m) => m.owner === 'player');
  const opponentMelds = melds.filter((m) => m.owner === 'opponent');

  const renderMeld = (meld: Meld, isPlayerMeld: boolean) => {
    const isSelected = selectedMeldId === meld.id;
    const hasJoker = meld.cards.some((c) => c.isJoker);
    const canClose = isPlayerMeld && !meld.isClosed && hasJoker && currentPlayer === 'player';
    const canOpen = isPlayerMeld && meld.isClosed && currentPlayer === 'player';

    return (
      <div
        key={meld.id}
        onClick={() => onMeldClick?.(meld.id)}
        className={`
          relative flex items-center p-2 rounded-lg
          ${isSelected ? 'bg-amber-500/20 ring-2 ring-amber-500/50' : 'bg-stone-800/30'}
          ${onMeldClick ? 'cursor-pointer hover:bg-stone-700/40 transition-colors' : ''}
        `}
      >
        {/* Meld type indicator */}
        <div
          className={`
            absolute -top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase
            ${meld.type === 'set' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}
          `}
        >
          {meld.type}
        </div>

        {/* Closed indicator */}
        {meld.isClosed && (
          <div className="absolute -top-2 right-2 px-1.5 py-0.5 bg-stone-600 text-stone-300 rounded text-[10px] font-semibold flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Closed
          </div>
        )}

        {/* Cards in meld */}
        <div className="flex pt-2">
          {meld.cards.map((card, i) => (
            <div key={card.id} className={i > 0 ? '-ml-8' : ''} style={{ zIndex: i }}>
              <Card card={card} small />
            </div>
          ))}
        </div>

        {/* Close button */}
        {canClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseMeld?.(meld.id);
            }}
            className="absolute -bottom-2 right-2 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition-colors"
            title="Close meld (lock jokers)"
          >
            Close
          </button>
        )}

        {/* Open button */}
        {canOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenMeld?.(meld.id);
            }}
            className="absolute -bottom-2 right-2 px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold transition-colors"
            title="Open meld (unlock jokers)"
          >
            Open
          </button>
        )}
      </div>
    );
  };

  if (melds.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-stone-500 italic">No melds played yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Opponent melds */}
      {opponentMelds.length > 0 && (
        <div>
          <h3 className="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Opponent&apos;s Melds
          </h3>
          <div className="flex flex-wrap gap-4">
            {opponentMelds.map((meld) => renderMeld(meld, false))}
          </div>
        </div>
      )}

      {/* Player melds */}
      {playerMelds.length > 0 && (
        <div>
          <h3 className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Your Melds
          </h3>
          <div className="flex flex-wrap gap-4">
            {playerMelds.map((meld) => renderMeld(meld, true))}
          </div>
        </div>
      )}
    </div>
  );
}
