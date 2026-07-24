import { useEffect, useState } from 'react';
import type { CurrentData, LiveOpponent } from '@/types/liveMatch';

const STATS_DURATION_MS = 20000;
const SPONSOR_DURATION_MS = 5000;

type CommentaryBarProps = {
  current: CurrentData;
  battingTeam: LiveOpponent | null | undefined;
  bowlingTeam: LiveOpponent | null | undefined;
  ground: string | null;
  sponsorText: string | null;
};

export function CommentaryBar({ current, battingTeam, bowlingTeam, ground, sponsorText }: CommentaryBarProps) {
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats((prev) => !prev), showStats ? STATS_DURATION_MS : SPONSOR_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showStats]);

  const isEnded = current.status === 'END_OF_MATCH';
  const showStatsSlot = Boolean(battingTeam) && !isEnded && showStats;
  const showSponsorSlot = Boolean(sponsorText) && (!showStats || isEnded);
  const showChase = showStatsSlot && current.required_runs > 0;
  const showProjected = showStatsSlot && current.inning % 2 === 1 && current.balls_remaining > 0 && current.projected > 0;

  return (
    <div className="absolute inset-x-0 bottom-0 flex h-10 w-full items-center justify-center gap-4 bg-blue-950 text-xl font-bold leading-none">
      <div className="flex h-full w-[420px] shrink-0 items-center bg-sky-200/80 px-3 text-lg capitalize text-slate-800">
        <strong className="mr-1">Ground:</strong>
        {ground ?? '—'}
      </div>
      <div className="flex h-full grow items-center justify-center gap-3 overflow-hidden px-2">
        {(showChase || showProjected) && (
          <div key="stats" className="flex animate-in fade-in slide-in-from-bottom-2 items-center gap-3 duration-500">
            {showChase && (
              <>
                <span className="text-white">
                  {current.required_runs} RUNS NEEDED IN {current.balls_remaining} BALLS
                </span>
                <span className="text-white">RRR: {current.rrr}</span>
              </>
            )}
            {showProjected && (
              <span className="rounded-full bg-white/90 px-3 py-0.5 text-sm text-[#12233D]">
                Projected: {current.projected}
              </span>
            )}
          </div>
        )}
        {showSponsorSlot && (
          <div key="sponsor" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="rounded-full bg-yellow-400/90 px-3 py-0.5 text-sm text-blue-950">{sponsorText}</span>
          </div>
        )}
      </div>
      <div className="flex h-full w-[420px] shrink-0 items-center bg-sky-200/80 px-3 text-xl capitalize text-slate-700">
        {battingTeam?.name ?? '—'} vs {bowlingTeam?.name ?? '—'}
      </div>
    </div>
  );
}
