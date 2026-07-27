import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VoteStandingsChart } from '@/components/voting/VoteStandingsChart';
import type { NomineeVotingPlayer, VotingPoll } from '@/api/voting';
import { buildStandings, leaderOf, totalVotes } from '@/lib/voting';
import { cn } from '@/lib/utils';
import { Pencil, Users } from 'lucide-react';

type VotingPollCardProps = {
  nomination: NomineeVotingPlayer;
  poll: VotingPoll | null;
  onToggleVoting: () => void;
  togglePending?: boolean;
};

export function VotingPollCard({
  nomination,
  poll,
  onToggleVoting,
  togglePending,
}: VotingPollCardProps) {
  const standings = buildStandings(nomination, poll);
  const ballots = totalVotes(standings);
  const leader = leaderOf(standings);
  const isOpen = nomination.is_voting_open;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#12233D] via-[#1a3358] to-[#0f1c30] px-4 py-4 text-white sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              isOpen ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/70'
            )}
          >
            {isOpen ? 'Voting open' : 'Voting closed'}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/70">
            {standings.length} nominee{standings.length === 1 ? '' : 's'}
          </span>
        </div>
        <h2 className="text-lg font-semibold leading-tight">{nomination.tournament.name}</h2>
        <p className="mt-2 text-sm text-white/70">
          {ballots > 0 && leader ? (
            <>
              Leader: <span className="font-medium text-[#E8A93B]">{leader.full_name}</span>
              <span className="text-white/50"> · </span>
              {ballots} vote{ballots === 1 ? '' : 's'}
            </>
          ) : (
            'No votes cast yet'
          )}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5">
        <div>
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Vote standings
          </div>
          <div className="max-h-72 overflow-y-auto pr-1">
            <VoteStandingsChart standings={standings} compact />
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link
            to={`/dashboard/voting/${nomination.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-[#12233D] transition hover:border-[#E8A93B]/50 hover:bg-[#E8A93B]/5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Manage poll
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={togglePending}
            onClick={onToggleVoting}
          >
            {isOpen ? 'Close voting' : 'Open voting'}
          </Button>
        </div>
      </div>
    </article>
  );
}
