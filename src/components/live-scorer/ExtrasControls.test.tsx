import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtrasControls } from './ExtrasControls';

describe('ExtrasControls', () => {
  it('expands Wide and broadcasts the chosen extra-run count', () => {
    const broadcastScore = vi.fn();
    render(<ExtrasControls broadcastScore={broadcastScore} disabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /wide/i }));
    fireEvent.click(screen.getByRole('button', { name: '1', hidden: true }));

    expect(broadcastScore).toHaveBeenCalledWith('WIDE_BALL', 1);
  });

  it('expands No Ball and requires choosing a run source before broadcasting', () => {
    const broadcastScore = vi.fn();
    render(<ExtrasControls broadcastScore={broadcastScore} disabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /no ball/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Byes' }));
    fireEvent.click(screen.getByRole('button', { name: '2', hidden: true }));

    expect(broadcastScore).toHaveBeenCalledWith('NO_BALL', 2, false, 'BYE');
  });
});
