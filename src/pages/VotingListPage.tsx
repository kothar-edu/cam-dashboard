import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { Button } from '@/components/ui/button';
import {
  useNomineeVotingPlayers,
  useUpdateNomineeVotingPlayer,
  useVotingPolls,
} from '@/hooks/useVoting';
import { getApiErrorMessage } from '@/lib/api-errors';
import type { NomineeVotingPlayer } from '@/api/voting';
import type { VotingPoll } from '@/api/voting';

export default function VotingListPage() {
  const nominationsQuery = useNomineeVotingPlayers();
  const pollsQuery = useVotingPolls();
  const updateMutation = useUpdateNomineeVotingPlayer();
  const isLoading = nominationsQuery.isLoading || pollsQuery.isLoading;
  const isError = nominationsQuery.isError || pollsQuery.isError;

  const togglePollVoting = (row: NomineeVotingPlayer) => {
    const nextOpen = !row.is_voting_open;
    updateMutation.mutate(
      {
        id: row.id,
        payload: { is_voting_open: nextOpen },
      },
      {
        onSuccess: () => {
          toast.success(nextOpen ? 'Voting opened for this poll.' : 'Voting closed for this poll.');
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, 'Failed to update voting status.'));
        },
      }
    );
  };

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title="Voting polls"
          description="Create nominee lists per tournament, open or close each poll individually, and review standings."
          action={
            <Link
              to="/dashboard/voting/new"
              className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
            >
              Create nomination
            </Link>
          }
        />
        <p className="text-sm text-muted-foreground">
          Use <span className="font-medium">Open voting</span> /{' '}
          <span className="font-medium">Close voting</span> on each row to control what appears on
          the mobile Vote screen. Game settings → Voting open is the organization-wide master switch
          and banner toggle.
        </p>
        {isLoading && !nominationsQuery.data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load voting polls.
          </div>
        ) : (
          <DataTable
            columns={[
              {
                id: 'tournament',
                header: 'Tournament',
                cell: (row) => row.tournament.name,
              },
              {
                id: 'nominees',
                header: 'Nominees',
                cell: (row) => row.player.length,
              },
              {
                id: 'status',
                header: 'Poll status',
                cell: (row) => (
                  <span
                    className={
                      row.is_voting_open
                        ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                        : 'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600'
                    }
                  >
                    {row.is_voting_open ? 'Open' : 'Closed'}
                  </span>
                ),
              },
              {
                id: 'standings',
                header: 'Vote leader',
                cell: (row) => formatVoteLeader(row, pollsQuery.data?.results ?? []),
              },
              {
                id: 'actions',
                header: 'Actions',
                cell: (row) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/dashboard/voting/${row.id}`}
                      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                    >
                      Edit nominees
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => togglePollVoting(row)}
                    >
                      {row.is_voting_open ? 'Close voting' : 'Open voting'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={nominationsQuery.data?.results ?? []}
            loading={isLoading}
            emptyMessage="No voting nominations yet."
          />
        )}
      </div>
    </TenantRequired>
  );
}

function formatVoteLeader(nomination: NomineeVotingPlayer, polls: VotingPoll[]) {
  const poll = polls.find((item) => item.tournament.id === nomination.tournament.id);
  if (!poll?.player?.length) return 'No votes yet';
  const leader = [...poll.player].sort((a, b) => (b.total_votes ?? 0) - (a.total_votes ?? 0))[0];
  if (!leader?.total_votes) return 'No votes yet';
  return `${leader.full_name} (${leader.total_votes})`;
}
