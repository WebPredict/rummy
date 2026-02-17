'use client';

import { useState } from 'react';
import { TurnAction } from '@/lib/game/types';
import { RANK_DISPLAY } from '@/lib/game/constants';

interface GameLogProps {
  turnHistory: TurnAction[];
  roundNumber: number;
}

export function GameLog({ turnHistory, roundNumber }: GameLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAction = (action: TurnAction): string => {
    switch (action.type) {
      case 'draw_deck':
        return `${action.playerName} drew from deck`;
      case 'draw_discard':
        return `${action.playerName} drew ${action.cardCount} card${action.cardCount > 1 ? 's' : ''} from discard`;
      case 'play_meld':
        return `${action.playerName} played a ${action.meldType} (${action.cardCount} cards)`;
      case 'add_to_meld':
        return `${action.playerName} added ${RANK_DISPLAY[action.cardRank]} of ${action.cardSuit} to meld`;
      case 'close_meld':
        return `${action.playerName} closed a meld`;
      case 'replace_joker':
        return `${action.playerName} replaced a joker`;
      case 'discard':
        return `${action.playerName} discarded ${action.card.isJoker ? 'Joker' : `${RANK_DISPLAY[action.card.rank]} of ${action.card.suit}`}`;
      case 'go_out':
        return `${action.playerName} went out!`;
      default:
        return 'Unknown action';
    }
  };

  // Show last 5 actions when collapsed
  const visibleActions = isExpanded ? turnHistory : turnHistory.slice(-5);

  return (
    <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-xl overflow-hidden w-full max-w-xs">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-emerald-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-emerald-400 font-semibold text-sm">Game Log</span>
          <span className="px-1.5 py-0.5 bg-emerald-800 rounded text-emerald-300 text-xs">
            {turnHistory.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-xs">Turn {Math.ceil((turnHistory.length + 1) / 2)}</span>
          <svg
            className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Log entries */}
      <div className={`overflow-hidden transition-all ${isExpanded ? 'max-h-96' : 'max-h-40'}`}>
        <div className="px-3 pb-3 space-y-1 overflow-y-auto max-h-36">
          {visibleActions.length === 0 ? (
            <p className="text-stone-500 text-xs italic py-2">No actions yet</p>
          ) : (
            visibleActions.map((action, i) => (
              <div
                key={i}
                className={`text-xs py-1 px-2 rounded ${
                  action.type === 'go_out'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-stone-400'
                }`}
              >
                {formatAction(action)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
