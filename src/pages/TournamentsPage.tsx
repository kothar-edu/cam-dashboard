import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useTournaments } from '@/hooks/useTournaments';

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
  const { data, isLoading, isError } = useTournaments({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Tournaments</h1>
        <p className="text-sm text-muted-foreground">
          {activeTenant.name} · league tournaments
        </p>
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
    </div>
  );
}
