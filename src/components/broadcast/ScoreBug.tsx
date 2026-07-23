import type { CurrentData, LiveOpponent } from '@/types/liveMatch';

type ScoreBugProps = {
  current: CurrentData;
  battingTeam: LiveOpponent | null | undefined;
  bowlingTeam: LiveOpponent | null | undefined;
};

export function ScoreBug({ current, battingTeam, bowlingTeam }: ScoreBugProps) {
  if (current.status === 'END_OF_MATCH') {
    return (
      <div className="flex h-24 w-[420px] items-center justify-center rounded-full bg-blue-950 text-4xl font-bold text-yellow-400">
        Match Ended
      </div>
    );
  }

  return (
    <div className="flex h-24 w-[420px] flex-col rounded-full bg-gradient-to-br from-blue-800 to-blue-950 leading-none text-white">
      <div className="flex h-1/2 items-center justify-center gap-4 px-6 pt-2 text-xl font-bold uppercase">
        <span>{battingTeam?.code ?? bowlingTeam?.code ?? '—'}</span>
        <span className="text-4xl">{current.runs}-{current.wickets}</span>
        <span>{current.over}.{current.ball}</span>
      </div>
      <div className="flex h-1/2 items-center justify-around px-10 text-lg font-bold">
        <span className="text-blue-200/80">CRR: {current.crr}</span>
        <span>{current.target ? `Target: ${current.target}` : `Inning ${current.inning}`}</span>
      </div>
    </div>
  );
}
