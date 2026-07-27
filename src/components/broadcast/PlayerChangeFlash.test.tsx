import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PlayerChangeFlash } from './PlayerChangeFlash';
import type { LiveMatchPlayer } from '@/types/liveMatch';

function player(overrides: Partial<LiveMatchPlayer> = {}): LiveMatchPlayer {
  return {
    id: 'p1',
    full_name: 'Vivek Devkota',
    picture: null,
    reserve: false,
    stats: {
      runs_scored: 12,
      balls_faced: 8,
      fours: 1,
      sixes: 0,
      is_out: false,
      crr: 9,
      srr: 150,
      runs_conceded: 12,
      overs_bowled: 1,
      wickets_taken: 0,
      wickets_lost: 0,
      maidens: 0,
      err: 12,
    },
    career_stats: {
      runs_scored: 400,
      fours: 30,
      sixes: 10,
      wickets_taken: 33,
      maidens: 5,
      matches_played: 27,
    },
    ...overrides,
  };
}

describe('PlayerChangeFlash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders player out and player in cards with this-game stats', () => {
    render(
      <PlayerChangeFlash
        playerChange={{
          id: 1,
          playerRole: 'bowler',
          playerOut: player({ full_name: 'Vivek Devkota' }),
          playerIn: player({
            id: 'p2',
            full_name: 'Kshitiz Basnet',
            stats: {
              ...player().stats,
              overs_bowled: 1,
              wickets_taken: 0,
              maidens: 0,
              err: 2,
              runs_conceded: 2,
            },
          }),
        }}
      />
    );

    expect(screen.getByText('Player out')).toBeInTheDocument();
    expect(screen.getByText('Player in')).toBeInTheDocument();
    expect(screen.getByText('Vivek Devkota')).toBeInTheDocument();
    expect(screen.getByText('Kshitiz Basnet')).toBeInTheDocument();
    expect(screen.getAllByText('This game').length).toBe(2);
    expect(screen.getByText('Career')).toBeInTheDocument();
  });

  it('hides after the hold and exit animation', () => {
    render(
      <PlayerChangeFlash
        playerChange={{
          id: 2,
          playerRole: 'striker',
          playerOut: player(),
          playerIn: player({ id: 'p2', full_name: 'New Batter' }),
        }}
      />
    );

    expect(screen.getByTestId('player-change-flash')).toBeInTheDocument();
    expect(screen.getByTestId('player-change-flash')).toHaveAttribute('data-phase', 'entering');

    act(() => {
      vi.advanceTimersByTime(4600);
    });
    expect(screen.getByTestId('player-change-flash')).toHaveAttribute('data-phase', 'exiting');

    act(() => {
      vi.advanceTimersByTime(420);
    });
    expect(screen.queryByTestId('player-change-flash')).toBeNull();
  });
});
