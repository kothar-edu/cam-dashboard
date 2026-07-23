import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BallHistoryStrip } from './BallHistoryStrip';
import type { ScoreEvent } from '@/types/liveMatch';

function ball(value: number | string): ScoreEvent {
  return {
    striker: 's1', bowler: 'b1', value: value as ScoreEvent['value'], extras: 0, runs: typeof value === 'number' ? value : 0,
    dismissed: null, fielder: null, is_bat_involved: true, commentary: '',
  };
}

describe('BallHistoryStrip', () => {
  it('renders one badge per ball, grouped by over', () => {
    render(<BallHistoryStrip scoreHistory={[[ball(1), ball(4)], [ball('WICKET' as any)]]} />);
    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
  });

  it('renders nothing but the container when there is no history yet', () => {
    const { container } = render(<BallHistoryStrip scoreHistory={[]} />);
    expect(container.querySelectorAll('[data-testid="over-row"]').length).toBe(0);
  });
});
