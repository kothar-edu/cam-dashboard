import type { ReactNode } from 'react';
import type { PointsTableRow, TournamentPlayerStats } from '@/api/points';
import { DualMetricBars, VerticalBarChart } from '@/components/scorecards/ScoreBars';
import {
  computeHighlights,
  formatNrr,
  playerDisplayName,
  sortStandings,
  teamShortName,
} from '@/lib/pointsTable';
import { Trophy, TrendingUp, Target, Crosshair } from 'lucide-react';

type PointsStatsPanelProps = {
  rows: PointsTableRow[];
  topBatters?: TournamentPlayerStats[];
  topBowlers?: TournamentPlayerStats[];
};

function HighlightCard({
  icon,
  label,
  title,
  subtitle,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-[#E8A93B]">{icon}</span>
        {label}
      </div>
      <p className="truncate text-sm font-semibold text-[#12233D]">{title}</p>
      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function PointsStatsPanel({ rows, topBatters = [], topBowlers = [] }: PointsStatsPanelProps) {
  const sorted = sortStandings(rows);
  const highlights = computeHighlights(rows);
  const chartRows = sorted.slice(0, 8);

  if (!rows.length) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {highlights.leader ? (
          <HighlightCard
            icon={<Trophy className="h-3.5 w-3.5" />}
            label="Table leader"
            title={highlights.leader.team.name}
            subtitle={`${highlights.leader.points} pts · ${highlights.leader.matches_won}W`}
          />
        ) : null}
        {highlights.bestNrr ? (
          <HighlightCard
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Best NRR"
            title={highlights.bestNrr.team.name}
            subtitle={formatNrr(highlights.bestNrr.nrr)}
          />
        ) : null}
        {highlights.mostRuns ? (
          <HighlightCard
            icon={<Target className="h-3.5 w-3.5" />}
            label="Most runs"
            title={highlights.mostRuns.team.name}
            subtitle={`${highlights.mostRuns.runs_scored ?? 0} scored · ${highlights.mostRuns.runs_conceded ?? 0} conceded`}
          />
        ) : null}
        {highlights.mostWickets ? (
          <HighlightCard
            icon={<Crosshair className="h-3.5 w-3.5" />}
            label="Most wickets"
            title={highlights.mostWickets.team.name}
            subtitle={`${highlights.mostWickets.wickets_taken ?? 0} taken · ${highlights.mostWickets.wickets_lost ?? 0} lost`}
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Points race</h3>
          <p className="mb-4 text-xs text-muted-foreground">League points by team</p>
          <VerticalBarChart
            color="#12233D"
            items={chartRows.map((row) => ({
              id: row.id,
              label: teamShortName(row.team.code || row.team.name, 6),
              value: row.points,
              sublabel: `${row.matches_won}W`,
            }))}
            emptyLabel="No points recorded."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Net run rate</h3>
          <p className="mb-4 text-xs text-muted-foreground">NRR comparison across the table</p>
          <DualMetricBars
            primaryColor="#12233D"
            secondaryColor="#E8A93B"
            items={chartRows.map((row) => ({
              id: row.id,
              label: row.team.name,
              primary: Math.max(row.nrr, 0),
              secondary: Math.abs(Math.min(row.nrr, 0)),
              primaryLabel: formatNrr(row.nrr),
              secondaryLabel:
                row.nrr < 0 ? 'negative' : row.nrr > 0 ? 'positive' : 'even',
            }))}
            emptyLabel="No NRR data."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Runs for vs against</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Runs scored (navy) · runs conceded (gold)
          </p>
          <DualMetricBars
            items={chartRows.map((row) => ({
              id: row.id,
              label: row.team.name,
              primary: row.runs_scored ?? 0,
              secondary: row.runs_conceded ?? 0,
              primaryLabel: `${row.runs_scored ?? 0} RF`,
              secondaryLabel: `${row.runs_conceded ?? 0} RA`,
            }))}
            emptyLabel="No run totals yet."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Wickets taken</h3>
          <p className="mb-4 text-xs text-muted-foreground">Bowling impact by team</p>
          <VerticalBarChart
            color="#E8A93B"
            items={chartRows.map((row) => ({
              id: row.id,
              label: teamShortName(row.team.code || row.team.name, 6),
              value: row.wickets_taken ?? 0,
              sublabel: `${row.wickets_lost ?? 0} lost`,
            }))}
            emptyLabel="No wicket data yet."
          />
        </div>
      </div>

      {(topBatters.length > 0 || topBowlers.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <PlayerLeadersCard
            title="Top run scorers"
            subtitle="Tournament batting leaders"
            players={topBatters}
            metric={(p) => p.stats.total_runs_scored ?? 0}
            formatMetric={(p) =>
              `${p.stats.total_runs_scored ?? 0} runs · ${p.stats.matches_played ?? 0} inns`
            }
          />
          <PlayerLeadersCard
            title="Top wicket takers"
            subtitle="Tournament bowling leaders"
            players={topBowlers}
            metric={(p) => p.stats.total_wickets_taken ?? 0}
            formatMetric={(p) =>
              `${p.stats.total_wickets_taken ?? 0} wkts · ${p.stats.total_runs_conceded ?? 0} runs`
            }
          />
        </div>
      )}
    </div>
  );
}

export function PlayerLeadersCard({
  title,
  subtitle,
  players,
  metric,
  formatMetric,
}: {
  title: string;
  subtitle: string;
  players: TournamentPlayerStats[];
  metric: (p: TournamentPlayerStats) => number;
  formatMetric: (p: TournamentPlayerStats) => string;
}) {
  const max = Math.max(...players.map(metric), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="mb-1 text-sm font-semibold text-[#12233D]">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
      <div className="space-y-3">
        {players.map((player, index) => {
          const value = metric(player);
          const pct = Math.round((value / max) * 100);
          return (
            <div key={player.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-medium text-[#12233D]">
                  <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                  {playerDisplayName(player)}
                  {player.current_team?.name ? (
                    <span className="ml-1 font-normal text-muted-foreground">
                      · {player.current_team.name}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {formatMetric(player)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#12233D]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
