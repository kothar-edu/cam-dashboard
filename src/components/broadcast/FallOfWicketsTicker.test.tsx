import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FallOfWicketsTicker } from './FallOfWicketsTicker';

describe('FallOfWicketsTicker', () => {
  it('renders one entry per fallen wicket with score and player name', () => {
    render(
      <FallOfWicketsTicker
        entries={[
          {
            wicketNumber: 1,
            scoreAtWicket: 23,
            over: 4,
            ball: 2,
            playerId: 'p1',
            dismissalType: 'BOWLED',
          },
        ]}
        playerNameById={{ p1: 'Player One' }}
      />
    );
    expect(screen.getByText(/1-23/)).toBeInTheDocument();
    expect(screen.getByText(/Player One/)).toBeInTheDocument();
    expect(screen.getByText(/4.2/)).toBeInTheDocument();
  });

  it("wraps within a fixed max-width instead of growing unboundedly - a broadcast overlay can't be scrolled", () => {
    const { container } = render(
      <FallOfWicketsTicker
        entries={[
          {
            wicketNumber: 1,
            scoreAtWicket: 23,
            over: 4,
            ball: 2,
            playerId: 'p1',
            dismissalType: 'BOWLED',
          },
        ]}
        playerNameById={{ p1: 'Player One' }}
      />
    );
    const ticker = container.firstElementChild;
    expect(ticker).toHaveClass('flex-wrap');
    expect(ticker).not.toHaveClass('overflow-x-auto');
  });

  it('renders nothing when no wickets have fallen', () => {
    const { container } = render(<FallOfWicketsTicker entries={[]} playerNameById={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
