'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { GameBoard } from '@/components/game/GameBoard';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    if (!name) {
      router.push('/');
      return;
    }
    setPlayerName(name);
  }, [searchParams, router]);

  if (!playerName) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center">
        <div className="text-amber-500 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return <GameBoard playerName={playerName} />;
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center">
          <div className="text-amber-500 text-lg animate-pulse">Loading game...</div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
