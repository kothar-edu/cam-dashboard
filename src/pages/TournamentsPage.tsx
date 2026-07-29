import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useTournaments, useUpdateTournament } from '@/hooks/useTournaments';
import type { Tournament } from '@/api/tournaments';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Tournament | null>(null);
  const { data, isLoading, isError } = useTournaments({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const updateTournament = useUpdateTournament();

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

  if (isError && !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load tournaments. Check your API connection and tenant access.
      </div>
    );
  }

  const tournaments = data?.results ?? [];
  const pageCount = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        description={`${activeTenant.name} · league tournaments`}
        action={
          <Link
            to="/dashboard/tournaments/new"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            New Tournament
          </Link>
        }
      />

      {isLoading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-muted-foreground">
          No tournaments found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((tournament) => (
            <article
              key={tournament.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/dashboard/tournaments/${tournament.id}/stats`}
                    className="block truncate text-lg font-semibold text-[#12233D] hover:text-[#E8A93B]"
                  >
                    {tournament.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(tournament.start)} – {formatDate(tournament.end)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tournament.total_teams} teams
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tournament.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tournament.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/dashboard/tournaments/${tournament.id}/stats?tab=matches`}
                  className="rounded-md bg-[#12233D] px-3 py-1.5 text-sm font-medium text-white"
                >
                  View matches
                </Link>
                <Link
                  to={`/dashboard/fixtures/new/bulk?tournamentId=${tournament.id}`}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-[#12233D]"
                >
                  Add matches
                </Link>
                <Link
                  to={`/dashboard/tournaments/${tournament.id}`}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-[#12233D]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTargetRow(tournament);
                    setConfirmOpen(true);
                  }}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-red-600"
                >
                  {tournament.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {(data?.count ?? 0) > PAGE_SIZE ? (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pageIndex === 0}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pageIndex >= pageCount - 1}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={targetRow?.is_active ? 'Deactivate tournament' : 'Reactivate tournament'}
        description={
          targetRow?.is_active
            ? `Deactivate "${targetRow?.name}"? It will no longer be shown as active.`
            : `Reactivate "${targetRow?.name}"?`
        }
        confirmLabel={targetRow?.is_active ? 'Deactivate' : 'Reactivate'}
        isLoading={updateTournament.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          updateTournament.mutate(
            { id: targetRow.id, payload: { is_active: !targetRow.is_active } },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />
    </div>
  );
}
