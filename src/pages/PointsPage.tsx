import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { useTenant } from '@/contexts/TenantContext';
import { useTournaments } from '@/hooks/useTournaments';
import { usePointsTable } from '@/hooks/usePointsTable';

function formatNrr(value: number) {
  const formatted = value >= 0 ? `+${value.toFixed(3)}` : value.toFixed(3);
  return formatted;
}

export default function PointsPage() {
  const { activeTenant } = useTenant();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const { data: tournamentsData, isLoading: tournamentsLoading } = useTournaments({
    limit: 100,
  });
  const { data: pointsData, isLoading: pointsLoading, isError } = usePointsTable(
    selectedTournamentId
  );

  const tournaments = tournamentsData?.results ?? [];

  useEffect(() => {
    if (!selectedTournamentId && tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [selectedTournamentId, tournaments]);

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load the points table.
        </p>
      </div>
    );
  }

  const isLoading = tournamentsLoading || (pointsLoading && !pointsData);

  if (isLoading && tournaments.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Points Table</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant.name} · tournament standings
          </p>
        </div>

        {tournaments.length > 0 ? (
          <SearchableSelect
            value={selectedTournamentId ?? ''}
            onChange={setSelectedTournamentId}
            options={tournaments.map((tournament) => ({
              value: tournament.id,
              label: tournament.name,
            }))}
            placeholder="Select tournament"
            searchable
            className="w-full md:w-72 space-y-0"
          />
        ) : null}
      </div>

      {tournaments.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
          No tournaments found. Create a tournament to view standings.
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load points table. Check your API connection and tenant access.
        </div>
      ) : (
        <DataTable
          columns={[
            { id: 'team', header: 'Team', cell: (row) => row.team.name },
            { id: 'played', header: 'Played', cell: (row) => row.matches_played },
            { id: 'won', header: 'Won', cell: (row) => row.matches_won },
            { id: 'lost', header: 'Lost', cell: (row) => row.matches_lost },
            { id: 'tied', header: 'Tied', cell: (row) => row.tied },
            { id: 'points', header: 'Points', cell: (row) => row.points },
            { id: 'nrr', header: 'NRR', cell: (row) => formatNrr(row.nrr) },
          ]}
          data={pointsData ?? []}
          loading={pointsLoading}
          emptyMessage="No standings data for this tournament."
        />
      )}
    </div>
  );
}
