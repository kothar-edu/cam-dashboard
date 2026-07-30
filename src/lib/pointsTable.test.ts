import { describe, expect, it } from 'vitest';
import type { PointsTableRow } from '@/api/points';
import {
  computeHighlights,
  filterByGroup,
  formatNrr,
  formatWinPct,
  sortStandings,
  uniqueGroups,
} from '@/lib/pointsTable';

const row = (partial: Partial<PointsTableRow> & { id: string; name: string }): PointsTableRow => ({
  id: partial.id,
  team: {
    id: partial.id,
    name: partial.name,
    code: partial.name.slice(0, 3).toUpperCase(),
    logo: null,
    total_players: 11,
    is_active: true,
  },
  group: partial.group ?? null,
  matches_played: partial.matches_played ?? 0,
  matches_won: partial.matches_won ?? 0,
  matches_lost: partial.matches_lost ?? 0,
  abandoned: partial.abandoned ?? 0,
  tied: partial.tied ?? 0,
  points: partial.points ?? 0,
  nrr: partial.nrr ?? 0,
  runs_scored: partial.runs_scored,
  runs_conceded: partial.runs_conceded,
  wickets_taken: partial.wickets_taken,
  wickets_lost: partial.wickets_lost,
});

describe('pointsTable helpers', () => {
  it('formats NRR and win percentage', () => {
    expect(formatNrr(1.2)).toBe('+1.200');
    expect(formatNrr(-0.45)).toBe('-0.450');
    expect(formatNrr(0)).toBe('0.000');
    expect(formatWinPct(row({ id: '1', name: 'A', matches_played: 4, matches_won: 3 }))).toBe(
      '75%'
    );
  });

  it('sorts by points then NRR', () => {
    const sorted = sortStandings([
      row({ id: 'a', name: 'A', points: 4, nrr: 1 }),
      row({ id: 'b', name: 'B', points: 8, nrr: 0.1 }),
      row({ id: 'c', name: 'C', points: 4, nrr: 1.5 }),
    ]);
    expect(sorted.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('filters groups and computes highlights', () => {
    const rows = [
      row({
        id: 'a',
        name: 'Alpha',
        group: 'A',
        points: 8,
        nrr: 0.5,
        matches_won: 4,
        runs_scored: 500,
        wickets_taken: 20,
      }),
      row({
        id: 'b',
        name: 'Beta',
        group: 'B',
        points: 6,
        nrr: 1.2,
        matches_won: 3,
        runs_scored: 700,
        wickets_taken: 30,
      }),
    ];
    expect(uniqueGroups(rows)).toEqual(['A', 'B']);
    expect(filterByGroup(rows, 'A')).toHaveLength(1);
    const highlights = computeHighlights(rows);
    expect(highlights.leader?.team.name).toBe('Alpha');
    expect(highlights.bestNrr?.team.name).toBe('Beta');
    expect(highlights.mostRuns?.team.name).toBe('Beta');
    expect(highlights.mostWickets?.team.name).toBe('Beta');
  });
});
