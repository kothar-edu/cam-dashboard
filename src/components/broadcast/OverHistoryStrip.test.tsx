import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverHistoryStrip } from './OverHistoryStrip';
import type { ScoreEvent } from '@/types/liveMatch';

function ball(value: number | string, extras = 0): ScoreEvent {
  return { striker: 's1', bowler: 'b1', value: value as ScoreEvent['value'], extras, runs: typeof value === 'number' ? value : 0, dismissed: null, fielder: null, is_bat_involved: true, commentary: '' };
}

describe('OverHistoryStrip', () => {
  it('renders a badge per ball bowled this over', () => {
    render(<OverHistoryStrip thisOver={[ball(1), ball(4), ball('WIDE_BALL', 1)]} />);
    expect(screen.getAllByTestId('ball-badge')).toHaveLength(3);
  });
});
