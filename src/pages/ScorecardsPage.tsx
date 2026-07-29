import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useScorecards({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(search ? { search } : {}),
  });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPageIndex(0);
  }, [search]);

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

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Search teams, e.g. "Warriors vs GNR"'
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#12233D] shadow-sm outline-none focus:border-[#E8A93B] focus:ring-1 focus:ring-[#E8A93B]"
          aria-label="Search scorecards"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Use &quot;Team A vs Team B&quot; to find that fixture either way around.
        </p>
      </div>

      {scorecards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#12233D]">
            {search ? 'No matches for that search' : 'No completed matches found'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? 'Try another team name or a different “A vs B” pairing.'
              : 'Ended fixtures with score data will appear here as scorecards.'}
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
