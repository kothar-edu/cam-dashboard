import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BatterBowlerCards, BowlerRow } from './BatterBowlerCards';

function player(overrides = {}) {
  return {
    id: 'p1',
    full_name: 'Player One',
    picture: null,
    reserve: false,
    stats: {
      runs_scored: 34,
      balls_faced: 21,
      fours: 3,
      sixes: 1,
      is_out: false,
      crr: 0,
      srr: 0,
      runs_conceded: 28,
      overs_bowled: 3,
      wickets_taken: 2,
      wickets_lost: 0,
      maidens: 0,
      err: 0,
    },
    ...overrides,
  };
}

describe('BatterBowlerCards', () => {
  // Bowler is rendered separately (BowlerRow, grouped next to the score box
  // in BroadcastOverlayPage) - not part of this component, so it's not
  // asserted here even though `currentPlayers.bowler` is still accepted.
  it('shows striker runs/balls', () => {
    render(
      <BatterBowlerCards
        currentPlayers={{
          striker: player({ full_name: 'Striker' }),
          non_striker: null,
          bowler: null,
          wicket_keeper: null,
        }}
      />
    );
    expect(screen.getByText('Striker')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
  });

  it('shows the tournament sponsor in the space next to the batters', () => {
    render(
      <BatterBowlerCards
        currentPlayers={{
          striker: player({ full_name: 'Striker' }),
          non_striker: null,
          bowler: null,
          wicket_keeper: null,
        }}
        sponsors={[{ id: 's1', name: 'Acme Corp', imageUrl: null, level: 'Title' }]}
      />
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });
});

describe('BowlerRow', () => {
  it('shows bowler wickets-runs/overs', () => {
    render(<BowlerRow player={player({ full_name: 'Bowler' })} />);
    expect(screen.getByText('Bowler')).toBeInTheDocument();
    expect(screen.getByText('2-28')).toBeInTheDocument();
  });

  it('renders nothing when there is no bowler yet', () => {
    const { container } = render(<BowlerRow player={null} />);
    expect(container.firstChild).toBeNull();
  });
});
