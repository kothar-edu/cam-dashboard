import { useEffect, useState, type ReactNode } from 'react';
import type { CareerStats, LiveMatchPlayer, PlayerRole } from '@/types/liveMatch';
import type { PlayerChangeFlash as PlayerChangeFlashState } from '@/lib/liveMatchReducer';
import { cn } from '@/lib/utils';

const FLASH_DURATION_MS = 5000;

type PlayerChangeFlashProps = {
  playerChange: PlayerChangeFlashState | null;
};

export function PlayerChangeFlash({ playerChange }: PlayerChangeFlashProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!playerChange || (!playerChange.playerIn && !playerChange.playerOut)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [playerChange]);

  if (!visible || !playerChange) return null;

  return (
    <div
      data-testid="player-change-flash"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/35 px-16"
    >
      <div className="flex max-w-[1600px] items-stretch gap-10">
        {playerChange.playerOut ? (
          <PlayerStatsCard
            action="out"
            player={playerChange.playerOut}
            role={playerChange.playerRole}
          />
        ) : null}
        {playerChange.playerIn ? (
          <PlayerStatsCard
            action="in"
            player={playerChange.playerIn}
            role={playerChange.playerRole}
            showCareer
          />
        ) : null}
      </div>
    </div>
  );
}

function PlayerStatsCard({
  action,
  player,
  role,
  showCareer = false,
}: {
  action: 'in' | 'out';
  player: LiveMatchPlayer;
  role: PlayerRole;
  showCareer?: boolean;
}) {
  const isBatter = role === 'striker' || role === 'non_striker';
  const career = showCareer ? player.career_stats : null;
  const hasCareer = Boolean(career);

  return (
    <article
      className={cn(
        'w-[420px] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 text-white shadow-2xl backdrop-blur-sm',
        action === 'in' ? 'ring-2 ring-emerald-400/50' : 'ring-2 ring-red-400/40'
      )}
    >
      <header
        className={cn(
          'px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.2em]',
          action === 'in' ? 'bg-emerald-600' : 'bg-red-700'
        )}
      >
        Player {action}
      </header>

      <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-5">
        <img
          src={player.picture || '/static/player.jpg'}
          alt=""
          className="h-24 w-24 rounded-full border-2 border-white/20 bg-white object-cover"
        />
        <h3 className="text-center text-2xl font-bold uppercase leading-tight tracking-wide">
          {player.full_name}
        </h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {roleLabel(role)}
        </p>
      </div>

      <div className={cn('grid gap-3 px-5 pb-5', hasCareer ? 'grid-cols-2' : 'grid-cols-1')}>
        <StatsColumn label="This game">
          {isBatter ? (
            <>
              <StatsRow title="Runs" value={player.stats.runs_scored} />
              <StatsRow title="Balls" value={player.stats.balls_faced} />
              <StatsRow title="Fours" value={player.stats.fours} />
              <StatsRow title="Sixes" value={player.stats.sixes} />
              <StatsRow title="SR" value={formatRate(player.stats.srr || player.stats.crr)} />
            </>
          ) : (
            <>
              <StatsRow title="Overs" value={player.stats.overs_bowled} />
              <StatsRow title="Wickets" value={player.stats.wickets_taken} />
              <StatsRow title="Runs" value={player.stats.runs_conceded} />
              <StatsRow title="Maidens" value={player.stats.maidens} />
              <StatsRow title="Econ" value={formatRate(player.stats.err)} />
            </>
          )}
        </StatsColumn>

        {hasCareer && career ? <CareerColumn isBatter={isBatter} career={career} /> : null}
      </div>
    </article>
  );
}

function CareerColumn({ isBatter, career }: { isBatter: boolean; career: CareerStats }) {
  return (
    <StatsColumn label="Career">
      {isBatter ? (
        <>
          <StatsRow title="Runs" value={career.runs_scored} />
          <StatsRow title="Fours" value={career.fours} />
          <StatsRow title="Sixes" value={career.sixes} />
          <StatsRow title="Matches" value={career.matches_played} />
        </>
      ) : (
        <>
          <StatsRow title="Wickets" value={career.wickets_taken} />
          <StatsRow title="Maidens" value={career.maidens} />
          <StatsRow title="Matches" value={career.matches_played} />
        </>
      )}
    </StatsColumn>
  );
}

function StatsColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="bg-white/10 px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#E8A93B]">
        {label}
      </div>
      <div className="divide-y divide-white/10 px-3 py-1">{children}</div>
    </div>
  );
}

function StatsRow({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-white/60">{title}</span>
      <span className="font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

function roleLabel(role: PlayerRole) {
  switch (role) {
    case 'striker':
      return 'Striker';
    case 'non_striker':
      return 'Non-striker';
    case 'bowler':
      return 'Bowler';
    case 'wicket_keeper':
      return 'Wicket keeper';
    default:
      return role;
  }
}

function formatRate(value: number) {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toFixed(2);
}
