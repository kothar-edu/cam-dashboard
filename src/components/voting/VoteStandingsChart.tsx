import type { VotingPlayerResult } from '@/api/voting';
import { totalVotes, voteShare } from '@/lib/voting';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

type VoteStandingsChartProps = {
  standings: VotingPlayerResult[];
  emptyLabel?: string;
  compact?: boolean;
  className?: string;
};

export function VoteStandingsChart({
  standings,
  emptyLabel = 'No votes cast yet.',
  compact = false,
  className,
}: VoteStandingsChartProps) {
  const total = totalVotes(standings);
  const hasVotes = total > 0;

  if (!standings.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const maxVotes = Math.max(...standings.map((p) => p.total_votes ?? 0), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {!hasVotes ? (
        <p className="text-xs text-muted-foreground">Nominees listed — no ballots yet.</p>
      ) : null}
      {standings.map((player, index) => {
        const votes = player.total_votes ?? 0;
        const pct = voteShare(votes, total);
        const barPct = Math.round((votes / maxVotes) * 100);
        const isLeader = hasVotes && index === 0;

        return (
          <div key={player.id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    isLeader
                      ? 'bg-[#E8A93B] text-[#12233D]'
                      : 'bg-slate-100 text-muted-foreground'
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate text-sm font-semibold',
                      isLeader ? 'text-[#12233D]' : 'text-[#12233D]/90'
                    )}
                  >
                    {isLeader ? (
                      <Trophy className="mr-1 inline h-3.5 w-3.5 text-[#E8A93B]" />
                    ) : null}
                    {player.full_name}
                  </p>
                  {!compact && player.team_name ? (
                    <p className="truncate text-[11px] text-muted-foreground">{player.team_name}</p>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-[#12233D]">{votes}</p>
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  {hasVotes ? `${pct}%` : '—'}
                </p>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isLeader ? 'bg-[#E8A93B]' : 'bg-[#12233D]'
                )}
                style={{ width: `${hasVotes ? Math.max(barPct, votes > 0 ? 4 : 0) : 0}%` }}
              />
            </div>
          </div>
        );
      })}
      {hasVotes ? (
        <p className="pt-1 text-right text-[11px] text-muted-foreground">
          {total} total vote{total === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  );
}
