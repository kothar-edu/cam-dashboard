import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { ScorecardMatchCard } from '@/components/scorecards/ScorecardMatchCard';
import { useTenant } from '@/contexts/TenantContext';
import { useScorecards } from '@/hooks/useScorecards';

const PAGE_SIZE = 12;

export default function ScorecardsPage() {
  const { activeTenant } = useTenant();
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isLoading, isError } = useScorecards({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load scorecards.
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
        Unable to load scorecards. Check your API connection and tenant access.
      </div>
    );
  }

  const scorecards = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scorecards"
        description={`${activeTenant.name} · ${totalCount} completed match${totalCount === 1 ? '' : 'es'}`}
      />

      {scorecards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#12233D]">No completed matches found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ended fixtures with score data will appear here as scorecards.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scorecards.map((fixture) => (
            <ScorecardMatchCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      )}

      {totalCount > PAGE_SIZE ? (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {pageIndex + 1} of {pageCount} ({totalCount} total)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrevious || isLoading}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext || isLoading}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
