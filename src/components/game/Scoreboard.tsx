'use client';

import { GameState } from '@/lib/game/types';
import { WIN_SCORE } from '@/lib/game/constants';

interface ScoreboardProps {
  gameState: GameState;
}

export function Scoreboard({ gameState }: ScoreboardProps) {
  const { player, opponent, roundNumber } = gameState;

  const playerJokers = player.hand.filter((c) => c.isJoker).length;
  const opponentJokers = opponent.hand.filter((c) => c.isJoker).length;

  const playerProgress = Math.min((player.score / WIN_SCORE) * 100, 100);
  const opponentProgress = Math.min((opponent.score / WIN_SCORE) * 100, 100);

  return (
    <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-xl p-4 w-full max-w-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-500 font-bold uppercase tracking-wider text-sm">Scoreboard</h2>
        <span className="px-2 py-1 bg-emerald-800 rounded text-emerald-300 text-xs font-medium">
          Round {roundNumber}
        </span>
      </div>

      {/* Player Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-medium text-sm">{player.name}</span>
          </div>
          <span className="text-emerald-400 font-bold text-lg">{player.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-xs">{player.hand.length} cards</span>
          <div className="flex-1 h-1.5 bg-emerald-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${playerProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Opponent Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium text-sm">{opponent.name}</span>
            <span className="px-1 py-0.5 bg-amber-500/20 rounded text-amber-500 text-[10px] font-medium">
              AI
            </span>
          </div>
          <span className="text-amber-400 font-bold text-lg">{opponent.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-xs">{opponent.hand.length} cards</span>
          {opponentJokers > 0 && (
            <span className="flex items-center gap-0.5 text-amber-400 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" />
              </svg>
              {opponentJokers} held
            </span>
          )}
          <div className="flex-1 h-1.5 bg-amber-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${opponentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Win condition */}
      <div className="pt-3 border-t border-emerald-700/50">
        <p className="text-amber-500/80 text-xs font-medium uppercase tracking-wider mb-1">
          First to exceed {WIN_SCORE} pts wins
        </p>
        <div className="flex items-start gap-1.5 text-stone-400 text-xs">
          <svg className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" />
          </svg>
          <span>-1 pt per joker in hand when opponent goes out</span>
        </div>
      </div>
    </div>
  );
}
