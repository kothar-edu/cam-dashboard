import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import {
  MatchTeamPairFilter,
  type MatchTeamPairValue,
} from '@/components/filters/MatchTeamPairFilter';
import { Button } from '@/components/ui/button';
import { FixtureActionsMenu } from '@/components/fixtures/FixtureActionsMenu';
import { FixtureStatusBadge } from '@/components/fixtures/FixtureStatusBadge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { useTenant } from '@/contexts/TenantContext';
import { useFixtures } from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import { formatFixtureDateTime, matchHref, matchLabel } from '@/lib/fixtures';

const PAGE_SIZE = 20;
const STATUS_TABS = ['Live', 'Upcoming', 'Ended'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function FixturesPage() {
  const { activeTenant } = useTenant();
  const [status, setStatus] = useState<StatusTab>('Upcoming');
  const [pageIndex, setPageIndex] = useState(0);
  const [pair, setPair] = useState<MatchTeamPairValue>({ teamId: '', opponentTeamId: '' });

  const teamsQuery = useTeams({ limit: 200 });
  const teamOptions = (teamsQuery.data?.results ?? []).map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const { data, isLoading, isError } = useFixtures({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    status,
    ...(pair.teamId ? { team: pair.teamId } : {}),
    ...(pair.opponentTeamId ? { opponent_team: pair.opponentTeamId } : {}),
  });

  const changeStatus = (next: StatusTab) => {
    setStatus(next);
    setPageIndex(0);
  };

  const changePair = (next: MatchTeamPairValue) => {
    setPair(next);
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

      <MatchTeamPairFilter value={pair} onChange={changePair} teamOptions={teamOptions} />

      <DataTable
        columns={[
          {
            id: 'match',
            header: 'Match',
            cell: (row) => (
              <Link
                to={matchHref(row)}
                className="font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
              >
                {matchLabel(row)}
              </Link>
            ),
          },
          {
            id: 'tournament',
            header: 'Tournament',
            cell: (row) =>
              row.tournament?.id ? (
                <Link
                  to={`/dashboard/tournaments/${row.tournament.id}/stats`}
                  className="text-[#12233D] underline-offset-2 hover:underline"
                >
                  {row.tournament.name}
                </Link>
              ) : (
                (row.tournament?.name ?? '—')
              ),
          },
          { id: 'status', header: 'Status', cell: (row) => <FixtureStatusBadge status={row.status} /> },
          {
            id: 'scheduled',
            header: 'Scheduled',
            cell: (row) => formatFixtureDateTime(row.time),
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => <FixtureActionsMenu fixture={row} />,
          },
        ]}
        data={fixtures}
        loading={isLoading}
        emptyMessage={
          pair.teamId || pair.opponentTeamId
            ? `No ${status.toLowerCase()} fixtures found for the selected team(s).`
            : `No ${status.toLowerCase()} fixtures found.`
        }
        pagination={data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined}
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />
    </div>
  );
}
