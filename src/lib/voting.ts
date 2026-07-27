import type { NomineeVotingPlayer, VotingPlayerResult, VotingPoll } from '@/api/voting';

export function sortByVotes(players: VotingPlayerResult[]): VotingPlayerResult[] {
  return [...players].sort((a, b) => (b.total_votes ?? 0) - (a.total_votes ?? 0));
}

export function totalVotes(players: VotingPlayerResult[]): number {
  return players.reduce((sum, player) => sum + (player.total_votes ?? 0), 0);
}

export function voteShare(votes: number, total: number): number {
  if (!total) return 0;
  return Math.round((votes / total) * 1000) / 10;
}

export function findPollForNomination(
  nomination: NomineeVotingPlayer,
  polls: VotingPoll[]
): VotingPoll | null {
  return polls.find((poll) => poll.tournament.id === nomination.tournament.id) ?? null;
}

/** Merge nomination roster with live vote totals (includes zero-vote nominees). */
export function buildStandings(
  nomination: NomineeVotingPlayer,
  poll: VotingPoll | null
): VotingPlayerResult[] {
  const votesById = new Map(
    (poll?.player ?? []).map((player) => [String(player.id), player.total_votes ?? 0])
  );

  const roster: VotingPlayerResult[] = nomination.player.map((player) => ({
    ...player,
    total_votes: votesById.get(String(player.id)) ?? 0,
    team_name: player.team_name ?? null,
  }));

  // Include any voted players missing from nomination payload (edge case).
  for (const voted of poll?.player ?? []) {
    if (!roster.some((p) => String(p.id) === String(voted.id))) {
      roster.push({
        ...voted,
        total_votes: voted.total_votes ?? 0,
        team_name: voted.team_name ?? null,
      });
    }
  }

  return sortByVotes(roster);
}

export function leaderOf(standings: VotingPlayerResult[]): VotingPlayerResult | null {
  const top = standings[0];
  if (!top || !(top.total_votes ?? 0)) return null;
  return top;
}

export type VotingSummary = {
  pollCount: number;
  openCount: number;
  closedCount: number;
  nomineeCount: number;
  ballotCount: number;
};

export function summarizePolls(
  nominations: NomineeVotingPlayer[],
  polls: VotingPoll[]
): VotingSummary {
  let nomineeCount = 0;
  let ballotCount = 0;
  let openCount = 0;

  for (const nomination of nominations) {
    nomineeCount += nomination.player.length;
    if (nomination.is_voting_open) openCount += 1;
    const poll = findPollForNomination(nomination, polls);
    ballotCount += totalVotes(poll?.player ?? []);
  }

  return {
    pollCount: nominations.length,
    openCount,
    closedCount: nominations.length - openCount,
    nomineeCount,
    ballotCount,
  };
}
