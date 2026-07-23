import type { CurrentPlayersState, LiveMatchPlayer } from '@/types/liveMatch';

function BatterRow({ player, active }: { player: LiveMatchPlayer | null; active?: boolean }) {
  if (!player) return null;
  return (
    <div className={`flex h-10 items-center gap-2 text-xl ${active ? 'text-blue-800' : 'text-slate-700'}`}>
      <span className="uppercase">{player.full_name}</span>
      <span className="ml-auto flex items-end gap-1 text-3xl">
        <span>{player.stats.runs_scored}</span>
        <span className="text-xl font-semibold">{player.stats.balls_faced}</span>
      </span>
    </div>
  );
}

function BowlerRow({ player }: { player: LiveMatchPlayer | null }) {
  if (!player) return null;
  return (
    <div className="flex h-10 items-center gap-2 text-xl text-slate-700">
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
};

export function BatterBowlerCards({ currentPlayers }: BatterBowlerCardsProps) {
  return (
    <div className="flex w-full justify-between px-6">
      <div className="flex flex-col gap-1">
        <BatterRow player={currentPlayers.striker} active />
        <BatterRow player={currentPlayers.non_striker} />
      </div>
      <BowlerRow player={currentPlayers.bowler} />
    </div>
  );
}
