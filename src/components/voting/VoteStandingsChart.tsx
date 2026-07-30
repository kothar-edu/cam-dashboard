import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VotingPlayerResult } from '@/api/voting';
import { totalVotes, voteShare } from '@/lib/voting';
import { cn } from '@/lib/utils';
import { CHART } from '@/components/charts/chartTheme';
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

  const chartData = standings.slice(0, compact ? 8 : 12).map((player, index) => ({
    id: player.id,
    name: player.full_name,
    shortName:
      player.full_name.length > 18 ? `${player.full_name.slice(0, 16)}…` : player.full_name,
    votes: player.total_votes ?? 0,
    share: voteShare(player.total_votes ?? 0, total),
    fill: index === 0 && hasVotes ? CHART.gold : CHART.navy,
  }));

  const chartHeight = Math.max(compact ? 160 : 220, chartData.length * (compact ? 28 : 36));

  return (
    <div className={cn('space-y-4', className)}>
      {!hasVotes ? (
        <p className="text-xs text-muted-foreground">Nominees listed — no ballots yet.</p>
      ) : null}

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid stroke={CHART.grid} horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: CHART.muted, fontSize: 11 }}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={compact ? 88 : 110}
              tick={{ fill: CHART.navy, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }}
              contentStyle={{
                borderRadius: 8,
                borderColor: CHART.grid,
                fontSize: 12,
              }}
              formatter={(value) => {
                const votes = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${votes} vote${votes === 1 ? '' : 's'}`, 'Votes'];
              }}
              labelFormatter={(label) => String(label)}
            />
            <Bar
              dataKey="votes"
              radius={[0, 6, 6, 0]}
              maxBarSize={compact ? 16 : 22}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={hasVotes ? entry.fill : CHART.grid} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {standings.map((player, index) => {
          const votes = player.total_votes ?? 0;
          const pct = voteShare(votes, total);
          const isLeader = hasVotes && index === 0;
          return (
            <div
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
            >
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
                  <p className="truncate text-sm font-semibold text-[#12233D]">
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
          );
        })}
      </div>

      {hasVotes ? (
        <p className="pt-1 text-right text-[11px] text-muted-foreground">
          {total} total vote{total === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  );
}
