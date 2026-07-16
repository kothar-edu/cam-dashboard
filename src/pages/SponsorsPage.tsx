import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useSponsors } from '@/hooks/useSponsors';

const PAGE_SIZE = 20;

export default function SponsorsPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isLoading, isError } = useSponsors({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load sponsors.
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
        Unable to load sponsors. Check your API connection and tenant access.
      </div>
    );
  }

  const sponsors = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Sponsors</h1>
        <p className="text-sm text-muted-foreground">
          {activeTenant.name} · league sponsors
        </p>
      </div>

      <DataTable
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'tier', header: 'Tier', cell: (row) => row.sponsor_type },
          {
            id: 'website',
            header: 'Website',
            cell: (row) => row.supported_url ?? '—',
          },
          {
            id: 'info',
            header: 'Extra info',
            cell: (row) => row.extra_info ?? '—',
          },
        ]}
        data={sponsors}
        loading={isLoading}
        emptyMessage="No sponsors found."
        pagination={
          data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined
        }
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />
    </div>
  );
}
