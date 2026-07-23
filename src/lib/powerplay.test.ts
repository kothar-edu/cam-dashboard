import { describe, it, expect } from 'vitest';
import { selectPowerplayStatus } from './powerplay';

const baseCurrent = {
  over: 0,
  ball: 0,
  inning: 1,
  runs: 0,
  wickets: 0,
  target: 0,
  crr: 0,
  balls_remaining: 120,
  required_runs: 0,
  rrr: 0,
  status: 'IN_PROGRESS',
  projected: 0,
};

describe('selectPowerplayStatus', () => {
  it('is active with overs remaining before the powerplay ends', () => {
    const status = selectPowerplayStatus({ ...baseCurrent, over: 2 }, 6);
    expect(status).toEqual({ active: true, oversRemaining: 4 });
  });

  it('is inactive once the current over reaches the powerplay length', () => {
    const status = selectPowerplayStatus({ ...baseCurrent, over: 6 }, 6);
    expect(status).toEqual({ active: false, oversRemaining: 0 });
  });
});
