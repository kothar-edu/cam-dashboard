import { useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { StandingsTable } from '@/components/points/StandingsTable';
import { PointsStatsPanel } from '@/components/points/PointsStatsPanel';
import { useTenant } from '@/contexts/TenantContext';
import { useTournaments } from '@/hooks/useTournaments';
import { usePointsTable, useTournamentPlayerStats } from '@/hooks/usePointsTable';
import { filterByGroup, uniqueGroups } from '@/lib/pointsTable';
import { cn } from '@/lib/utils';

export default function PointsPage() {
  const { activeTenant } = useTenant();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | 'all'>('all');

  const { data: tournamentsData, isLoading: tournamentsLoading } = useTournaments({
    limit: 100,
  });
  const {
    data: pointsData,
    isLoading: pointsLoading,
    isError,
  } = usePointsTable(selectedTournamentId);

  const battersQuery = useTournamentPlayerStats(selectedTournamentId, {
    limit: 5,
    ordering: '-total_runs_scored',
  });
  const bowlersQuery = useTournamentPlayerStats(selectedTournamentId, {
    limit: 5,
    ordering: '-total_wickets_taken',
  });

  const tournaments = tournamentsData?.results ?? [];
  const allRows = pointsData ?? [];
  const groups = useMemo(() => uniqueGroups(allRows), [allRows]);
  const filteredRows = useMemo(
    () => filterByGroup(allRows, groupFilter),
    [allRows, groupFilter]
  );

  useEffect(() => {
    if (!selectedTournamentId && tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0].id);
    }
  }, [selectedTournamentId, tournaments]);

  useEffect(() => {
    setGroupFilter('all');
  }, [selectedTournamentId]);

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

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Points Table"
        description={
          selectedTournament
            ? `${activeTenant.name} · ${selectedTournament.name}`
            : `${activeTenant.name} · tournament standings`
        }
        action={
          tournaments.length > 0 ? (
            <SearchableSelect
              value={selectedTournamentId ?? ''}
              onChange={setSelectedTournamentId}
              options={tournaments.map((tournament) => ({
                value: tournament.id,
                label: tournament.name,
              }))}
              placeholder="Select tournament"
              searchable
              className="w-full sm:w-72 space-y-0"
            />
          ) : undefined
        }
      />

      {tournaments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-[#12233D]">No tournaments found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a tournament to view standings and statistics.
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load points table. Check your API connection and tenant access.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.length > 0 ? (
            <div className="filter-chip-row">
              <GroupChip
                active={groupFilter === 'all'}
                onClick={() => setGroupFilter('all')}
                label="All groups"
              />
              {groups.map((group) => (
                <GroupChip
                  key={group}
                  active={groupFilter === group}
                  onClick={() => setGroupFilter(group)}
                  label={`Group ${group}`}
                />
              ))}
            </div>
          ) : null}

          <StandingsTable rows={filteredRows} loading={pointsLoading} />

          {!pointsLoading ? (
            <PointsStatsPanel
              rows={filteredRows}
              topBatters={battersQuery.data?.results ?? []}
              topBowlers={bowlersQuery.data?.results ?? []}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function GroupChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-[#12233D] bg-[#12233D] text-white'
          : 'border-slate-200 bg-white text-muted-foreground hover:border-[#12233D]/40 hover:text-[#12233D]'
      )}
    >
      {label}
    </button>
  );
}
