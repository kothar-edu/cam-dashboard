import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTeams, useSetTeamActive } from '@/hooks/useTeams';
import type { Team } from '@/api/teams';

export default function TeamsPage() {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useTeams({ limit: 200 });
  const setTeamActive = useSetTeamActive();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Team | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim().toLowerCase());
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const teams = useMemo(() => {
    return (data?.results ?? []).filter((team) => {
      if (status === 'active' && !team.is_active) return false;
      if (status === 'inactive' && team.is_active) return false;
      if (!search) return true;
      return team.name.toLowerCase().includes(search) || team.code.toLowerCase().includes(search);
    });
  }, [data?.results, search, status]);

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load teams.
        </p>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load teams. Check your API connection and tenant access.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description={`${activeTenant.name} · ${data?.count ?? 0} registered`}
        action={
          <Link
            to="/dashboard/teams/new"
            className="inline-flex w-full items-center justify-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white sm:w-auto"
          >
            New Team
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <DebouncedSearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search teams…"
          aria-label="Search teams"
        />
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={`rounded-md px-3 py-2 text-sm font-medium capitalize ${
                status === key
                  ? 'bg-[#12233D] text-white'
                  : 'border border-slate-200 text-[#12233D]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-muted-foreground">
          No teams found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Link to={`/dashboard/teams/${team.id}/roster`} className="flex items-center gap-3">
                {team.logo ? (
                  <img src={team.logo} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12233D] text-sm font-bold text-white">
                    {team.code?.slice(0, 2) || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[#12233D]">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {team.code} · {team.total_players ?? 0} players
                  </p>
                </div>
              </Link>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    team.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {team.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/teams/${team.id}`}
                    className="rounded-md border border-slate-200 px-3 py-1 text-sm text-[#12233D]"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetRow(team);
                      setConfirmOpen(true);
                    }}
                    className="rounded-md border border-slate-200 px-3 py-1 text-sm text-red-600"
                  >
                    {team.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={targetRow?.is_active ? 'Deactivate team' : 'Reactivate team'}
        description={
          targetRow?.is_active
            ? 'This hides the team from active lists without deleting its match history. You can reactivate it later.'
            : 'This restores the team to active lists. Its match history was never removed.'
        }
        confirmLabel={targetRow?.is_active ? 'Deactivate' : 'Reactivate'}
        isLoading={setTeamActive.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          setTeamActive.mutate(
            { id: targetRow.id, isActive: !targetRow.is_active },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />
    </div>
  );
}
