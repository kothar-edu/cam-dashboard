import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { useTenant } from '@/contexts/TenantContext';
import { useDeleteSponsor, useSponsors } from '@/hooks/useSponsors';
import type { Sponsor } from '@/api/sponsors';

const PAGE_SIZE = 20;

export default function SponsorsPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Sponsor | null>(null);
  const { data, isLoading, isError } = useSponsors({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const deleteSponsor = useDeleteSponsor();

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
      <PageHeader
        title="Sponsors"
        description={`${activeTenant.name} · league sponsors`}
        action={
          <Link
            to="/dashboard/sponsors/new"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            New Sponsor
          </Link>
        }
      />

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
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <>
                <Link
                  to={`/dashboard/sponsors/${row.id}`}
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
                  Delete
                </button>
              </>
            ),
          },
        ]}
        data={sponsors}
        loading={isLoading}
        emptyMessage="No sponsors found."
        pagination={data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined}
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this sponsor?"
        description="This will permanently remove the sponsor. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteSponsor.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          deleteSponsor.mutate(targetRow.id, { onSuccess: () => setConfirmOpen(false) });
        }}
      />
    </div>
  );
}
