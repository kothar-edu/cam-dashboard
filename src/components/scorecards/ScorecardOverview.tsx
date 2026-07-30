import type { FixtureDetail, LineupEntry } from '@/api/fixtures';
import { ComparisonBar, DualMetricBars, VerticalBarChart } from '@/components/scorecards/ScoreBars';
import {
  ballsToOvers,
  battingFaced,
  bowlingFigures,
  economyRate,
  formatInningsScoreWithOvers,
  formatMatchDateTime,
  getResultSummary,
  manOfTheMatchName,
  matchOutcomeLabel,
  strikeRate,
  topBatters,
  topBowlers,
} from '@/lib/scorecard';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Star, Trophy } from 'lucide-react';

type ScorecardOverviewProps = {
  data: FixtureDetail;
};

function TeamName({
  name,
  highlight,
  align = 'left',
}: {
  name: string;
  highlight?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <p
      className={cn(
        'text-sm font-semibold sm:text-base',
        highlight ? 'text-[#E8A93B]' : 'text-white',
        align === 'right' && 'text-right'
      )}
    >
      {name}
    </p>
  );
}

function InningsTable({
  title,
  batting,
  bowling,
}: {
  title: string;
  batting: LineupEntry[];
  bowling: LineupEntry[];
}) {
  const batRows = battingFaced(batting);
  const bowlRows = bowlingFigures(bowling);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b bg-[#12233D] px-4 py-2.5 text-sm font-semibold text-white">
        {title}
      </div>

      <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Batting
      </div>
      {batRows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Batter</th>
                <th className="px-3 py-2 text-right font-medium">R</th>
                <th className="px-3 py-2 text-right font-medium">B</th>
                <th className="px-3 py-2 text-right font-medium">4s</th>
                <th className="px-3 py-2 text-right font-medium">6s</th>
                <th className="px-3 py-2 text-right font-medium">SR</th>
              </tr>
            </thead>
            <tbody>
              {batRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">
                    <span className="font-medium text-[#12233D]">{row.player.full_name}</span>
                    {!row.dismissed ? (
                      <span className="ml-1.5 text-[10px] font-semibold uppercase text-emerald-600">
                        not out
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {row.runs_scored}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {row.balls_faced}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.fours}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.sixes}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {strikeRate(row.runs_scored, row.balls_faced)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-3 text-sm text-muted-foreground">No batting figures recorded.</p>
      )}

      <div className="border-y bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Bowling
      </div>
      {bowlRows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Bowler</th>
                <th className="px-3 py-2 text-right font-medium">O</th>
                <th className="px-3 py-2 text-right font-medium">M</th>
                <th className="px-3 py-2 text-right font-medium">R</th>
                <th className="px-3 py-2 text-right font-medium">W</th>
                <th className="px-3 py-2 text-right font-medium">Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowlRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-[#12233D]">{row.player.full_name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {ballsToOvers(row.balls_thrown)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.maidens}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.runs_conceded}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {row.wickets_taken}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {economyRate(row.runs_conceded, row.balls_thrown)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-3 text-sm text-muted-foreground">No bowling figures recorded.</p>
      )}
    </div>
  );
}

export function ScorecardOverview({ data }: ScorecardOverviewProps) {
  const summary = getResultSummary(data);
  const scoreA = summary?.opponent_a;
  const scoreB = summary?.opponent_b;
  const outcome = matchOutcomeLabel(data);
  const motm = manOfTheMatchName(data.man_of_the_match);
  const teamA = data.opponent_a.team.name;
  const teamB = data.opponent_b.team.name;
  const winnerId = data.winner?.id;
  const lineupsA = data.lineups_a ?? [];
  const lineupsB = data.lineups_b ?? [];
  const allLineups = [...lineupsA, ...lineupsB];
  const batters = topBatters(allLineups, 6);
  const bowlers = topBowlers(allLineups, 5);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#12233D] via-[#1a3358] to-[#0f1c30] px-5 py-5 text-white sm:px-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/70">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5">
              {data.tournament?.name ?? 'Custom match'}
            </span>
            {data.round ? (
              <span className="rounded-full bg-[#E8A93B]/20 px-2.5 py-0.5 text-[#E8A93B]">
                {data.round}
              </span>
            ) : null}
            {data.dls ? (
              <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-sky-200">DLS</span>
            ) : null}
            {data.over_limit ? (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5">
                {data.over_limit} overs
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <TeamName name={teamA} highlight={winnerId === data.opponent_a.id} />
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {formatInningsScoreWithOvers(scoreA)}
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/35">
              vs
            </span>
            <div>
              <TeamName name={teamB} highlight={winnerId === data.opponent_b.id} align="right" />
              <p className="mt-1 text-right text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {formatInningsScoreWithOvers(scoreB)}
              </p>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#E8A93B]">
            <Trophy className="h-4 w-4 shrink-0" />
            {outcome}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatMatchDateTime(data.time)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {data.ground ?? 'Venue TBC'}
            </span>
            {motm ? (
              <span className="inline-flex items-center gap-1.5 text-[#E8A93B]">
                <Star className="h-3.5 w-3.5 fill-current" />
                Man of the Match: {motm}
              </span>
            ) : null}
          </div>
        </div>

        {scoreA && scoreB ? (
          <div className="border-t px-5 py-4 sm:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Runs comparison
            </p>
            <ComparisonBar
              labelA={teamA}
              labelB={teamB}
              valueA={scoreA.runs_scored}
              valueB={scoreB.runs_scored}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip label={`${teamA} wickets`} value={String(scoreA.wickets_lost)} />
              <StatChip label={`${teamB} wickets`} value={String(scoreB.wickets_lost)} />
              <StatChip label={`${teamA} overs`} value={String(scoreA.overs_bowled)} />
              <StatChip label={`${teamB} overs`} value={String(scoreB.overs_bowled)} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Top run scorers</h3>
          <p className="mb-4 text-xs text-muted-foreground">Runs across both innings</p>
          <VerticalBarChart
            color="#12233D"
            items={batters.map((b) => ({
              id: b.id,
              label: b.player.full_name.split(' ').slice(-1)[0] ?? b.player.full_name,
              value: b.runs_scored,
              sublabel: `${b.balls_faced}b`,
            }))}
            emptyLabel="No batting stats recorded."
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-semibold text-[#12233D]">Bowling impact</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Wickets (navy) · runs conceded (gold)
          </p>
          <DualMetricBars
            items={bowlers.map((b) => ({
              id: b.id,
              label: b.player.full_name,
              primary: b.wickets_taken,
              secondary: b.runs_conceded,
              primaryLabel: `${b.wickets_taken} wkt${b.wickets_taken === 1 ? '' : 's'}`,
              secondaryLabel: `${b.runs_conceded} runs · ${ballsToOvers(b.balls_thrown)} ov`,
            }))}
            emptyLabel="No bowling stats recorded."
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InningsTable title={`${teamA} innings`} batting={lineupsA} bowling={lineupsB} />
        <InningsTable title={`${teamB} innings`} batting={lineupsB} bowling={lineupsA} />
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#12233D]">{value}</p>
    </div>
  );
}
