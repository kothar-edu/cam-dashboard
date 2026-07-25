import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerAssignment } from './PlayerAssignment';

function zeroStats() {
  return {
    runs_scored: 0,
    balls_faced: 0,
    fours: 0,
    sixes: 0,
    is_out: false,
    crr: 0,
    srr: 0,
    runs_conceded: 0,
    overs_bowled: 0,
    wickets_taken: 0,
    wickets_lost: 0,
    maidens: 0,
    err: 0,
  };
}

const battingPlayer = {
  id: 'b1',
  full_name: 'Batter One',
  picture: null,
  reserve: false,
  stats: zeroStats(),
};
const bowlingPlayer = {
  id: 'p1',
  full_name: 'Bowler One',
  picture: null,
  reserve: false,
  stats: zeroStats(),
};

const opponents = {
  batting: {
    id: 'opp-a',
    name: 'Team A',
    code: 'A',
    logo: null,
    players: [battingPlayer],
    stats: zeroStats(),
  },
  bowling: {
    id: 'opp-b',
    name: 'Team B',
    code: 'B',
    logo: null,
    players: [bowlingPlayer],
    stats: zeroStats(),
  },
};

const currentPlayers = { striker: null, non_striker: null, bowler: null, wicket_keeper: null };

describe('PlayerAssignment', () => {
  it('assigns a striker by selecting from the batting team and confirming', () => {
    const updatePlayer = vi.fn();
    render(
      <PlayerAssignment
        currentPlayers={currentPlayers}
        opponents={opponents}
        updatePlayer={updatePlayer}
        updateRetiredHurtStatus={vi.fn()}
        disabled={false}
      />
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
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /mark can return/i }));
    expect(updateRetiredHurtStatus).toHaveBeenCalledWith('b1', true);
  });

  it('disables an already-out batter in the striker/non-striker pickers', () => {
    const outPlayer = {
      ...battingPlayer,
      id: 'b2',
      full_name: 'Out Batter',
      stats: { ...zeroStats(), is_out: true },
    };
    render(
      <PlayerAssignment
        currentPlayers={currentPlayers}
        opponents={{
          ...opponents,
          batting: { ...opponents.batting, players: [battingPlayer, outPlayer] },
        }}
        updatePlayer={vi.fn()}
        updateRetiredHurtStatus={vi.fn()}
        disabled={false}
      />
    );

    const strikerSelect = screen.getByLabelText('Striker') as HTMLSelectElement;
    const outOption = Array.from(strikerSelect.options).find((o) =>
      o.textContent?.includes('Out Batter')
    );
    expect(outOption).toHaveTextContent('Out Batter — Out');
    expect(outOption).toBeDisabled();
  });

  it('keeps a retired-hurt batter selectable (can come back in)', () => {
    const retiredPlayer = {
      ...battingPlayer,
      id: 'b3',
      full_name: 'Retired Batter',
      stats: { ...zeroStats(), is_out: true },
      retired_hurt: true,
    };
    render(
      <PlayerAssignment
        currentPlayers={currentPlayers}
        opponents={{ ...opponents, batting: { ...opponents.batting, players: [retiredPlayer] } }}
        updatePlayer={vi.fn()}
        updateRetiredHurtStatus={vi.fn()}
        disabled={false}
      />
    );

    const strikerSelect = screen.getByLabelText('Striker') as HTMLSelectElement;
    const option = Array.from(strikerSelect.options).find((o) =>
      o.textContent?.includes('Retired Batter')
    );
    expect(option).not.toBeDisabled();
  });

  it('disables the current bowler and any bowler at the overs limit in the bowler picker', () => {
    const currentBowler = bowlingPlayer;
    const limitedBowler = {
      id: 'p2',
      full_name: 'Limited Bowler',
      picture: null,
      reserve: false,
      stats: { ...zeroStats(), overs_bowled: 4 },
    };
    const freshBowler = {
      id: 'p3',
      full_name: 'Fresh Bowler',
      picture: null,
      reserve: false,
      stats: zeroStats(),
    };
    render(
      <PlayerAssignment
        currentPlayers={{ ...currentPlayers, bowler: currentBowler }}
        opponents={{
          ...opponents,
          bowling: { ...opponents.bowling, players: [currentBowler, limitedBowler, freshBowler] },
        }}
        updatePlayer={vi.fn()}
        updateRetiredHurtStatus={vi.fn()}
        disabled={false}
        bowlingLimit={4}
      />
    );

    const bowlerSelect = screen.getByLabelText('Bowler') as HTMLSelectElement;
    const options = Array.from(bowlerSelect.options).filter((o) => o.value !== '');
    expect(options.find((o) => o.textContent?.includes('Bowler One'))).toBeDisabled();
    expect(options.find((o) => o.textContent?.includes('Limited Bowler'))).toBeDisabled();
    expect(options.find((o) => o.textContent?.includes('Fresh Bowler'))).not.toBeDisabled();
  });
});
