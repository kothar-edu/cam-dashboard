import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExtrasBreakdownChip } from './ExtrasBreakdownChip';

describe('ExtrasBreakdownChip', () => {
  it('shows the total and a per-category breakdown', () => {
    render(
      <ExtrasBreakdownChip extras={{ wide: 3, no_ball: 1, bye: 0, leg_bye: 2, penalty: 0 }} />
    );
    expect(screen.getByText(/Extras: 6/)).toBeInTheDocument();
    expect(screen.getByText(/wd 3/i)).toBeInTheDocument();
    expect(screen.getByText(/nb 1/i)).toBeInTheDocument();
    expect(screen.getByText(/lb 2/i)).toBeInTheDocument();
  });
});
