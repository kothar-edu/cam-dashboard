import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CelebrationFlash, MilestoneFlash } from './CelebrationFlash';

afterEach(() => {
  vi.useRealTimers();
});

describe('CelebrationFlash', () => {
  it('shows nothing when there is no last event', () => {
    render(<CelebrationFlash lastEvent={{ kind: null, value: null }} />);
    expect(screen.queryByText(/six|four|wicket/i)).not.toBeInTheDocument();
  });

  it('flashes SIX for a value-6 SCORE event and clears after 5 seconds', () => {
    vi.useFakeTimers();
    const { rerender } = render(<CelebrationFlash lastEvent={{ kind: 'SCORE', value: 6 }} />);
    expect(screen.getByText('SIX')).toBeInTheDocument();

    vi.advanceTimersByTime(5001);
    rerender(<CelebrationFlash lastEvent={{ kind: 'SCORE', value: 6 }} />);
    expect(screen.queryByText('SIX')).not.toBeInTheDocument();
  });
});

describe('MilestoneFlash', () => {
  it('renders a 50/100/5-wicket haul label for the named player', () => {
    render(<MilestoneFlash milestone={{ key: 'p1:50', playerId: 'p1', kind: '50', atOver: 10, atBall: 2 }} playerName="Striker One" />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText('Striker One')).toBeInTheDocument();
  });
});
