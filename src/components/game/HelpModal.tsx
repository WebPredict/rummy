'use client';

import { useState } from 'react';
import { SUIT_COLORS } from '@/lib/game/constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'drawing' | 'melds' | 'jokers' | 'closing' | 'discarding' | 'scoring' | 'tips';

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'drawing', label: 'Drawing', icon: 'M12 4v16m8-8H4' },
  { id: 'melds', label: 'Melds', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'jokers', label: 'Jokers', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'closing', label: 'Closing Melds', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'discarding', label: 'Discarding', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'scoring', label: 'Scoring & Winning', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { id: 'tips', label: 'Tips & Strategy', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!isOpen) return null;

  const SuitBadge = ({ suit, color }: { suit: string; color: string }) => (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {suit}
    </span>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <p>
              <strong className="text-amber-400">8-Suited Rummy</strong> is a card game played with a custom deck of up to 8 unique suits. Each suit has 13 ranked cards (Ace through King) plus one colored Joker.
            </p>
            <p>
              Players take turns drawing cards, forming <strong className="text-amber-400">melds</strong> (runs or sets), and discarding. The goal is to empty your hand by playing all your cards into melds.
            </p>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-3">
                Active Suits This Game
              </h4>
              <div className="flex flex-wrap gap-2">
                <SuitBadge suit="Swords" color={SUIT_COLORS.swords} />
                <SuitBadge suit="Spade" color={SUIT_COLORS.spade} />
                <SuitBadge suit="Cups" color={SUIT_COLORS.cups} />
                <SuitBadge suit="Hearts" color={SUIT_COLORS.hearts} />
              </div>
            </div>

            <div>
              <h4 className="text-amber-400 font-semibold mb-2">Turn Structure</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { num: 1, title: 'Draw', desc: 'From deck or discard pile' },
                  { num: 2, title: 'Play', desc: 'Form melds, add to melds, replace jokers' },
                  { num: 3, title: 'Discard', desc: 'End turn by discarding one card' },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="bg-emerald-800/30 rounded-lg p-3 text-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 font-bold text-sm mx-auto mb-2 flex items-center justify-center">
                      {num}
                    </div>
                    <div className="font-semibold text-stone-200 text-sm">{title}</div>
                    <div className="text-stone-400 text-xs">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'drawing':
        return (
          <div className="space-y-4">
            <p>At the start of your turn, you must draw cards. You have two options:</p>

            <div className="space-y-3">
              <div className="bg-emerald-800/30 rounded-lg p-4">
                <h4 className="text-emerald-400 font-semibold mb-2">Draw from Deck</h4>
                <p className="text-stone-300 text-sm">
                  Click the deck to draw one face-down card. You don&apos;t know what you&apos;ll get, but you only take one card.
                </p>
              </div>

              <div className="bg-amber-800/30 rounded-lg p-4">
                <h4 className="text-amber-400 font-semibold mb-2">Draw from Discard Pile</h4>
                <p className="text-stone-300 text-sm">
                  Click any card in the discard pile to draw it <strong>and all cards above it</strong>. This is useful when you see a card you need, but be careful - you might pick up cards you don&apos;t want!
                </p>
                <p className="text-amber-400/80 text-xs mt-2">
                  Note: You cannot discard the bottom card you picked up from the discard pile on the same turn.
                </p>
              </div>
            </div>
          </div>
        );

      case 'melds':
        return (
          <div className="space-y-4">
            <p>Melds are groups of 3 or more cards played face-up on the table. There are two types:</p>

            <div className="space-y-3">
              <div className="bg-blue-800/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Sets</h4>
                <p className="text-stone-300 text-sm">
                  3 or 4 cards of the <strong>same rank</strong> but <strong>different suits</strong>.
                </p>
                <p className="text-stone-400 text-xs mt-2">Example: 7 of Swords, 7 of Cups, 7 of Hearts</p>
              </div>

              <div className="bg-purple-800/30 rounded-lg p-4">
                <h4 className="text-purple-400 font-semibold mb-2">Runs</h4>
                <p className="text-stone-300 text-sm">
                  3 or more <strong>consecutive cards</strong> of the <strong>same suit</strong>.
                </p>
                <p className="text-stone-400 text-xs mt-2">Example: 5, 6, 7, 8 of Spade</p>
              </div>
            </div>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">Adding to Melds</h4>
              <p className="text-stone-300 text-sm">
                You can add cards to any meld on the table (yours or opponent&apos;s) as long as the meld remains valid. Select a card and click on the meld to add it.
              </p>
            </div>
          </div>
        );

      case 'jokers':
        return (
          <div className="space-y-4">
            <p>Each suit has one Joker card that can substitute for any card in a meld.</p>

            <div className="bg-amber-800/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Using Jokers</h4>
              <p className="text-stone-300 text-sm">
                Jokers are wildcards - include them in a meld to substitute for a missing card. A meld can contain multiple jokers.
              </p>
            </div>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">Replacing Jokers</h4>
              <p className="text-stone-300 text-sm">
                If you have the natural card that a joker is substituting for, you can replace the joker and take it into your hand. This is only possible if the meld is not closed.
              </p>
            </div>

            <div className="bg-red-800/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Joker Penalty</h4>
              <p className="text-stone-300 text-sm">
                <strong>Be careful!</strong> When your opponent goes out, you lose 1 point for each joker still in your hand. Play your jokers quickly!
              </p>
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-4">
            <p>You can &quot;close&quot; your own melds to protect them.</p>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">What Closing Does</h4>
              <p className="text-stone-300 text-sm">
                When you close a meld, neither you nor your opponent can add cards to it or replace its jokers. The meld is locked in its current state.
              </p>
            </div>

            <div className="bg-amber-800/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">When to Close</h4>
              <ul className="text-stone-300 text-sm space-y-1 list-disc list-inside">
                <li>When a meld contains jokers you don&apos;t want replaced</li>
                <li>When you want to prevent opponent from using your melds</li>
                <li>Strategic protection of valuable melds</li>
              </ul>
            </div>
          </div>
        );

      case 'discarding':
        return (
          <div className="space-y-4">
            <p>You must discard exactly one card to end your turn.</p>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">How to Discard</h4>
              <p className="text-stone-300 text-sm">
                Click a card in your hand, then click the &quot;Discard&quot; button (or double-click the card). The card goes to the top of the discard pile.
              </p>
            </div>

            <div className="bg-red-800/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Restriction</h4>
              <p className="text-stone-300 text-sm">
                If you drew from the discard pile, you <strong>cannot discard the bottom card</strong> you picked up on the same turn. You must keep at least that card.
              </p>
            </div>

            <div className="bg-amber-800/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Going Out</h4>
              <p className="text-stone-300 text-sm">
                If discarding leaves you with no cards, you &quot;go out&quot; and win the round!
              </p>
            </div>
          </div>
        );

      case 'scoring':
        return (
          <div className="space-y-4">
            <p>The first player to exceed <strong className="text-amber-400">25 points</strong> wins the game.</p>

            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">Going Out</h4>
              <p className="text-stone-300 text-sm">
                When you go out (empty your hand), you score <strong>1 point for each joker</strong> your opponent is holding. If they have no jokers, you get 1 point.
              </p>
            </div>

            <div className="bg-red-800/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2">Joker Penalty</h4>
              <p className="text-stone-300 text-sm">
                When your opponent goes out, you <strong>lose 1 point for each joker</strong> in your hand. This can make your score go negative!
              </p>
            </div>

            <div className="bg-amber-800/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Winning</h4>
              <p className="text-stone-300 text-sm">
                The game continues across multiple rounds until someone exceeds 25 points. That player wins!
              </p>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-4">
            <div className="bg-emerald-800/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-semibold mb-2">Play Jokers Early</h4>
              <p className="text-stone-300 text-sm">
                Don&apos;t hold jokers too long! They&apos;re worth -1 point each if caught in your hand when opponent goes out.
              </p>
            </div>

            <div className="bg-amber-800/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Watch the Discard Pile</h4>
              <p className="text-stone-300 text-sm">
                Keep an eye on what your opponent discards and picks up. This tells you what they&apos;re collecting!
              </p>
            </div>

            <div className="bg-blue-800/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Use Opponent&apos;s Melds</h4>
              <p className="text-stone-300 text-sm">
                You can add cards to your opponent&apos;s melds too! This is a great way to get rid of cards that don&apos;t fit your plans.
              </p>
            </div>

            <div className="bg-purple-800/30 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2">Close Strategically</h4>
              <p className="text-stone-300 text-sm">
                Close melds with jokers when you&apos;re worried about opponent stealing them, but remember - you can&apos;t add to closed melds either!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-emerald-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-700/50">
          <div>
            <h2 className="text-amber-500 font-bold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Game Rules & Help
            </h2>
            <p className="text-stone-400 text-sm">Everything you need to know to play 8-Suited Rummy</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-800 rounded-lg transition-colors text-stone-400 hover:text-stone-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(85vh-130px)]">
          {/* Sidebar */}
          <div className="w-48 border-r border-emerald-700/50 p-2 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'bg-emerald-700/50 text-emerald-300'
                    : 'text-stone-400 hover:bg-emerald-800/30 hover:text-stone-300'
                  }
                `}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto text-stone-300 text-sm">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-emerald-700/50">
          <button
            onClick={() => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id);
              }
            }}
            disabled={activeTab === tabs[0].id}
            className="text-emerald-400 hover:text-emerald-300 disabled:text-stone-600 disabled:cursor-not-allowed text-sm font-medium"
          >
            &larr; {tabs[tabs.findIndex((t) => t.id === activeTab) - 1]?.label || ''}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              const currentIndex = tabs.findIndex((t) => t.id === activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id);
              }
            }}
            disabled={activeTab === tabs[tabs.length - 1].id}
            className="text-emerald-400 hover:text-emerald-300 disabled:text-stone-600 disabled:cursor-not-allowed text-sm font-medium"
          >
            {tabs[tabs.findIndex((t) => t.id === activeTab) + 1]?.label || ''} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
