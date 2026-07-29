import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { useTenant } from '@/contexts/TenantContext';
import { usePlayers, useUpdatePlayer } from '@/hooks/usePlayers';
import type { Player } from '@/api/players';

const PAGE_SIZE = 20;

export default function PlayersPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Player | null>(null);
  const { data, isLoading, isError } = usePlayers({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const updatePlayerMutation = useUpdatePlayer();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load players.
        </p>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load players. Check your API connection and tenant access.
      </div>
    );
  }

  const players = data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description={`${activeTenant.name} · player registry`}
        action={
          <Link
            to="/dashboard/players/new"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            New Player
          </Link>
        }
      />

      <DataTable
        columns={[
          {
            id: 'name',
            header: 'Name',
            cell: (row) => (
              <Link
                to={`/dashboard/players/${row.id}/stats`}
                className="font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
              >
                {row.full_name}
              </Link>
            ),
          },
          { id: 'jersey', header: 'Jersey', cell: (row) => row.jersey_no ?? '—' },
          { id: 'team', header: 'Team', cell: (row) => row.team_name ?? '—' },
          {
            id: 'status',
            header: 'Status',
            cell: (row) => (row.is_active ? 'Active' : 'Inactive'),
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <>
                <Link
                  to={`/dashboard/players/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTargetRow(row);
                    setConfirmOpen(true);
                  }}
                  className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-red-600"
                >
                  {row.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </>
            ),
          },
        ]}
        data={players}
        loading={isLoading}
        emptyMessage="No players found."
        pagination={data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined}
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={targetRow?.is_active ? 'Deactivate player' : 'Reactivate player'}
        description={
          targetRow
            ? `Are you sure you want to ${targetRow.is_active ? 'deactivate' : 'reactivate'} ${targetRow.full_name}?`
            : ''
        }
        confirmLabel={targetRow?.is_active ? 'Deactivate' : 'Reactivate'}
        isLoading={updatePlayerMutation.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          updatePlayerMutation.mutate(
            {
              id: targetRow.id,
              payload: { is_active: !targetRow.is_active },
            },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />
    </div>
  );
}
