import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnershipStrip } from './PartnershipStrip';

const current = { over: 5, ball: 3, inning: 1, runs: 45, wickets: 1, target: 0, crr: 0, balls_remaining: 0, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 0 };

describe('PartnershipStrip', () => {
  it('shows the runs scored since the partnership started and both batter names', () => {
    render(
      <PartnershipStrip
        partnership={{ runsAtStart: 20, ballsSinceWicket: 18, batterIds: ['s1', 's2'] }}
        current={current}
        striker={{ id: 's1', full_name: 'Striker One' } as any}
        nonStriker={{ id: 's2', full_name: 'Non Striker' } as any}
      />,
    );
    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByText(/Striker One/)).toBeInTheDocument();
    expect(screen.getByText(/Non Striker/)).toBeInTheDocument();
  });
});
