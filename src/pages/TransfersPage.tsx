import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/forms/PageHeader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Player } from '@/api/players';
import type { Team } from '@/api/teams';
import { useTenant } from '@/contexts/TenantContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePlayers } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { useTransferPlayer } from '@/hooks/useTransfers';

const PAGE_SIZE = 20;

export default function TransfersPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    setPageIndex(0);
  }, [search]);

  const {
    data: playersData,
    isLoading,
    isError,
  } = usePlayers({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(search ? { search } : {}),
  });
  const { data: teamsData } = useTeams({ limit: 200 });
  const transferMutation = useTransferPlayer();

  const players = playersData?.results ?? [];
  const teams = teamsData?.results ?? [];
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId);

  const handleTransfer = () => {
    if (!selectedPlayerId || !selectedTeamId) return;
    transferMutation.mutate(
      { playerId: selectedPlayerId, teamId: selectedTeamId },
      {
        onSuccess: () => {
          toast.success('Player transferred.');
          setDialogOpen(false);
          setSelectedPlayerId('');
          setSelectedTeamId('');
        },
        onError: () => toast.error('Transfer failed. Check permissions and try again.'),
      }
    );
  };

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to transfer players.
        </p>
      </div>
    );
  }

  if (isError && !playersData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load players. Check your API connection and tenant access.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Player Transfers"
        description={`${activeTenant.name} · move players between teams`}
        action={
          <Button type="button" onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
            Transfer player
          </Button>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <DebouncedSearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search players to transfer…"
          aria-label="Search players"
        />
      </div>

      {isLoading && !playersData ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : (
        <DataTable<Player>
          columns={[
            {
              id: 'name',
              header: 'Player',
              cell: (row) => (
                <Link
                  to={`/dashboard/players/${row.id}/stats`}
                  className="font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
                >
                  {row.full_name}
                </Link>
              ),
            },
            {
              id: 'team',
              header: 'Current team',
              cell: (row) =>
                row.current_team ? (
                  <Link
                    to={`/dashboard/teams/${row.current_team}/roster`}
                    className="text-[#12233D] underline-offset-2 hover:underline"
                  >
                    {row.team_name ?? '—'}
                  </Link>
                ) : (
                  (row.team_name ?? '—')
                ),
            },
            { id: 'jersey', header: 'Jersey', cell: (row) => row.jersey_no ?? '—' },
            {
              id: 'status',
              header: 'Status',
              cell: (row) => (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {row.is_active ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              id: 'actions',
              header: '',
              cell: (row) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlayerId(row.id);
                    setSelectedTeamId('');
                    setDialogOpen(true);
                  }}
                >
                  Transfer
                </Button>
              ),
            },
          ]}
          data={players}
          loading={isLoading}
          emptyMessage="No players found."
          pagination={
            playersData
              ? { pageIndex, pageSize: PAGE_SIZE, totalCount: playersData.count }
              : undefined
          }
          onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
        />
      )}

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title="Transfer player">
        <div className="mt-4 space-y-4">
          <SearchableSelect
            id="transfer-player"
            label="Player"
            value={selectedPlayerId}
            onChange={setSelectedPlayerId}
            options={players.map((player) => ({
              value: player.id,
              label: `${player.full_name} (${player.team_name ?? 'No team'})`,
            }))}
            placeholder="Select player"
            searchable
          />

          {selectedPlayer ? (
            <SearchableSelect
              id="transfer-team"
              label="New team"
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              options={teams
                .filter((team: Team) => team.id !== selectedPlayer.current_team)
                .map((team) => ({ value: team.id, label: team.name }))}
              placeholder="Select team"
              searchable
            />
          ) : null}

          {transferMutation.isError ? (
            <p className="text-sm text-red-600">
              Transfer failed. Check permissions and try again.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedPlayerId || !selectedTeamId || transferMutation.isPending}
              onClick={handleTransfer}
              className="w-full sm:w-auto"
            >
              {transferMutation.isPending ? 'Transferring…' : 'Transfer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
