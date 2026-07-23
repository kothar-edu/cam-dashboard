import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentaryBar } from './CommentaryBar';

function zeroStats() {
  return { runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, crr: 0, srr: 0, runs_conceded: 0, overs_bowled: 0, wickets_taken: 0, wickets_lost: 0, maidens: 0, err: 0 };
}

const battingTeam = { id: 'a', name: 'Team A', code: 'A', logo: null, players: [], stats: zeroStats() };
const bowlingTeam = { id: 'b', name: 'Team B', code: 'B', logo: null, players: [], stats: zeroStats() };

const chasingCurrent = {
  over: 10, ball: 0, inning: 2, runs: 80, wickets: 3, target: 150, crr: 8,
  balls_remaining: 60, required_runs: 70, rrr: 7, status: 'IN_PROGRESS', projected: 0,
};

describe('CommentaryBar', () => {
  it('shows ground, chase requirement, and team names while chasing', () => {
    render(<CommentaryBar current={chasingCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText={null} />);
    expect(screen.getByText('Central Oval')).toBeInTheDocument();
    expect(screen.getByText(/70 RUNS NEEDED IN 60/)).toBeInTheDocument();
    expect(screen.getByText(/RRR: 7/)).toBeInTheDocument();
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
  });
});
