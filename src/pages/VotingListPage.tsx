import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useNomineeVotingPlayers } from '@/hooks/useVoting';

export default function VotingListPage() {
  const { data, isLoading, isError } = useNomineeVotingPlayers();

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title="Voting polls"
          description="Tournament player nominations and vote standings"
          action={
            <Link
              to="/dashboard/voting/new"
              className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
            >
              Create nomination
            </Link>
          }
        />
        {isLoading && !data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Unable to load voting polls.</div>
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
            data={data?.results ?? []}
            loading={isLoading}
            emptyMessage="No voting nominations yet."
          />
        )}
      </div>
    </TenantRequired>
  );
}
