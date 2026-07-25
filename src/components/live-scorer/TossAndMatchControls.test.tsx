import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TossAndMatchControls } from './TossAndMatchControls';

const teamA = { id: 'a1', name: 'Team A', code: 'A', logo: null };
const teamB = { id: 'b1', name: 'Team B', code: 'B', logo: null };

describe('TossAndMatchControls', () => {
  it('submits a TOSS event once a team and role are chosen', () => {
    const broadcastGameEvent = vi.fn();
    render(
      <TossAndMatchControls
        broadcastGameEvent={broadcastGameEvent}
        teamA={teamA}
        teamB={teamB}
        disabled={false}
        onOpenSettings={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Toss' }));
    fireEvent.change(screen.getByLabelText('Toss winner'), { target: { value: 'a1' } });
    fireEvent.change(screen.getByLabelText('Elected to'), { target: { value: 'batting' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit toss' }));

    expect(broadcastGameEvent).toHaveBeenCalledWith('TOSS', { team: 'a1', role: 'batting' });
  });

  it('fires simple one-tap match events', () => {
    const broadcastGameEvent = vi.fn();
    render(
      <TossAndMatchControls
        broadcastGameEvent={broadcastGameEvent}
        teamA={teamA}
        teamB={teamB}
        disabled={false}
        onOpenSettings={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Undo Last Event' }));
    expect(broadcastGameEvent).toHaveBeenCalledWith('UNDO', {});

    fireEvent.click(screen.getByRole('button', { name: 'Swap Strikers' }));
    expect(broadcastGameEvent).toHaveBeenCalledWith('SWAP_STRIKERS', {});

    fireEvent.click(screen.getByRole('button', { name: 'End Match' }));
    expect(broadcastGameEvent).toHaveBeenCalledWith('END_OF_MATCH', {});
  });
});
