'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      router.push(`/game?name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col items-center justify-center p-4">
      {/* Felt texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-noise" />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500 tracking-wider mb-2">
            8-Suited
          </h1>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 tracking-tight">
            RUMMY
          </h2>
          <p className="text-stone-400 mt-4">
            A classic card game with custom suits and wild jokers
          </p>
        </div>

        {/* Card decoration */}
        <div className="flex justify-center gap-2 mb-8">
          {['swords', 'spade', 'cups', 'hearts'].map((suit, i) => (
            <div
              key={suit}
              className="w-12 h-16 rounded-lg bg-stone-100 border-2 border-stone-300 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
              style={{
                transform: `rotate(${(i - 1.5) * 8}deg)`,
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{
                  color:
                    suit === 'swords'
                      ? '#eab308'
                      : suit === 'spade'
                      ? '#f97316'
                      : suit === 'cups'
                      ? '#3b82f6'
                      : '#ec4899',
                }}
              >
                {suit === 'swords' ? '/' : suit === 'spade' ? '^' : suit === 'cups' ? 'U' : '<3'}
              </span>
            </div>
          ))}
        </div>

        {/* Name input form */}
        <form onSubmit={handleStart} className="bg-emerald-900/50 border border-emerald-700/50 rounded-xl p-6 backdrop-blur-sm">
          <label className="block text-left mb-2">
            <span className="text-emerald-400 text-sm font-medium uppercase tracking-wider">
              Your Name
            </span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-emerald-950/50 border border-emerald-600/50 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            maxLength={20}
            autoFocus
          />

          <button
            type="submit"
            disabled={!playerName.trim()}
            className={`
              w-full mt-4 py-3 rounded-lg font-bold text-lg uppercase tracking-wider transition-all
              ${playerName.trim()
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }
            `}
          >
            Start Game
          </button>
        </form>

        {/* Quick rules */}
        <div className="mt-8 text-left bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-4">
          <h3 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Quick Rules
          </h3>
          <ul className="text-stone-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500">1.</span>
              Draw from deck or discard pile
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">2.</span>
              Form melds (3+ cards: sets or runs)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">3.</span>
              Discard one card to end your turn
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500">4.</span>
              First to exceed 25 points wins!
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-8 text-stone-500 text-xs">
          Play against AI opponent
        </p>
      </div>
    </div>
  );
}
