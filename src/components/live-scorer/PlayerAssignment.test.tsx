import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerAssignment } from './PlayerAssignment';

function zeroStats() {
  return {
    runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, crr: 0, srr: 0,
    runs_conceded: 0, overs_bowled: 0, wickets_taken: 0, wickets_lost: 0, maidens: 0, err: 0,
  };
}

const battingPlayer = { id: 'b1', full_name: 'Batter One', picture: null, reserve: false, stats: zeroStats() };
const bowlingPlayer = { id: 'p1', full_name: 'Bowler One', picture: null, reserve: false, stats: zeroStats() };

const opponents = {
  batting: { id: 'opp-a', name: 'Team A', code: 'A', logo: null, players: [battingPlayer], stats: zeroStats() },
  bowling: { id: 'opp-b', name: 'Team B', code: 'B', logo: null, players: [bowlingPlayer], stats: zeroStats() },
};

const currentPlayers = { striker: null, non_striker: null, bowler: null, wicket_keeper: null };

describe('PlayerAssignment', () => {
  it('assigns a striker by selecting from the batting team and confirming', () => {
    const updatePlayer = vi.fn();
    render(
      <PlayerAssignment currentPlayers={currentPlayers} opponents={opponents} updatePlayer={updatePlayer} updateRetiredHurtStatus={vi.fn()} disabled={false} />,
    );

    fireEvent.change(screen.getByLabelText('Striker'), { target: { value: 'b1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm striker' }));

    expect(updatePlayer).toHaveBeenCalledWith('striker', 'b1');
  });

  it('shows a retired-hurt player with a toggle that calls updateRetiredHurtStatus', () => {
    const updateRetiredHurtStatus = vi.fn();
    const battingWithRetired = {
      ...opponents.batting,
      players: [{ ...battingPlayer, retired_hurt: true, can_return: false }],
    };
    render(
      <PlayerAssignment
        currentPlayers={currentPlayers}
        opponents={{ ...opponents, batting: battingWithRetired }}
        updatePlayer={vi.fn()}
        updateRetiredHurtStatus={updateRetiredHurtStatus}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /mark can return/i }));
    expect(updateRetiredHurtStatus).toHaveBeenCalledWith('b1', true);
  });
});
