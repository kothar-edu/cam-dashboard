import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FallOfWicketsTicker } from './FallOfWicketsTicker';

describe('FallOfWicketsTicker', () => {
  it('renders one entry per fallen wicket with score and player name', () => {
    render(
      <FallOfWicketsTicker
        entries={[{ wicketNumber: 1, scoreAtWicket: 23, over: 4, ball: 2, playerId: 'p1', dismissalType: 'BOWLED' }]}
        playerNameById={{ p1: 'Player One' }}
      />,
    );
    expect(screen.getByText(/1-23/)).toBeInTheDocument();
    expect(screen.getByText(/Player One/)).toBeInTheDocument();
    expect(screen.getByText(/4.2/)).toBeInTheDocument();
  });

  it('renders nothing when no wickets have fallen', () => {
    const { container } = render(<FallOfWicketsTicker entries={[]} playerNameById={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
