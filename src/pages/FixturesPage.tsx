import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Radio } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ForfeitDialog } from '@/components/ui/forfeit-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { useTenant } from '@/contexts/TenantContext';
import {
  useFixtures,
  useUpdateFixture,
  useForfeitFixture,
  useAbandonFixture,
} from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import type { Fixture } from '@/api/fixtures';

const PAGE_SIZE = 20;
const STATUS_TABS = ['Live', 'Upcoming', 'Ended'] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const ANY_TEAM_VALUE = '__any__';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function matchLabel(fixture: {
  opponent_a: { team_name: string };
  opponent_b: { team_name: string };
}) {
  return `${fixture.opponent_a.team_name} vs ${fixture.opponent_b.team_name}`;
}

export default function FixturesPage() {
  const { activeTenant } = useTenant();
  const [status, setStatus] = useState<StatusTab>('Upcoming');
  const [pageIndex, setPageIndex] = useState(0);
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Fixture | null>(null);
  const [forfeitOpen, setForfeitOpen] = useState(false);
  const [forfeitRow, setForfeitRow] = useState<Fixture | null>(null);
  const [forfeitedOpponentId, setForfeitedOpponentId] = useState('');
  const [pointsToAward, setPointsToAward] = useState(2);
  const [abandonOpen, setAbandonOpen] = useState(false);
  const [abandonRow, setAbandonRow] = useState<Fixture | null>(null);

  const teamsQuery = useTeams();
  const teamOptions = (teamsQuery.data?.results ?? []).map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const { data, isLoading, isError } = useFixtures({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    status,
    ...(teamAId ? { team: teamAId } : {}),
    ...(teamBId ? { opponent_team: teamBId } : {}),
  });
  const updateFixture = useUpdateFixture();
  const forfeitFixture = useForfeitFixture();
  const abandonFixture = useAbandonFixture();

  const changeStatus = (next: StatusTab) => {
    setStatus(next);
    setPageIndex(0);
  };

  const changeTeamA = (value: string) => {
    setTeamAId(value === ANY_TEAM_VALUE ? '' : value);
    setPageIndex(0);
  };

  const changeTeamB = (value: string) => {
    setTeamBId(value === ANY_TEAM_VALUE ? '' : value);
    setPageIndex(0);
  };

  const clearTeamFilters = () => {
    setTeamAId('');
    setTeamBId('');
    setPageIndex(0);
  };

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load fixtures.
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
        Unable to load fixtures. Check your API connection and tenant access.
      </div>
    );
  }

  const fixtures = data?.results ?? [];
  const hasTeamFilter = Boolean(teamAId || teamBId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fixtures"
        description={`${activeTenant.name} · scheduled matches`}
        action={
          <Link
            to="/dashboard/fixtures/new"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            New Fixture
          </Link>
        }
      />

      <div className="filter-chip-row">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab}
            type="button"
            variant={status === tab ? 'primary' : 'outline'}
            onClick={() => changeStatus(tab)}
            className="flex-1 sm:flex-initial"
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <SearchableSelect
          label="Team A"
          value={teamAId || ANY_TEAM_VALUE}
          onChange={changeTeamA}
          options={[{ value: ANY_TEAM_VALUE, label: 'Any team' }, ...teamOptions]}
          placeholder="Any team"
          searchable
        />
        <SearchableSelect
          label="Team B"
          value={teamBId || ANY_TEAM_VALUE}
          onChange={changeTeamB}
          options={[{ value: ANY_TEAM_VALUE, label: 'Any team' }, ...teamOptions]}
          placeholder="Any team"
          searchable
        />
        {hasTeamFilter ? (
          <Button type="button" variant="outline" onClick={clearTeamFilters}>
            Clear team filter
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={[
          { id: 'match', header: 'Match', cell: (row) => matchLabel(row) },
          {
            id: 'tournament',
            header: 'Tournament',
            cell: (row) => row.tournament?.name ?? '—',
          },
          { id: 'status', header: 'Status', cell: (row) => row.status },
          {
            id: 'scheduled',
            header: 'Scheduled',
            cell: (row) => formatDateTime(row.time),
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex min-w-[12rem] flex-wrap items-center gap-1.5">
                {(row.status === 'Live' || row.status === 'Upcoming') && (
                  <>
                    <Link
                      to={`/dashboard/fixtures/${row.id}/score`}
                      className="inline-flex items-center gap-1 rounded-md border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 sm:px-3 sm:text-sm"
                      title="Score Live"
                    >
                      <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Score
                    </Link>
                    <Link
                      to={`/broadcast/${row.id}?tenant=${activeTenant?.schema_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-[#12233D] hover:bg-gray-50 sm:px-3 sm:text-sm"
                      title="OBS overlay"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </>
                )}
                <Link
                  to={`/dashboard/fixtures/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-2 py-1 text-xs text-[#12233D] hover:bg-gray-50 sm:px-3 sm:text-sm"
                >
                  Edit
                </Link>
                {(row.status === 'Upcoming' || row.status === 'Live') && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setForfeitRow(row);
                        setForfeitedOpponentId('');
                        setPointsToAward(2);
                        setForfeitOpen(true);
                      }}
                      className="inline-flex items-center rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-xs text-orange-700 hover:bg-orange-100 sm:px-3 sm:text-sm"
                    >
                      Forfeit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAbandonRow(row);
                        setAbandonOpen(true);
                      }}
                      className="inline-flex items-center rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-100 sm:px-3 sm:text-sm"
                    >
                      Abandon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetRow(row);
                        setConfirmOpen(true);
                      }}
                      className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 sm:px-3 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={fixtures}
        loading={isLoading}
        emptyMessage={
          hasTeamFilter
            ? `No ${status.toLowerCase()} fixtures found for the selected team(s).`
            : `No ${status.toLowerCase()} fixtures found.`
        }
        pagination={data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined}
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this fixture?"
        description="This marks the match as Cancelled. It will no longer appear as scheduled, but no data is deleted — you can reverse this later by editing the fixture's status back."
        confirmLabel="Cancel match"
        isLoading={updateFixture.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          updateFixture.mutate(
            { id: targetRow.id, payload: { status: 'Cancelled' } },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />

      <ForfeitDialog
        open={forfeitOpen}
        onOpenChange={(open) => {
          setForfeitOpen(open);
          if (!open) {
            setForfeitRow(null);
            setForfeitedOpponentId('');
            setPointsToAward(2);
          }
        }}
        isLoading={forfeitFixture.isPending}
        onConfirm={() => {
          if (!forfeitRow || !forfeitedOpponentId) return;
          forfeitFixture.mutate(
            {
              id: forfeitRow.id,
              payload: {
                forfeited_opponent_id: forfeitedOpponentId,
                points_to_award: pointsToAward,
              },
            },
            {
              onSuccess: () => {
                setForfeitOpen(false);
                setForfeitRow(null);
                setForfeitedOpponentId('');
                setPointsToAward(2);
              },
            }
          );
        }}
        teamAName={forfeitRow?.opponent_a.team_name ?? ''}
        teamBName={forfeitRow?.opponent_b.team_name ?? ''}
        teamAId={forfeitRow?.opponent_a.id ?? ''}
        teamBId={forfeitRow?.opponent_b.id ?? ''}
        forfeitedOpponentId={forfeitedOpponentId}
        setForfeitedOpponentId={setForfeitedOpponentId}
        pointsToAward={pointsToAward}
        setPointsToAward={setPointsToAward}
      />

      <ConfirmDialog
        open={abandonOpen}
        onOpenChange={(open) => {
          setAbandonOpen(open);
          if (!open) {
            setAbandonRow(null);
          }
        }}
        title="Abandon this match?"
        description="This marks the match as abandoned with no result. Both teams will receive 1 point (in group stage), lineups will be cleared, and no winner will be declared. This cannot be easily reversed."
        confirmLabel="Abandon match"
        isLoading={abandonFixture.isPending}
        onConfirm={() => {
          if (!abandonRow) return;
          abandonFixture.mutate(abandonRow.id, {
            onSuccess: () => {
              setAbandonOpen(false);
              setAbandonRow(null);
            },
          });
        }}
      />
    </div>
  );
}
