import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BatterBowlerCards } from './BatterBowlerCards';

function player(overrides = {}) {
  return {
    id: 'p1', full_name: 'Player One', picture: null, reserve: false,
    stats: { runs_scored: 34, balls_faced: 21, fours: 3, sixes: 1, is_out: false, crr: 0, srr: 0, runs_conceded: 28, overs_bowled: 3, wickets_taken: 2, wickets_lost: 0, maidens: 0, err: 0 },
    ...overrides,
  };
}

describe('BatterBowlerCards', () => {
  it('shows striker runs/balls and bowler wickets-runs/overs', () => {
    render(
      <BatterBowlerCards
        currentPlayers={{ striker: player({ full_name: 'Striker' }), non_striker: null, bowler: player({ full_name: 'Bowler' }), wicket_keeper: null }}
      />,
    );
    expect(screen.getByText('Striker')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('2-28')).toBeInTheDocument();
  });
});
