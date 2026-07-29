import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { useTenant } from '@/contexts/TenantContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePlayers, useUpdatePlayer } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import type { Player } from '@/api/players';

const PAGE_SIZE = 20;
const ANY_TEAM = '__any__';

export default function PlayersPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());
  const [teamId, setTeamId] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Player | null>(null);
  const teamsQuery = useTeams({ limit: 200 });
  const updatePlayerMutation = useUpdatePlayer();

  useEffect(() => {
    setPageIndex(0);
  }, [search, teamId]);

  const { data, isLoading, isError } = usePlayers({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(teamId ? { current_team: teamId } : {}),
  });

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

  if (isError && !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load players. Check your API connection and tenant access.
      </div>
    );
  }

  const players = (data?.results ?? []).filter((player) => {
    if (status === 'active') return player.is_active;
    if (status === 'inactive') return !player.is_active;
    return true;
  });

  const teamOptions = [
    { value: ANY_TEAM, label: 'All teams' },
    ...(teamsQuery.data?.results ?? []).map((team) => ({
      value: team.id,
      label: team.name,
    })),
  ];

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

      <div className="sticky top-0 z-10 space-y-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
          <DebouncedSearchField
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name or email…"
            aria-label="Search players"
          />
          <SearchableSelect
            label="Team"
            value={teamId || ANY_TEAM}
            onChange={(next) => setTeamId(next === ANY_TEAM ? '' : next)}
            options={teamOptions}
            searchable
          />
          <div className="flex items-end gap-2">
            {(['all', 'active', 'inactive'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${
                  status === key
                    ? 'bg-[#12233D] text-white'
                    : 'border border-slate-200 text-[#12233D]'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : (
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
            {
              id: 'team',
              header: 'Team',
              cell: (row) =>
                row.current_team ? (
                  <Link
                    to={`/dashboard/teams/${row.current_team}/roster`}
                    className="text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
                  >
                    {row.team_name ?? '—'}
                  </Link>
                ) : (
                  (row.team_name ?? '—')
                ),
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
      )}

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
