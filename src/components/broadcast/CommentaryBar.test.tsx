import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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

const firstInningsCurrent = {
  over: 10, ball: 0, inning: 1, runs: 90, wickets: 2, target: 0, crr: 9,
  balls_remaining: 60, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 187,
};

afterEach(() => {
  vi.useRealTimers();
});

describe('CommentaryBar', () => {
  it('shows ground, chase requirement, and team names while chasing', () => {
    render(<CommentaryBar current={chasingCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText={null} />);
    expect(screen.getByText('Central Oval')).toBeInTheDocument();
    expect(screen.getByText(/70 RUNS NEEDED IN 60/)).toBeInTheDocument();
    expect(screen.getByText(/RRR: 7/)).toBeInTheDocument();
    expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
  });

  it('shows the projected score during the initial stats phase', () => {
    render(<CommentaryBar current={firstInningsCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText="Powered by Acme" />);
    expect(screen.getByText(/Projected: 187/)).toBeInTheDocument();
    expect(screen.queryByText('Powered by Acme')).not.toBeInTheDocument();
  });

  it('slides over to the sponsor text after the stats phase elapses, then back to stats', () => {
    vi.useFakeTimers();
    render(<CommentaryBar current={firstInningsCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText="Powered by Acme" />);
    expect(screen.getByText(/Projected: 187/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(20001);
    });
    expect(screen.getByText('Powered by Acme')).toBeInTheDocument();
    expect(screen.queryByText(/Projected: 187/)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText(/Projected: 187/)).toBeInTheDocument();
    expect(screen.queryByText('Powered by Acme')).not.toBeInTheDocument();
  });

  it('always shows sponsor text once the match has ended, regardless of phase', () => {
    render(
      <CommentaryBar
        current={{ ...firstInningsCurrent, status: 'END_OF_MATCH' }}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        ground="Central Oval"
        sponsorText="Powered by Acme"
      />,
    );
    expect(screen.getByText('Powered by Acme')).toBeInTheDocument();
  });
});
