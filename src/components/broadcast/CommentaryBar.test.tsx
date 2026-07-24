import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CommentaryBar } from './CommentaryBar';

// MarqueeBox always renders an extra invisible measurement copy of its children
// alongside the visible one, so text/images inside it match twice by design.
function expectVisible(matcher: string | RegExp) {
  expect(screen.getAllByText(matcher).length).toBeGreaterThan(0);
}

function expectAbsent(matcher: string | RegExp) {
  expect(screen.queryAllByText(matcher)).toHaveLength(0);
}

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
    expectVisible('Central Oval');
    expectVisible(/70 RUNS NEEDED IN 60/);
    expectVisible(/RRR: 7/);
    expectVisible('Team A');
    expectVisible('Team B');
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('shows each team logo next to its name when set', () => {
    const withLogos = {
      battingTeam: { ...battingTeam, logo: 'https://example.com/a.png' },
      bowlingTeam: { ...bowlingTeam, logo: 'https://example.com/b.png' },
    };
    render(
      <CommentaryBar
        current={chasingCurrent}
        battingTeam={withLogos.battingTeam}
        bowlingTeam={withLogos.bowlingTeam}
        ground="Central Oval"
        sponsorText={null}
      />,
    );
    const srcs = screen.getAllByRole('img').map((img) => img.getAttribute('src'));
    expect(srcs).toContain('https://example.com/a.png');
    expect(srcs).toContain('https://example.com/b.png');
  });

  it('shows the projected score during the initial stats phase', () => {
    render(<CommentaryBar current={firstInningsCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText="Powered by Acme" />);
    expectVisible(/Projected: 187/);
    expectAbsent('Powered by Acme');
  });

  it('slides over to the sponsor text after the stats phase elapses, then back to stats', () => {
    vi.useFakeTimers();
    render(<CommentaryBar current={firstInningsCurrent} battingTeam={battingTeam} bowlingTeam={bowlingTeam} ground="Central Oval" sponsorText="Powered by Acme" />);
    expectVisible(/Projected: 187/);

    act(() => {
      vi.advanceTimersByTime(20001);
    });
    expectVisible('Powered by Acme');
    expectAbsent(/Projected: 187/);

    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expectVisible(/Projected: 187/);
    expectAbsent('Powered by Acme');
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
    expectVisible('Powered by Acme');
  });
});
