import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Player } from '@/api/players';
import type { DashboardUser } from '@/api/users';
import { mediaUrl } from '@/api/verification';
import { useTeam } from '@/hooks/useTeams';
import { useTeamRoster } from '@/hooks/useTeamRoster';
import { useUsers } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'verified' | 'payment' | 'active' | 'inactive';

type RosterPlayer = Player & {
  pictureUrl: string | null;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPaymentVerified: boolean;
  paymentStatus: string | null;
};

function enrichPlayer(player: Player, usersById: Map<string, DashboardUser>): RosterPlayer {
  const linked = player.user?.id ? usersById.get(player.user.id) : undefined;
  const picture = player.picture ?? player.user?.picture ?? linked?.picture ?? null;

  return {
    ...player,
    pictureUrl: mediaUrl(picture),
    isVerified: Boolean(player.user?.is_verified ?? linked?.is_verified),
    isEmailVerified: Boolean(player.user?.is_email_verified ?? linked?.is_email_verified),
    isPaymentVerified: Boolean(player.user?.is_payment_verified ?? linked?.is_payment_verified),
    paymentStatus: player.user?.payment_status ?? linked?.payment_status ?? null,
  };
}

export default function TeamRosterPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const teamQuery = useTeam(id);
  const rosterQuery = useTeamRoster(id);
  const usersQuery = useUsers({ limit: 500 });

  const usersById = useMemo(() => {
    const map = new Map<string, DashboardUser>();
    for (const user of usersQuery.data?.results ?? []) {
      map.set(user.id, user);
    }
    return map;
  }, [usersQuery.data]);

  const players = useMemo(
    () => (rosterQuery.data ?? []).map((player) => enrichPlayer(player, usersById)),
    [rosterQuery.data, usersById]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter((player) => {
      if (statusFilter === 'verified' && !player.isVerified && !player.isEmailVerified) {
        return false;
      }
      if (statusFilter === 'payment' && !player.isPaymentVerified) return false;
      if (statusFilter === 'active' && !player.is_active) return false;
      if (statusFilter === 'inactive' && player.is_active) return false;
      if (!query) return true;
      return (
        player.full_name.toLowerCase().includes(query) ||
        (player.jersey_no != null && String(player.jersey_no).includes(query)) ||
        (player.role?.toLowerCase().includes(query) ?? false) ||
        (player.user?.email?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [players, search, statusFilter]);

  console.log(filtered);

  const summary = useMemo(
    () => ({
      total: players.length,
      verified: players.filter((p) => p.isVerified || p.isEmailVerified).length,
      paid: players.filter((p) => p.isPaymentVerified).length,
      active: players.filter((p) => p.is_active).length,
    }),
    [players]
  );

  return (
    <TenantRequired message="Choose a tenant from the header to load the team roster.">
      <div className="space-y-6">
        {teamQuery.isLoading && !teamQuery.data ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : teamQuery.isError || !teamQuery.data ? (
          <>
            <PageHeader title="Team" backTo="/dashboard/teams" backLabel="Back to teams" />
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              Unable to load team. Check your API connection and tenant access.
            </div>
          </>
        ) : (
          <>
            <PageHeader
              title={teamQuery.data.name}
              description={`${teamQuery.data.code} · ${teamQuery.data.total_players} player${
                teamQuery.data.total_players === 1 ? '' : 's'
              } · ${teamQuery.data.is_active ? 'Active' : 'Inactive'}`}
              backTo="/dashboard/teams"
              backLabel="Back to teams"
              action={
                <Link
                  to={`/dashboard/teams/${teamQuery.data.id}`}
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#12233D] sm:w-auto"
                >
                  Edit team
                </Link>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryChip label="Players" value={String(summary.total)} />
              <SummaryChip label="Verified" value={String(summary.verified)} />
              <SummaryChip label="Payment done" value={String(summary.paid)} />
              <SummaryChip label="Active" value={String(summary.active)} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, jersey, role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="filter-chip-row">
                {(
                  [
                    ['all', 'All'],
                    ['verified', 'Verified'],
                    ['payment', 'Payment done'],
                    ['active', 'Active'],
                    ['inactive', 'Inactive'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      statusFilter === value
                        ? 'border-[#12233D] bg-[#12233D] text-white'
                        : 'border-slate-200 bg-white text-muted-foreground hover:border-[#12233D]/40 hover:text-[#12233D]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {rosterQuery.isLoading && !rosterQuery.data ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
              </div>
            ) : rosterQuery.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load roster players.
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                <p className="text-sm font-medium text-[#12233D]">No players found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {players.length === 0
                    ? 'This team has no registered players yet.'
                    : 'Try a different search or filter.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </TenantRequired>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-[#12233D]">{value}</p>
    </div>
  );
}

function PlayerCard({ player }: { player: RosterPlayer }) {
  const initials = player.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Link
      to={`/dashboard/players/${player.id}`}
      className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#E8A93B]/50 hover:shadow-md"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {player.pictureUrl ? (
          <img
            src={player.pictureUrl}
            alt={player.full_name}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <div className="flex h-full w-full items-center justify-center bg-[#12233D] text-sm font-semibold text-white">
            {initials}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <UserRound className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[#12233D]">{player.full_name}</h3>
          {player.jersey_no != null ? (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#12233D]">
              #{player.jersey_no}
            </span>
          ) : null}
        </div>
        {player.role ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{player.role}</p>
        ) : player.user?.email ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{player.user.email}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-1">
          {player.isVerified ? <StatusTag tone="success">Verified</StatusTag> : null}
          {player.isEmailVerified && !player.isVerified ? (
            <StatusTag tone="success">Email verified</StatusTag>
          ) : null}
          {player.isPaymentVerified ? (
            <StatusTag tone="success">Payment done</StatusTag>
          ) : (
            <StatusTag tone="warning">Payment pending</StatusTag>
          )}
          {player.paymentStatus &&
          !player.isPaymentVerified &&
          player.paymentStatus !== 'unverified' ? (
            <StatusTag tone="neutral">{player.paymentStatus}</StatusTag>
          ) : null}
          {!player.is_active ? <StatusTag tone="danger">Inactive</StatusTag> : null}
        </div>
      </div>
    </Link>
  );
}

function StatusTag({
  children,
  tone,
}: {
  children: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'bg-amber-50 text-amber-800',
        tone === 'danger' && 'bg-red-50 text-red-700',
        tone === 'neutral' && 'bg-slate-100 text-slate-700'
      )}
    >
      {children}
    </span>
  );
}
