import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WicketControls } from './WicketControls';

const striker = { id: 's1', full_name: 'Striker One', picture: null, reserve: false, stats: zeroStats() };
const nonStriker = { id: 's2', full_name: 'Non Striker', picture: null, reserve: false, stats: zeroStats() };
const wicketKeeper = { id: 'wk1', full_name: 'Keeper', picture: null, reserve: false, stats: zeroStats() };
const fielder = { id: 'f1', full_name: 'Fielder One', picture: null, reserve: false, stats: zeroStats() };

function zeroStats() {
  return {
    runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, crr: 0, srr: 0,
    runs_conceded: 0, overs_bowled: 0, wickets_taken: 0, wickets_lost: 0, maidens: 0, err: 0,
  };
}

const currentPlayers = { striker, non_striker: nonStriker, bowler: null, wicket_keeper: wicketKeeper };
const fieldingOpponent = {
  id: 'opp-2', name: 'Fielding XI', code: 'FLD', logo: null,
  players: [wicketKeeper, fielder],
  stats: zeroStats(),
};

describe('WicketControls', () => {
  it('broadcasts a simple dismissal (Bowled) immediately, crediting the striker', () => {
    const broadcastWicket = vi.fn();
    render(
      <WicketControls broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={false} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bowled' }));

    expect(broadcastWicket).toHaveBeenCalledWith('BOWLED', 's1', 0, wicketKeeper.id);
  });

  it('Run Out expands a player + runs + fielder form and submits on confirm', () => {
    const broadcastWicket = vi.fn();
    render(
      <WicketControls broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={false} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run Out' }));
    fireEvent.change(screen.getByLabelText('Dismissed player'), { target: { value: 's2' } });
    fireEvent.change(screen.getByLabelText('Runs completed'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Fielder'), { target: { value: 'f1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(broadcastWicket).toHaveBeenCalledWith('RUN_OUT', 's2', 1, 'f1');
  });
});
