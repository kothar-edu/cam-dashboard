import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBug } from './ScoreBug';

const current = {
  over: 4,
  ball: 2,
  inning: 1,
  runs: 38,
  wickets: 2,
  target: 0,
  crr: 8.6,
  balls_remaining: 96,
  required_runs: 0,
  rrr: 0,
  status: 'IN_PROGRESS',
  projected: 0,
};

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

const battingTeam = {
  id: 'a',
  name: 'Team A',
  code: 'TMA',
  logo: null,
  players: [],
  stats: zeroStats(),
};
const bowlingTeam = {
  id: 'b',
  name: 'Team B',
  code: 'TMB',
  logo: null,
  players: [],
  stats: zeroStats(),
};

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
    render(
      <ScoreBug
        current={{ ...current, target: 150 }}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
      />
    );
    expect(screen.getByText(/Target: 150/)).toBeInTheDocument();
  });

  const endedCurrent = { ...current, status: 'END_OF_MATCH' };
  const teamA = { id: 'a', name: 'Team A', code: 'TMA', logo: null };
  const teamB = { id: 'b', name: 'Team B', code: 'TMB', logo: null };

  it('falls back to a plain "Match Ended" label when no outcome is available yet', () => {
    render(<ScoreBug current={endedCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />);
    expect(screen.getByText('Match Ended')).toBeInTheDocument();
  });

  it('shows both final scores and the winner for a normal completed match', () => {
    render(
      <ScoreBug
        current={endedCurrent}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        teamA={teamA}
        teamB={teamB}
        outcome={{
          winner: { id: 'a', team: 'Team A' },
          abandoned: false,
          tied: false,
          dls: false,
          forfeit: false,
          forfeitedBy: null,
          score: {
            opponentA: { runsScored: 180, oversBowled: 20, wicketsLost: 6, wicketsTaken: 0 },
            opponentB: { runsScored: 175, oversBowled: 20, wicketsLost: 8, wicketsTaken: 0 },
          },
        }}
      />
    );
    expect(screen.getByText('TMA')).toBeInTheDocument();
    expect(screen.getByText('180-6 (20)')).toBeInTheDocument();
    expect(screen.getByText('TMB')).toBeInTheDocument();
    expect(screen.getByText('175-8 (20)')).toBeInTheDocument();
    expect(screen.getByText('Team A won')).toBeInTheDocument();
  });

  it('shows Match Tied without a winner line', () => {
    render(
      <ScoreBug
        current={endedCurrent}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        teamA={teamA}
        teamB={teamB}
        outcome={{
          winner: null,
          abandoned: false,
          tied: true,
          dls: false,
          forfeit: false,
          forfeitedBy: null,
          score: {
            opponentA: { runsScored: 150, oversBowled: 20, wicketsLost: 10, wicketsTaken: 0 },
            opponentB: { runsScored: 150, oversBowled: 20, wicketsLost: 9, wicketsTaken: 0 },
          },
        }}
      />
    );
    expect(screen.getByText('Match tied')).toBeInTheDocument();
  });

  it('shows Match abandoned with no score row', () => {
    render(
      <ScoreBug
        current={endedCurrent}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        teamA={teamA}
        teamB={teamB}
        outcome={{
          winner: null,
          abandoned: true,
          tied: false,
          dls: false,
          forfeit: false,
          forfeitedBy: null,
          score: null,
        }}
      />
    );
    expect(screen.getByText('Match abandoned')).toBeInTheDocument();
    expect(screen.queryByText('TMA')).not.toBeInTheDocument();
  });

  it('shows the forfeiting team and the winner', () => {
    render(
      <ScoreBug
        current={endedCurrent}
        battingTeam={battingTeam}
        bowlingTeam={bowlingTeam}
        teamA={teamA}
        teamB={teamB}
        outcome={{
          winner: { id: 'b', team: 'Team B' },
          abandoned: false,
          tied: false,
          dls: false,
          forfeit: true,
          forfeitedBy: 'Team A',
          score: null,
        }}
      />
    );
    expect(screen.getByText('Team A forfeited — Team B win')).toBeInTheDocument();
  });
});
