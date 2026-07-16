import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useNomineeVotingPlayers, useVotingPolls } from '@/hooks/useVoting';
import type { NomineeVotingPlayer } from '@/api/voting';
import type { VotingPoll } from '@/api/voting';

export default function VotingListPage() {
  const nominationsQuery = useNomineeVotingPlayers();
  const pollsQuery = useVotingPolls();
  const isLoading = nominationsQuery.isLoading || pollsQuery.isLoading;
  const isError = nominationsQuery.isError || pollsQuery.isError;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title="Voting polls"
          description="Manage tournament player nominations and view fan vote standings"
          action={
            <Link
              to="/dashboard/voting/new"
              className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
            >
              Create nomination
            </Link>
          }
        />
        {isLoading && !nominationsQuery.data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Unable to load voting polls.</div>
        ) : (
          <>
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
                  id: 'standings',
                  header: 'Vote leader',
                  cell: (row) => formatVoteLeader(row, pollsQuery.data?.results ?? []),
                },
                {
                  id: 'actions',
                  header: 'Actions',
                  cell: (row) => (
                    <Link
                      to={`/dashboard/voting/${row.id}`}
                      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                    >
                      Edit
                    </Link>
                  ),
                },
              ]}
              data={nominationsQuery.data?.results ?? []}
              loading={isLoading}
              emptyMessage="No voting nominations yet."
            />
            <p className="text-sm text-muted-foreground">
              Admin manages nominee lists via this dashboard. End-user voting happens in the mobile app using the
              newsfeed voting API — not the legacy mock poll model.
            </p>
          </>
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
