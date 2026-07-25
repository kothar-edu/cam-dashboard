import type { ScoreEvent } from '@/types/liveMatch';

export type BallKind = 'run' | 'boundary4' | 'boundary6' | 'extra' | 'wicket';

const WICKET_SHORT: Record<string, string> = {
  BOWLED: 'BO',
  CAUGHT: 'CO',
  LBW: 'LBW',
  STUMPED: 'ST',
  RUN_OUT: 'RO',
  HANDLED: 'H',
  HIT_WICKET: 'HW',
  RETIRED_OUT: 'RTO',
  RETIRED_HURT: 'RH',
};

const COMPOUND_WICKET_SHORT: Record<string, string> = {
  WIDE_RUN_OUT: 'WD+RO',
  WIDE_STUMPED: 'WD+ST',
  NO_BALL_RUN_OUT: 'NB+RO',
};

const EXTRA_WORD: Record<string, string> = {
  WIDE_BALL: 'WIDE BALL',
  NO_BALL: 'NO BALL',
  BYE: 'BYE',
  LEG_BYE: 'LEG BYE',
  PENALTY: 'PENALTY',
};

const EXTRA_SHORT: Record<string, string> = {
  WIDE_BALL: 'WD',
  NO_BALL: 'NB',
  BYE: 'B',
  LEG_BYE: 'LB',
  PENALTY: 'PN',
};

export function ballKind(event: ScoreEvent): BallKind {
  if (event.value === 4) return 'boundary4';
  if (event.value === 6) return 'boundary6';
  if (typeof event.value === 'number') return 'run';
  if (event.value in EXTRA_WORD) return 'extra';
  return 'wicket';
}

export function wicketCode(event: ScoreEvent): string | null {
  const value = event.value;
  if (typeof value === 'number') return null;
  return COMPOUND_WICKET_SHORT[value] ?? WICKET_SHORT[value] ?? null;
}

export function extrasBreakdown(event: ScoreEvent): string | null {
  const value = event.value;
  if (typeof value === 'number') return null;

  if (value in COMPOUND_WICKET_SHORT) {
    const total = event.extras + event.runs;
    return total > 0 ? `${event.extras}+${event.runs}` : null;
  }

  if (value === 'NO_BALL' && event.is_bat_involved) {
    return event.extras > 0 || event.runs > 0 ? `${event.extras}+${event.runs}` : null;
  }

  if (value === 'WIDE_BALL' || value === 'NO_BALL') {
    const additional = event.extras - 1;
    if (additional > 0) return `1+${additional}`;
    return event.extras > 0 ? String(event.extras) : null;
  }

  if (value === 'BYE' || value === 'LEG_BYE' || value === 'PENALTY') {
    return event.extras > 0 ? String(event.extras) : null;
  }

  return null;
}

export function shortCode(event: ScoreEvent): string {
  const value = event.value;
  if (typeof value === 'number') return String(value);
  if (value === 'NO_BALL') {
    if (event.bye_type === 'LEG_BYE') return 'NB+LB';
    if (event.bye_type === 'BYE') return 'NB+B';
    return 'NB';
  }
  if (value in COMPOUND_WICKET_SHORT) return 'W';
  if (value in WICKET_SHORT) return 'W';
  return EXTRA_SHORT[value] ?? String(value).slice(0, 2);
}

export function wordLabel(event: ScoreEvent): string {
  const value = event.value;
  if (typeof value === 'number') return String(value);
  if (value === 'NO_BALL') {
    if (event.bye_type === 'LEG_BYE') return 'NO BALL + LB';
    if (event.bye_type === 'BYE') return 'NO BALL + B';
    return 'NO BALL';
  }
  if (value in COMPOUND_WICKET_SHORT) return COMPOUND_WICKET_SHORT[value];
  if (value in WICKET_SHORT) return String(value).replace(/_/g, ' ');
  return EXTRA_WORD[value] ?? String(value).replace(/_/g, ' ');
}
