import { describe, expect, it } from 'vitest';
import {
  ballsToOvers,
  economyRate,
  formatInningsScoreWithOvers,
  getResultSummary,
  matchOutcomeLabel,
  strikeRate,
} from '@/lib/scorecard';

describe('scorecard helpers', () => {
  it('formats innings score with overs', () => {
    expect(
      formatInningsScoreWithOvers({
        runs_scored: 156,
        overs_bowled: 19.3,
        wickets_lost: 7,
        wickets_taken: 10,
      })
    ).toBe('156/7 (19.3 ov)');
  });

  it('reads list and detail result summaries', () => {
    expect(
      getResultSummary({
        result: {
          opponent_a: { runs_scored: 10, overs_bowled: 2, wickets_lost: 1, wickets_taken: 2 },
        },
      })?.opponent_a?.runs_scored
    ).toBe(10);

    expect(
      getResultSummary({
        result: { forfeit: true },
        result_summary: {
          opponent_a: { runs_scored: 20, overs_bowled: 4, wickets_lost: 0, wickets_taken: 1 },
        },
      })?.opponent_a?.runs_scored
    ).toBe(20);
  });

  it('builds outcome labels', () => {
    expect(matchOutcomeLabel({ winner: { id: '1', team: 'Alpha' }, abandoned: false, tied: false })).toBe(
      'Alpha won'
    );
    expect(matchOutcomeLabel({ abandoned: true, tied: false })).toBe('Match abandoned');
    expect(matchOutcomeLabel({ abandoned: false, tied: true })).toBe('Match tied');
  });

  it('computes cricket rates and overs', () => {
    expect(strikeRate(50, 25)).toBe('200.0');
    expect(economyRate(24, 12)).toBe('12.00');
    expect(ballsToOvers(19)).toBe('3.1');
    expect(ballsToOvers(18)).toBe('3');
  });
});
