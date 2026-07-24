import { describe, it, expect } from 'vitest';
import { ballKind, extrasBreakdown, shortCode, wicketCode, wordLabel } from './ballLabel';
import type { ScoreEvent } from '@/types/liveMatch';

function ball(overrides: Partial<ScoreEvent> & { value: ScoreEvent['value'] }): ScoreEvent {
  return {
    striker: 's1',
    bowler: 'b1',
    extras: 0,
    runs: 0,
    dismissed: null,
    fielder: null,
    is_bat_involved: false,
    commentary: '',
    ...overrides,
  };
}

describe('extrasBreakdown', () => {
  it('shows just the mandatory 1 for a plain wide with no additional runs', () => {
    expect(extrasBreakdown(ball({ value: 'WIDE_BALL', extras: 1 }))).toBe('1');
  });

  it('splits mandatory + additional for a wide run for 2', () => {
    expect(extrasBreakdown(ball({ value: 'WIDE_BALL', extras: 3 }))).toBe('1+2');
  });

  it('splits mandatory + bat runs for a no-ball hit for 2', () => {
    expect(extrasBreakdown(ball({ value: 'NO_BALL', extras: 1, runs: 2, is_bat_involved: true }))).toBe('1+2');
  });

  it('splits mandatory + leg-bye runs for a no-ball taken as leg byes', () => {
    expect(
      extrasBreakdown(ball({ value: 'NO_BALL', extras: 3, runs: 0, is_bat_involved: false, bye_type: 'LEG_BYE' })),
    ).toBe('1+2');
  });

  it('shows the raw byes for a plain bye', () => {
    expect(extrasBreakdown(ball({ value: 'BYE', extras: 2 }))).toBe('2');
  });
});

describe('wicketCode', () => {
  it('returns the dismissal-mode code for plain wickets', () => {
    expect(wicketCode(ball({ value: 'LBW' }))).toBe('LBW');
    expect(wicketCode(ball({ value: 'BOWLED' }))).toBe('BO');
    expect(wicketCode(ball({ value: 'CAUGHT' }))).toBe('CO');
  });

  it('returns the compound code for wide/no-ball dismissals', () => {
    expect(wicketCode(ball({ value: 'WIDE_RUN_OUT' }))).toBe('WD+RO');
  });

  it('is null for non-wicket balls', () => {
    expect(wicketCode(ball({ value: 4 }))).toBeNull();
    expect(wicketCode(ball({ value: 'WIDE_BALL' }))).toBeNull();
  });
});

describe('shortCode / wordLabel', () => {
  it('marks a no-ball taken as byes distinctly from a plain no-ball', () => {
    expect(shortCode(ball({ value: 'NO_BALL', bye_type: 'BYE' }))).toBe('NB+B');
    expect(shortCode(ball({ value: 'NO_BALL' }))).toBe('NB');
  });

  it('collapses every plain wicket to W for the short code', () => {
    expect(shortCode(ball({ value: 'LBW' }))).toBe('W');
    expect(shortCode(ball({ value: 'BOWLED' }))).toBe('W');
  });

  it('keeps the full dismissal-mode word for the admin word label', () => {
    expect(wordLabel(ball({ value: 'LBW' }))).toBe('LBW');
    expect(wordLabel(ball({ value: 'BOWLED' }))).toBe('BOWLED');
  });
});

describe('ballKind', () => {
  it('classifies boundaries, extras, wickets and plain runs', () => {
    expect(ballKind(ball({ value: 4 }))).toBe('boundary4');
    expect(ballKind(ball({ value: 6 }))).toBe('boundary6');
    expect(ballKind(ball({ value: 'WIDE_BALL' }))).toBe('extra');
    expect(ballKind(ball({ value: 'BOWLED' }))).toBe('wicket');
    expect(ballKind(ball({ value: 2 }))).toBe('run');
  });
});
