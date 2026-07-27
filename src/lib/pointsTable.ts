import type { PointsTableRow, TournamentPlayerStats } from '@/api/points';

export function formatNrr(value: number): string {
  if (Number.isNaN(value)) return '—';
  const formatted = Math.abs(value).toFixed(3);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function winPercentage(row: PointsTableRow): number | null {
  if (!row.matches_played) return null;
  return (row.matches_won / row.matches_played) * 100;
}

export function formatWinPct(row: PointsTableRow): string {
  const pct = winPercentage(row);
  return pct == null ? '—' : `${pct.toFixed(0)}%`;
}

/** Sort standings: points desc, then NRR desc, then wins desc. */
export function sortStandings(rows: PointsTableRow[]): PointsTableRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.nrr !== a.nrr) return b.nrr - a.nrr;
    return b.matches_won - a.matches_won;
  });
}

export function uniqueGroups(rows: PointsTableRow[]): string[] {
  const groups = new Set<string>();
  for (const row of rows) {
    if (row.group) groups.add(row.group);
  }
  return [...groups].sort((a, b) => a.localeCompare(b));
}

export function filterByGroup(
  rows: PointsTableRow[],
  group: string | 'all'
): PointsTableRow[] {
  if (group === 'all') return rows;
  return rows.filter((row) => row.group === group);
}

export function playerDisplayName(player: TournamentPlayerStats): string {
  return player.user?.full_name?.trim() || 'Unknown player';
}

export function teamShortName(name: string, max = 14): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export type StandingsHighlights = {
  leader: PointsTableRow | null;
  bestNrr: PointsTableRow | null;
  mostWins: PointsTableRow | null;
  mostRuns: PointsTableRow | null;
  mostWickets: PointsTableRow | null;
};

export function computeHighlights(rows: PointsTableRow[]): StandingsHighlights {
  if (!rows.length) {
    return { leader: null, bestNrr: null, mostWins: null, mostRuns: null, mostWickets: null };
  }
  const sorted = sortStandings(rows);
  return {
    leader: sorted[0] ?? null,
    bestNrr: [...rows].sort((a, b) => b.nrr - a.nrr)[0] ?? null,
    mostWins: [...rows].sort((a, b) => b.matches_won - a.matches_won)[0] ?? null,
    mostRuns: [...rows].sort((a, b) => (b.runs_scored ?? 0) - (a.runs_scored ?? 0))[0] ?? null,
    mostWickets:
      [...rows].sort((a, b) => (b.wickets_taken ?? 0) - (a.wickets_taken ?? 0))[0] ?? null,
  };
}
