import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { StandingsTable } from '@/components/points/StandingsTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Fixture } from '@/api/fixtures';
import type { TournamentPlayerStats } from '@/api/points';
import { useFixtures } from '@/hooks/useFixtures';
import { usePointsTable, useTournamentPlayerStats } from '@/hooks/usePointsTable';
import { useTournament } from '@/hooks/useTournaments';
import { playerDisplayName } from '@/lib/pointsTable';
import { cn } from '@/lib/utils';

const MATCHES_PAGE_SIZE = 20;
const STATS_LIMIT = 50;

type DetailTab = 'stats' | 'matches' | 'table';
type StatsCategoryId =
  | 'most-runs'
  | 'batting-avg'
  | 'strike-rate'
  | 'hundreds'
  | 'fifties'
  | 'fours'
  | 'sixes'
  | 'most-wickets'
  | 'economy'
  | 'maidens';

type StatsColumn = {
  id: string;
  header: string;
  align?: 'left' | 'right';
  cell: (player: TournamentPlayerStats) => ReactNode;
};

type StatsCategory = {
  id: StatsCategoryId;
  label: string;
  group: 'batting' | 'bowling';
  ordering: string;
  columns: StatsColumn[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return '—';
  return digits > 0 ? value.toFixed(digits) : String(value);
}

function matchLabel(fixture: Fixture) {
  return `${fixture.opponent_a.team_name} vs ${fixture.opponent_b.team_name}`;
}

function scheduleStatus(start: string, end: string, isActive: boolean) {
  if (!isActive) return 'Inactive';
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isFinite(startMs) && now < startMs) return 'Upcoming';
  if (Number.isFinite(endMs) && now > endMs) return 'Ended';
  return 'Running';
}

const playerColumn: StatsColumn = {
  id: 'player',
  header: 'Player',
  cell: (player) => (
    <div className="min-w-0">
      <p className="truncate font-medium text-[#12233D]">{playerDisplayName(player)}</p>
      {player.current_team?.name ? (
        <p className="truncate text-[11px] text-muted-foreground">{player.current_team.name}</p>
      ) : null}
    </div>
  ),
};

const STAT_CATEGORIES: StatsCategory[] = [
  {
    id: 'most-runs',
    label: 'Most Runs',
    group: 'batting',
    ordering: '-total_runs_scored',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
      {
        id: 'avg',
        header: 'Avg',
        align: 'right',
        cell: (p) => formatNumber(p.stats.batting_average, 2),
      },
      {
        id: 'sr',
        header: 'SR',
        align: 'right',
        cell: (p) => formatNumber(p.stats.best_strike_rate, 2),
      },
      {
        id: 'fours',
        header: '4s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_fours),
      },
      {
        id: 'sixes',
        header: '6s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_sixes),
      },
    ],
  },
  {
    id: 'batting-avg',
    label: 'Best Batting Average',
    group: 'batting',
    ordering: '-batting_average',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
      {
        id: 'avg',
        header: 'Avg',
        align: 'right',
        cell: (p) => formatNumber(p.stats.batting_average, 2),
      },
    ],
  },
  {
    id: 'strike-rate',
    label: 'Best Strike Rate',
    group: 'batting',
    ordering: '-best_strike_rate',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
      {
        id: 'sr',
        header: 'SR',
        align: 'right',
        cell: (p) => formatNumber(p.stats.best_strike_rate, 2),
      },
    ],
  },
  {
    id: 'hundreds',
    label: 'Most Hundreds',
    group: 'batting',
    ordering: '-hundreds',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'hundreds',
        header: '100s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.hundreds),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
    ],
  },
  {
    id: 'fifties',
    label: 'Most Fifties',
    group: 'batting',
    ordering: '-fifties',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'fifties',
        header: '50s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.fifties),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
    ],
  },
  {
    id: 'fours',
    label: 'Most Fours',
    group: 'batting',
    ordering: '-total_fours',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'fours',
        header: '4s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_fours),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
    ],
  },
  {
    id: 'sixes',
    label: 'Most Sixes',
    group: 'batting',
    ordering: '-total_sixes',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'sixes',
        header: '6s',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_sixes),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_scored),
      },
    ],
  },
  {
    id: 'most-wickets',
    label: 'Most Wickets',
    group: 'bowling',
    ordering: '-total_wickets_taken',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'wickets',
        header: 'Wkts',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_wickets_taken),
      },
      {
        id: 'runs',
        header: 'Runs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_runs_conceded),
      },
      {
        id: 'overs',
        header: 'Overs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_overs_bowled, 1),
      },
      {
        id: 'economy',
        header: 'Econ',
        align: 'right',
        cell: (p) => formatNumber(p.stats.best_bowling_economy, 2),
      },
    ],
  },
  {
    id: 'economy',
    label: 'Best Economy',
    group: 'bowling',
    ordering: 'best_bowling_economy',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'overs',
        header: 'Overs',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_overs_bowled, 1),
      },
      {
        id: 'economy',
        header: 'Econ',
        align: 'right',
        cell: (p) => formatNumber(p.stats.best_bowling_economy, 2),
      },
      {
        id: 'wickets',
        header: 'Wkts',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_wickets_taken),
      },
    ],
  },
  {
    id: 'maidens',
    label: 'Most Maidens',
    group: 'bowling',
    ordering: '-total_maidens',
    columns: [
      playerColumn,
      {
        id: 'matches',
        header: 'Matches',
        align: 'right',
        cell: (p) => formatNumber(p.stats.matches_played),
      },
      {
        id: 'maidens',
        header: 'Maidens',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_maidens),
      },
      {
        id: 'wickets',
        header: 'Wkts',
        align: 'right',
        cell: (p) => formatNumber(p.stats.total_wickets_taken),
      },
    ],
  },
];

const BATTING_CATEGORIES = STAT_CATEGORIES.filter((c) => c.group === 'batting');
const BOWLING_CATEGORIES = STAT_CATEGORIES.filter((c) => c.group === 'bowling');

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<DetailTab>('stats');
  const [statsCategoryId, setStatsCategoryId] = useState<StatsCategoryId>('most-runs');
  const [pageIndex, setPageIndex] = useState(0);

  const category = useMemo(
    () => STAT_CATEGORIES.find((item) => item.id === statsCategoryId) ?? STAT_CATEGORIES[0],
    [statsCategoryId]
  );

  const tournamentQuery = useTournament(id);
  const pointsQuery = usePointsTable(id ?? null);
  const fixturesQuery = useFixtures(
    {
      tournament: id,
      limit: MATCHES_PAGE_SIZE,
      offset: pageIndex * MATCHES_PAGE_SIZE,
    },
    { enabled: !!id && tab === 'matches' }
  );
  const statsQuery = useTournamentPlayerStats(id ?? null, {
    limit: STATS_LIMIT,
    ordering: category.ordering,
  });

  const status = tournamentQuery.data
    ? scheduleStatus(
        tournamentQuery.data.start,
        tournamentQuery.data.end,
        tournamentQuery.data.is_active
      )
    : null;

  return (
    <TenantRequired message="Choose a tenant from the header to load tournament stats.">
      <div className="space-y-5">
        {tournamentQuery.isLoading && !tournamentQuery.data ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : tournamentQuery.isError || !tournamentQuery.data ? (
          <>
            <PageHeader
              title="Tournament"
              backTo="/dashboard/tournaments"
              backLabel="Back to tournaments"
            />
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              Unable to load tournament. Check your API connection and tenant access.
            </div>
          </>
        ) : (
          <>
            <PageHeader
              title={tournamentQuery.data.name}
              description={`${tournamentQuery.data.total_teams} teams · ${formatDate(
                tournamentQuery.data.start
              )} – ${formatDate(tournamentQuery.data.end)} · ${status}`}
              backTo="/dashboard/tournaments"
              backLabel="Back to tournaments"
              action={
                <Link
                  to={`/dashboard/tournaments/${tournamentQuery.data.id}`}
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#12233D] sm:w-auto"
                >
                  Edit tournament
                </Link>
              }
            />

            <div
              role="tablist"
              aria-label="Tournament sections"
              className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
            >
              <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>
                Stats
              </TabButton>
              <TabButton active={tab === 'matches'} onClick={() => setTab('matches')}>
                Matches
              </TabButton>
              <TabButton active={tab === 'table'} onClick={() => setTab('table')}>
                Table
              </TabButton>
            </div>

            {tab === 'matches' ? (
              fixturesQuery.isError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                  Unable to load matches for this tournament.
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      id: 'match',
                      header: 'Match',
                      cell: (row) => (
                        <Link
                          to={
                            row.status === 'Ended'
                              ? `/dashboard/scorecards/${row.id}`
                              : `/dashboard/fixtures/${row.id}`
                          }
                          className="font-medium text-[#12233D] underline-offset-2 hover:underline"
                        >
                          {matchLabel(row)}
                        </Link>
                      ),
                    },
                    { id: 'round', header: 'Round', cell: (row) => row.round ?? '—' },
                    { id: 'status', header: 'Status', cell: (row) => row.status },
                    {
                      id: 'scheduled',
                      header: 'Scheduled',
                      cell: (row) => formatDateTime(row.time),
                    },
                    { id: 'ground', header: 'Ground', cell: (row) => row.ground ?? '—' },
                  ]}
                  data={fixturesQuery.data?.results ?? []}
                  loading={fixturesQuery.isLoading}
                  emptyMessage="No matches found for this tournament."
                  pagination={
                    fixturesQuery.data
                      ? {
                          pageIndex,
                          pageSize: MATCHES_PAGE_SIZE,
                          totalCount: fixturesQuery.data.count,
                        }
                      : undefined
                  }
                  onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
                />
              )
            ) : null}

            {tab === 'table' ? (
              pointsQuery.isError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                  Unable to load points table.
                </div>
              ) : (
                <StandingsTable rows={pointsQuery.data ?? []} loading={pointsQuery.isLoading} />
              )
            ) : null}

            {tab === 'stats' ? (
              <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <aside className="rounded-xl border border-slate-200 bg-white p-3">
                  <CategoryGroup
                    title="Batting"
                    categories={BATTING_CATEGORIES}
                    activeId={statsCategoryId}
                    onSelect={setStatsCategoryId}
                  />
                  <CategoryGroup
                    title="Bowling"
                    categories={BOWLING_CATEGORIES}
                    activeId={statsCategoryId}
                    onSelect={setStatsCategoryId}
                    className="mt-4"
                  />
                </aside>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-[#12233D]">{category.label}</h2>
                  </div>
                  {statsQuery.isLoading && !statsQuery.data ? (
                    <div className="flex min-h-[20vh] items-center justify-center">
                      <LoadingSpinner className="h-7 w-7 text-[#12233D]" />
                    </div>
                  ) : statsQuery.isError ? (
                    <div className="p-6 text-sm text-red-700">Unable to load player stats.</div>
                  ) : (statsQuery.data?.results.length ?? 0) === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No stats recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-10 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              #
                            </TableHead>
                            {category.columns.map((column) => (
                              <TableHead
                                key={column.id}
                                className={cn(
                                  'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                                  column.align === 'right' && 'text-right'
                                )}
                              >
                                {column.header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(statsQuery.data?.results ?? []).map((player, index) => (
                            <TableRow key={player.id}>
                              <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              {category.columns.map((column) => (
                                <TableCell
                                  key={column.id}
                                  className={cn(
                                    'text-sm tabular-nums text-[#12233D]',
                                    column.align === 'right' && 'text-right'
                                  )}
                                >
                                  {column.cell(player)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </>
        )}
      </div>
    </TenantRequired>
  );
}

function CategoryGroup({
  title,
  categories,
  activeId,
  onSelect,
  className,
}: {
  title: string;
  categories: StatsCategory[];
  activeId: StatsCategoryId;
  onSelect: (id: StatsCategoryId) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-0.5">
        {categories.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'w-full rounded-md px-2.5 py-1.5 text-left text-sm transition',
                  active
                    ? 'bg-[#12233D] font-medium text-white'
                    : 'text-[#12233D]/80 hover:bg-slate-50 hover:text-[#12233D]'
                )}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'bg-[#12233D] text-white shadow-sm'
          : 'text-muted-foreground hover:text-[#12233D]'
      )}
    >
      {children}
    </button>
  );
}
