import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBug } from './ScoreBug';

const current = {
  over: 4, ball: 2, inning: 1, runs: 38, wickets: 2, target: 0, crr: 8.6,
  balls_remaining: 96, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 0,
};

function zeroStats() {
  return {
    runs_scored: 0, balls_faced: 0, fours: 0, sixes: 0, is_out: false, crr: 0, srr: 0,
    runs_conceded: 0, overs_bowled: 0, wickets_taken: 0, wickets_lost: 0, maidens: 0, err: 0,
  };
}

const battingTeam = { id: 'a', name: 'Team A', code: 'TMA', logo: null, players: [], stats: zeroStats() };
const bowlingTeam = { id: 'b', name: 'Team B', code: 'TMB', logo: null, players: [], stats: zeroStats() };

describe('ScoreBug', () => {
  it('shows the batting team code, score, overs, and current run rate', () => {
    render(<ScoreBug current={current} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />);
    expect(screen.getByText('TMA')).toBeInTheDocument();
    expect(screen.getByText('38-2')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText(/CRR: 8.6/)).toBeInTheDocument();
    expect(screen.getByText(/Balls Left: 96/)).toBeInTheDocument();
  });

  it('shows Target when chasing instead of the inning label', () => {
    render(<ScoreBug current={{ ...current, target: 150 }} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />);
    expect(screen.getByText(/Target: 150/)).toBeInTheDocument();
  });
});
