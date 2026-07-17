import { useState } from 'react';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Player } from '@/api/players';
import type { Team } from '@/api/teams';
import { useTenant } from '@/contexts/TenantContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { useTransferPlayer } from '@/hooks/useTransfers';

const PAGE_SIZE = 20;

export default function TransfersPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const { data: playersData, isLoading, isError } = usePlayers({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const { data: teamsData } = useTeams();
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
          setDialogOpen(false);
          setSelectedPlayerId('');
          setSelectedTeamId('');
        },
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

  if (isLoading && !playersData) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Player Transfers</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant.name} · move players between teams
          </p>
        </div>

        <Button type="button" onClick={() => setDialogOpen(true)}>
          Transfer player
        </Button>
      </div>

      <DataTable<Player>
        columns={[
          { id: 'name', header: 'Player', cell: (row) => row.full_name },
          { id: 'team', header: 'Current team', cell: (row) => row.team_name ?? '—' },
          { id: 'jersey', header: 'Jersey', cell: (row) => row.jersey_no ?? '—' },
          {
            id: 'status',
            header: 'Status',
            cell: (row) => (row.is_active ? 'Active' : 'Inactive'),
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

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#12233D]">Transfer player</h3>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!selectedPlayerId || !selectedTeamId || transferMutation.isPending}
                  onClick={handleTransfer}
                >
                  {transferMutation.isPending ? 'Transferring…' : 'Transfer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
