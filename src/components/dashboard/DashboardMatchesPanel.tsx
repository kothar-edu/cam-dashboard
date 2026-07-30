import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { FixtureActionsMenu } from '@/components/fixtures/FixtureActionsMenu';
import { FixtureStatusBadge } from '@/components/fixtures/FixtureStatusBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUpcomingFixtures } from '@/hooks/useFixtures';
import { formatFixtureDateTime, matchHref, matchLabel } from '@/lib/fixtures';

const PAGE_SIZE = 8;

export function DashboardMatchesPanel() {
  const [searchInput, setSearchInput] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const search = useDebouncedValue(searchInput.trim());

  useEffect(() => {
    setPageIndex(0);
  }, [search]);

  const { data, isLoading, isError } = useUpcomingFixtures({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(search ? { search } : {}),
  });

  const fixtures = data?.results ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#E8A93B]" />
          <h2 className="text-sm font-semibold text-[#12233D]">Live &amp; Upcoming Matches</h2>
        </div>
        <div className="flex items-center gap-3">
          <DebouncedSearchField
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search team, tournament, or ground…"
            aria-label="Search live and upcoming matches"
            className="w-full sm:w-72"
          />
          <Link
            to="/dashboard/fixtures"
            className="shrink-0 whitespace-nowrap text-sm font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
          >
            View all
          </Link>
        </div>
      </div>

      {isError ? (
        <div className="p-6 text-sm text-red-700">Unable to load matches.</div>
      ) : (
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
              cell: (row) => row.tournament?.name ?? '—',
            },
            {
              id: 'status',
              header: 'Status',
              cell: (row) => <FixtureStatusBadge status={row.status} />,
            },
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
            search
              ? 'No live or upcoming matches match your search.'
              : 'No live or upcoming matches.'
          }
          pagination={data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined}
          onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
        />
      )}
    </div>
  );
}
