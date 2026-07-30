import type {
  Fixture,
  FixtureDetail,
  FixtureResultSummary,
  FixtureScoreSummary,
  LineupEntry,
} from '@/api/fixtures';

export function formatMatchDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMatchDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Format cricket overs (19.3 → "19.3", integers stay clean). */
export function formatOvers(overs: number | null | undefined): string {
  if (overs == null || Number.isNaN(overs)) return '—';
  const n = Number(overs);
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
}

export function formatInningsScore(score?: FixtureScoreSummary | null): string {
  if (!score) return '—';
  return `${score.runs_scored}/${score.wickets_lost}`;
}

export function formatInningsScoreWithOvers(score?: FixtureScoreSummary | null): string {
  if (!score) return '—';
  return `${score.runs_scored}/${score.wickets_lost} (${formatOvers(score.overs_bowled)} ov)`;
}

export function strikeRate(runs: number, balls: number): string {
  if (!balls) return '—';
  return ((runs / balls) * 100).toFixed(1);
}

export function economyRate(runs: number, balls: number): string {
  if (!balls) return '—';
  return ((runs / balls) * 6).toFixed(2);
}

export function ballsToOvers(balls: number): string {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  return rem ? `${overs}.${rem}` : String(overs);
}

export function getResultSummary(
  fixture: Pick<Fixture, 'result' | 'result_summary'> | FixtureDetail
): FixtureResultSummary | null {
  if (fixture.result_summary) return fixture.result_summary;
  const result = fixture.result;
  if (!result || typeof result !== 'object') return null;
  // List endpoint stores summarized scores under `result`
  if ('opponent_a' in result || 'opponent_b' in result) {
    return result as FixtureResultSummary;
  }
  return null;
}

export function matchOutcomeLabel(
  fixture: Pick<Fixture, 'winner' | 'abandoned' | 'tied' | 'dls' | 'result'>
): string {
  if (fixture.abandoned) return 'Match abandoned';
  if (fixture.tied) return 'Match tied';
  const raw = fixture.result;
  if (raw && typeof raw === 'object' && 'forfeit' in raw && raw.forfeit) {
    return fixture.winner?.team ? `${fixture.winner.team} won by forfeit` : 'Forfeited';
  }
  if (fixture.winner?.team) {
    return fixture.dls ? `${fixture.winner.team} won (DLS)` : `${fixture.winner.team} won`;
  }
  return 'Completed';
}

export function manOfTheMatchName(motm?: Fixture['man_of_the_match'] | null): string | null {
  if (!motm) return null;
  return motm.full_name ?? motm.name ?? null;
}

export function topBatters(lineups: LineupEntry[], limit = 5): LineupEntry[] {
  return [...lineups]
    .filter((l) => l.balls_faced > 0 || l.runs_scored > 0)
    .sort((a, b) => b.runs_scored - a.runs_scored || a.balls_faced - b.balls_faced)
    .slice(0, limit);
}

export function topBowlers(lineups: LineupEntry[], limit = 5): LineupEntry[] {
  return [...lineups]
    .filter((l) => l.balls_thrown > 0 || l.wickets_taken > 0)
    .sort(
      (a, b) =>
        b.wickets_taken - a.wickets_taken ||
        a.runs_conceded - b.runs_conceded ||
        a.balls_thrown - b.balls_thrown
    )
    .slice(0, limit);
}

export function battingFaced(lineups: LineupEntry[]): LineupEntry[] {
  return lineups.filter((l) => l.balls_faced > 0 || l.runs_scored > 0 || l.dismissed);
}

export function bowlingFigures(lineups: LineupEntry[]): LineupEntry[] {
  return lineups.filter((l) => l.balls_thrown > 0 || l.wickets_taken > 0);
}
