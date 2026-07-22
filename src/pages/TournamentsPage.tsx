import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useTournaments, useUpdateTournament } from '@/hooks/useTournaments';
import type { Tournament } from '@/api/tournaments';

const PAGE_SIZE = 20;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TournamentsPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Tournament | null>(null);
  const { data, isLoading, isError } = useTournaments({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const updateTournament = useUpdateTournament();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load tournaments.
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
        Unable to load tournaments. Check your API connection and tenant access.
      </div>
    );
  }

  const tournaments = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Tournaments</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant.name} · league tournaments
          </p>
        </div>
        <Link
          to="/dashboard/tournaments/new"
          className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
        >
          New Tournament
        </Link>
      </div>

      <DataTable
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'teams', header: 'Teams', cell: (row) => row.total_teams },
          {
            id: 'start',
            header: 'Start date',
            cell: (row) => formatDate(row.start),
          },
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
                  to={`/dashboard/tournaments/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                <Link
                  to={`/dashboard/fixtures/new/bulk?tournamentId=${row.id}`}
                  className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Add matches
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
        data={tournaments}
        loading={isLoading}
        emptyMessage="No tournaments found."
        pagination={
          data
            ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count }
            : undefined
        }
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={targetRow?.is_active ? 'Deactivate tournament' : 'Reactivate tournament'}
        description={
          targetRow?.is_active
            ? `Deactivate "${targetRow?.name}"? It will no longer be shown as active.`
            : `Reactivate "${targetRow?.name}"?`
        }
        confirmLabel={targetRow?.is_active ? 'Deactivate' : 'Reactivate'}
        isLoading={updateTournament.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          updateTournament.mutate(
            { id: targetRow.id, payload: { is_active: !targetRow.is_active } },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />
    </div>
  );
}
