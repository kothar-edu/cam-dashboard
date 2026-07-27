import type { LiveOpponent } from '@/types/liveMatch';
import { cn } from '@/lib/utils';

type TeamLogoBadgeProps = {
  team: LiveOpponent | null | undefined;
  side: 'batting' | 'bowling';
  className?: string;
};

export function TeamLogoBadge({ team, side, className }: TeamLogoBadgeProps) {
  const label = side === 'batting' ? 'Batting' : 'Bowling';
  const code = team?.code ?? '—';
  const name = team?.name ?? (side === 'batting' ? 'Batting team' : 'Bowling team');

  return (
    <div
      data-testid={`team-logo-${side}`}
      className={cn('flex w-[72px] shrink-0 flex-col items-center gap-1', className)}
      title={`${label}: ${name}`}
    >
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
          side === 'batting'
            ? 'bg-[#12233D] text-[#E8A93B]'
            : 'bg-slate-700 text-white'
        )}
      >
        {label}
      </span>
      {team?.logo ? (
        <img
          src={team.logo}
          alt={`${name} logo`}
          className="h-[52px] w-[52px] rounded-md border border-white/40 bg-white object-contain p-0.5 shadow-md"
        />
      ) : (
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-md border border-white/40 bg-white text-center text-xs font-bold uppercase leading-tight text-[#12233D] shadow-md">
          {code}
        </div>
      )}
    </div>
  );
}
