import { useEffect, useState } from 'react';
import type { CurrentData, LiveOpponent } from '@/types/liveMatch';
import { MarqueeBox } from '@/components/broadcast/MarqueeBox';

const STATS_DURATION_MS = 20000;
const SPONSOR_DURATION_MS = 5000;

type CommentaryBarProps = {
  current: CurrentData;
  battingTeam: LiveOpponent | null | undefined;
  bowlingTeam: LiveOpponent | null | undefined;
  ground: string | null;
  sponsorText: string | null;
};

function TeamLabel({ team, muted }: { team: LiveOpponent | null | undefined; muted?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center gap-1.5 ${muted ? 'font-semibold text-slate-500' : 'font-extrabold text-[#12233D]'}`}>
      {team?.logo && <img src={team.logo} alt={`${team.name} logo`} className="h-6 w-6 shrink-0 rounded-full bg-white object-cover" />}
      {team?.name ?? '—'}
    </span>
  );
}

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
      <div className="flex h-full w-[420px] shrink-0 items-center gap-1 bg-sky-200/80 px-3 text-lg capitalize text-slate-800">
        <strong className="shrink-0">Ground:</strong>
        <div className="min-w-0 flex-1">
          <MarqueeBox measureKey={ground ?? ''}>
            <span className="shrink-0 whitespace-nowrap">{ground ?? '—'}</span>
          </MarqueeBox>
        </div>
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
              <div className="max-w-[520px] rounded-full bg-white/90 px-3 py-0.5 text-sm text-[#12233D]">
                <MarqueeBox measureKey={current.projected}>
                  <span className="shrink-0 whitespace-nowrap">Projected: {current.projected}</span>
                </MarqueeBox>
              </div>
            )}
          </div>
        )}
        {showSponsorSlot && (
          <div key="sponsor" className="max-w-[700px] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="rounded-full bg-yellow-400/90 px-3 py-0.5 text-sm text-blue-950">
              <MarqueeBox measureKey={sponsorText ?? ''}>
                <span className="shrink-0 whitespace-nowrap">{sponsorText}</span>
              </MarqueeBox>
            </div>
          </div>
        )}
      </div>
      <div className="flex h-full w-[420px] shrink-0 items-center bg-sky-200/80 px-3 text-xl capitalize text-slate-700">
        <div className="min-w-0 flex-1">
          <MarqueeBox measureKey={`${battingTeam?.name ?? ''}-${bowlingTeam?.name ?? ''}`}>
            <TeamLabel team={battingTeam} />
            <span className="mx-2 shrink-0 lowercase text-slate-500">vs</span>
            <TeamLabel team={bowlingTeam} muted />
          </MarqueeBox>
        </div>
      </div>
    </div>
  );
}
