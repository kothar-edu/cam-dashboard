import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useFixtures, useUpdateFixture } from '@/hooks/useFixtures';
import type { Fixture } from '@/api/fixtures';

const PAGE_SIZE = 20;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function matchLabel(fixture: { opponent_a: { team_name: string }; opponent_b: { team_name: string } }) {
  return `${fixture.opponent_a.team_name} vs ${fixture.opponent_b.team_name}`;
}

export default function FixturesPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Fixture | null>(null);
  const { data, isLoading, isError } = useFixtures({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const updateFixture = useUpdateFixture();

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
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Fixtures</h1>
          <p className="text-sm text-muted-foreground">{activeTenant.name} · scheduled matches</p>
        </div>
        <Link
          to="/dashboard/fixtures/new"
          className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
        >
          New Fixture
        </Link>
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
              <>
                <Link
                  to={`/dashboard/fixtures/${row.id}`}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                {(row.status === 'Upcoming' || row.status === 'Live') ? (
                  <button
                    type="button"
                    onClick={() => { setTargetRow(row); setConfirmOpen(true); }}
                    className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-red-600"
                  >
                    Cancel match
                  </button>
                ) : null}
              </>
            ),
          },
        ]}
        data={fixtures}
        loading={isLoading}
        emptyMessage="No fixtures found."
        pagination={
          data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined
        }
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
    </div>
  );
}
