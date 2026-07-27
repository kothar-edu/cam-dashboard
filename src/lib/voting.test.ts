import { describe, expect, it } from 'vitest';
import type { NomineeVotingPlayer, VotingPoll } from '@/api/voting';
import {
  buildStandings,
  leaderOf,
  sortByVotes,
  summarizePolls,
  totalVotes,
  voteShare,
} from '@/lib/voting';

const nomination: NomineeVotingPlayer = {
  id: 'n1',
  is_voting_open: true,
  tournament: { id: 't1', name: 'League', logo: null, start: '', total_teams: 2, is_active: true },
  player: [
    {
      id: 'p1',
      full_name: 'Alpha',
      jersey_no: 1,
      current_team: null,
      is_active: true,
      team_name: 'A',
      user: null,
    },
    {
      id: 'p2',
      full_name: 'Beta',
      jersey_no: 2,
      current_team: null,
      is_active: true,
      team_name: 'B',
      user: null,
    },
  ],
};

const poll: VotingPoll = {
  tournament: nomination.tournament,
  player: [
    { ...nomination.player[0], total_votes: 10 },
    { ...nomination.player[1], total_votes: 5 },
  ],
};

describe('voting helpers', () => {
  it('builds ranked standings with vote share', () => {
    const standings = buildStandings(nomination, poll);
    expect(standings.map((p) => p.full_name)).toEqual(['Alpha', 'Beta']);
    expect(totalVotes(standings)).toBe(15);
    expect(voteShare(10, 15)).toBe(66.7);
    expect(leaderOf(standings)?.full_name).toBe('Alpha');
  });

  it('keeps zero-vote nominees and sorts', () => {
    const standings = buildStandings(nomination, {
      tournament: nomination.tournament,
      player: [{ ...nomination.player[1], total_votes: 3 }],
    });
    expect(standings).toHaveLength(2);
    expect(standings[0].full_name).toBe('Beta');
    expect(standings[1].total_votes).toBe(0);
    expect(sortByVotes(standings)[0].full_name).toBe('Beta');
  });

  it('summarizes polls', () => {
    const summary = summarizePolls([nomination], [poll]);
    expect(summary).toEqual({
      pollCount: 1,
      openCount: 1,
      closedCount: 0,
      nomineeCount: 2,
      ballotCount: 15,
    });
  });
});
