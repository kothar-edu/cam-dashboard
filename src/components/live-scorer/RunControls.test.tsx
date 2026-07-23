import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunControls } from './RunControls';

describe('RunControls', () => {
  it('renders buttons 0 through 6 and broadcasts the tapped value', () => {
    const broadcastScore = vi.fn();
    render(<RunControls broadcastScore={broadcastScore} disabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(broadcastScore).toHaveBeenCalledWith(4);
  });

  it('disables every button when disabled is true', () => {
    render(<RunControls broadcastScore={vi.fn()} disabled />);
    for (const label of ['0', '1', '2', '3', '4', '5', '6']) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled();
    }
  });
});
