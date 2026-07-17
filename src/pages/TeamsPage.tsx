import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useTeams, useSetTeamActive } from '@/hooks/useTeams';
import type { Team } from '@/api/teams';

export default function TeamsPage() {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useTeams();
  const setTeamActive = useSetTeamActive();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Team | null>(null);

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load teams.
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
        Unable to load teams. Check your API connection and tenant access.
      </div>
    );
  }

  const teams = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Teams</h1>
          <p className="text-sm text-muted-foreground">{activeTenant.name} · registered teams</p>
        </div>
        <Link
          to="/dashboard/teams/new"
          className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
        >
          New Team
        </Link>
      </div>

      <DataTable
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'code', header: 'Abbreviation', cell: (row) => row.code },
          { id: 'players', header: 'Players', cell: (row) => row.total_players },
          { id: 'status', header: 'Status', cell: (row) => (row.is_active ? 'Active' : 'Inactive') },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <>
                <Link
                  to={`/dashboard/teams/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => { setTargetRow(row); setConfirmOpen(true); }}
                  className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-red-600"
                >
                  {row.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </>
            ),
          },
        ]}
        data={teams}
        loading={isLoading}
        emptyMessage="No teams found."
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={targetRow?.is_active ? 'Deactivate team' : 'Reactivate team'}
        description={
          targetRow?.is_active
            ? 'This hides the team from active lists without deleting its match history. You can reactivate it later.'
            : 'This restores the team to active lists. Its match history was never removed.'
        }
        confirmLabel={targetRow?.is_active ? 'Deactivate' : 'Reactivate'}
        isLoading={setTeamActive.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          setTeamActive.mutate(
            { id: targetRow.id, isActive: !targetRow.is_active },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />
    </div>
  );
}
