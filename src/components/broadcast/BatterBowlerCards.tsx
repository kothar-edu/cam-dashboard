import type { BroadcastSponsor, CurrentPlayersState, LiveMatchPlayer } from '@/types/liveMatch';
import { BallIcon, BatIcon } from '@/components/broadcast/CricketIcons';
import { SponsorShowcase } from '@/components/broadcast/SponsorShowcase';

function BatterRow({ player, active }: { player: LiveMatchPlayer | null; active?: boolean }) {
  if (!player) return null;
  return (
    <div className={`flex h-10 items-center gap-2 text-xl ${active ? 'text-blue-800' : 'text-slate-700'}`}>
      {active && <BatIcon className="h-5 w-5 shrink-0 text-blue-800" />}
      <span className="uppercase">{player.full_name}</span>
      <span className="ml-auto flex items-end gap-1 text-3xl">
        <span>{player.stats.runs_scored}</span>
        <span className="text-xl font-semibold">{player.stats.balls_faced}</span>
      </span>
    </div>
  );
}

/**
 * Exported (rather than kept private like BatterRow) because
 * BroadcastOverlayPage renders it outside this component, directly
 * alongside ScoreBug - grouping it there keeps it snug against the score
 * box instead of pinned to wherever BatterBowlerCards' own flex-1 sponsor
 * slot happens to end.
 */
export function BowlerRow({ player }: { player: LiveMatchPlayer | null }) {
  if (!player) return null;
  return (
    <div className="flex h-10 items-center gap-2 text-xl text-slate-700">
      <BallIcon className="h-5 w-5 shrink-0" />
      <span className="uppercase">{player.full_name}</span>
      <span className="ml-auto flex items-end gap-1 text-3xl">
        <span>{player.stats.wickets_taken}-{player.stats.runs_conceded}</span>
        <span className="text-lg font-semibold">{player.stats.overs_bowled}</span>
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
    <div className="flex w-full items-center px-6">
      <div className="flex shrink-0 flex-col gap-1">
        <BatterRow player={currentPlayers.striker} active />
        <BatterRow player={currentPlayers.non_striker} />
      </div>
      <div className="mx-4 min-w-0 flex-1">
        <SponsorShowcase sponsors={sponsors} />
      </div>
    </div>
  );
}
