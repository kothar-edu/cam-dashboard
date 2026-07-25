import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PowerplayBadge } from './PowerplayBadge';

const current = {
  over: 2,
  ball: 0,
  inning: 1,
  runs: 0,
  wickets: 0,
  target: 0,
  crr: 0,
  balls_remaining: 0,
  required_runs: 0,
  rrr: 0,
  status: 'IN_PROGRESS',
  projected: 0,
};

describe('PowerplayBadge', () => {
  it('shows overs remaining while the powerplay is active', () => {
    render(<PowerplayBadge current={current} powerplayOvers={6} />);
    expect(screen.getByText(/POWERPLAY/)).toBeInTheDocument();
    expect(screen.getByText(/4 overs left/)).toBeInTheDocument();
  });

  it('renders nothing once the powerplay has ended', () => {
    const { container } = render(
      <PowerplayBadge current={{ ...current, over: 6 }} powerplayOvers={6} />
    );
    expect(container.firstChild).toBeNull();
  });
});
