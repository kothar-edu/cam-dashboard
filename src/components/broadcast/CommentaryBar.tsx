import type { CurrentData, LiveOpponent } from '@/types/liveMatch';

type CommentaryBarProps = {
  current: CurrentData;
  battingTeam: LiveOpponent | null | undefined;
  bowlingTeam: LiveOpponent | null | undefined;
  ground: string | null;
  sponsorText: string | null;
};

export function CommentaryBar({ current, battingTeam, bowlingTeam, ground, sponsorText }: CommentaryBarProps) {
  const showChase = Boolean(battingTeam) && current.status !== 'END_OF_MATCH' && current.required_runs > 0;

  return (
    <div className="flex h-10 w-full items-center justify-center gap-4 bg-blue-950 text-xl font-bold leading-none">
      <div className="flex h-full w-[420px] shrink-0 items-center bg-sky-200/80 px-3 text-lg capitalize text-slate-800">
        <strong className="mr-1">Ground:</strong>
        {ground ?? '—'}
      </div>
      <div className="flex grow items-center gap-4 px-2 text-white">
        {showChase ? (
          <>
            <span>{current.required_runs} RUNS NEEDED IN {current.balls_remaining} BALLS</span>
            <span>RRR: {current.rrr}</span>
          </>
        ) : sponsorText ? (
          <span>{sponsorText}</span>
        ) : null}
      </div>
      <div className="flex h-full w-[420px] shrink-0 items-center bg-sky-200/80 px-3 text-xl capitalize text-slate-700">
        {battingTeam?.name ?? '—'} vs {bowlingTeam?.name ?? '—'}
      </div>
    </div>
  );
}
