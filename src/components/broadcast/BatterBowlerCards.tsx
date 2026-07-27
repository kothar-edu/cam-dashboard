import type { BroadcastSponsor, CurrentPlayersState, LiveMatchPlayer } from '@/types/liveMatch';
import { BallIcon, BatIcon } from '@/components/broadcast/CricketIcons';
import { SponsorShowcase } from '@/components/broadcast/SponsorShowcase';

function BatterRow({ player, active }: { player: LiveMatchPlayer | null; active?: boolean }) {
  if (!player) return null;
  return (
    <div
      className={`flex min-h-11 items-center gap-2.5 ${active ? 'text-blue-900' : 'text-slate-700'}`}
    >
      {active && <BatIcon className="h-7 w-7 shrink-0 text-blue-800" />}
      <span className="max-w-[280px] truncate text-2xl font-semibold uppercase tracking-wide leading-tight">
        {player.full_name}
      </span>
      <span className="ml-auto flex shrink-0 items-end gap-1.5 text-3xl font-bold tabular-nums leading-none">
        <span>{player.stats.runs_scored}</span>
        <span className="pb-0.5 text-xl font-semibold text-slate-600">
          {player.stats.balls_faced}
        </span>
      </span>
    </div>
  );
}

export function BowlerRow({ player }: { player: LiveMatchPlayer | null }) {
  if (!player) return null;
  return (
    <div className="flex min-h-11 items-center gap-2.5 text-slate-800">
      <BallIcon className="h-5 w-5 shrink-0" />
      <span className="max-w-[220px] truncate text-2xl font-semibold uppercase tracking-wide leading-tight">
        {player.full_name}
      </span>
      <span className="ml-auto flex shrink-0 items-end gap-1.5 text-3xl font-bold tabular-nums leading-none">
        <span>
          {player.stats.wickets_taken}-{player.stats.runs_conceded}
        </span>
        <span className="pb-0.5 text-lg font-semibold text-slate-600">
          {player.stats.overs_bowled}
        </span>
      </span>
    </div>
  );
}

type BatterBowlerCardsProps = {
  currentPlayers: CurrentPlayersState;
  sponsors?: BroadcastSponsor[];
};

export function BatterBowlerCards({ currentPlayers, sponsors = [] }: BatterBowlerCardsProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="flex shrink-0 flex-col gap-1 pr-6">
        <BatterRow player={currentPlayers.striker} active />
        <BatterRow player={currentPlayers.non_striker} />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end pr-1">
        <SponsorShowcase sponsors={sponsors} />
      </div>
    </div>
  );
}
