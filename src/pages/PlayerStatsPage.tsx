import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { PlayerCareerCharts } from '@/components/charts/PlayerCareerCharts';
import {
  playerDisplayName,
  playerTeamName,
  type PlayerDetail,
} from '@/api/players';
import { usePlayer } from '@/hooks/usePlayers';

export default function PlayerStatsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePlayer(id);

  return (
    <TenantRequired>
      <div className="space-y-6">
        {isLoading && !data ? (
          <>
            <PageHeader title="Player" backTo="/dashboard/players" backLabel="Back to players" />
            <div className="flex min-h-[30vh] items-center justify-center">
              <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
            </div>
          </>
        ) : isError || !data ? (
          <>
            <PageHeader title="Player" backTo="/dashboard/players" backLabel="Back to players" />
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              Unable to load player details.
            </div>
          </>
        ) : (
          <PlayerStatsContent player={data} playerId={id!} />
        )}
      </div>
    </TenantRequired>
  );
}

function PlayerStatsContent({ player, playerId }: { player: PlayerDetail; playerId: string }) {
  const name = playerDisplayName(player);
  const teamName = playerTeamName(player);
  const picture = player.user?.picture;
  const history = player.playerteamhistory_set ?? [];

  const career = [
    { label: 'Matches', value: player.matches_played ?? 0 },
    { label: 'Runs', value: player.runs_scored ?? 0 },
    { label: 'Wickets', value: player.wickets_taken ?? 0 },
    { label: 'Sixes', value: player.sixes ?? 0 },
    { label: 'Fours', value: player.fours ?? 0 },
    { label: 'Maidens', value: player.maidens ?? 0 },
  ];

  const roles = [
    player.role,
    player.is_captain ? 'Captain' : null,
    player.is_vice_captain ? 'Vice-captain' : null,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title={name}
        description={[teamName, roles.join(' · ')].filter(Boolean).join(' · ') || 'Player profile'}
        backTo="/dashboard/players"
        backLabel="Back to players"
        action={
          <Link
            to={`/dashboard/players/${playerId}`}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#12233D] shadow-sm"
          >
            Edit profile
          </Link>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#12233D] via-[#1a3358] to-[#0d1a2e] px-6 py-8 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#E8A93B]/40 bg-white/10 text-2xl font-semibold text-[#E8A93B]">
              {picture ? (
                <img src={picture} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(name)
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold tracking-tight">{name}</h2>
                <StatusPill active={player.is_active} />
              </div>
              <p className="text-sm text-white/70">
                {[teamName ? `Team · ${teamName}` : null, player.jersey_no != null ? `#${player.jersey_no}` : null]
                  .filter(Boolean)
                  .join('  ·  ') || 'No team assigned'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {player.batting_style ? <MetaChip label={formatStyle(player.batting_style)} /> : null}
                {player.bowling_style ? <MetaChip label={formatStyle(player.bowling_style)} /> : null}
                {player.dob ? <MetaChip label={`DOB ${player.dob}`} /> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-6">
          {career.map((stat) => (
            <div key={stat.label} className="bg-white px-4 py-4 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#12233D]">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <PlayerCareerCharts
        batting={{
          runs: player.runs_scored ?? 0,
          fours: player.fours ?? 0,
          sixes: player.sixes ?? 0,
        }}
        bowling={{
          wickets: player.wickets_taken ?? 0,
          maidens: player.maidens ?? 0,
          hattricks: player.hattricks ?? 0,
        }}
      />

      {history.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#12233D]">
            Team history
          </h3>
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((entry) => (
              <li
                key={String(entry.id)}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[#12233D]">{entry.team?.name ?? 'Unknown team'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.joined_at)} – {entry.left_at ? formatDate(entry.left_at) : 'Present'}
                  </p>
                </div>
                {entry.matches_played != null ? (
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {entry.matches_played} match{entry.matches_played === 1 ? '' : 'es'}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs text-white/85">
      {label}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatStyle(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
