import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { usePlayer } from '@/hooks/usePlayers';

export default function PlayerStatsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePlayer(id);

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title="Player statistics"
          backTo={`/dashboard/players/${id}`}
          backLabel="Back to player"
        />
        {isLoading && !data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError || !data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load player stats.
          </div>
        ) : (
          <div className="grid max-w-2xl gap-4 rounded-lg border bg-white p-6 sm:grid-cols-2">
            <Stat label="Matches" value={data.matches_played} />
            <Stat label="Runs" value={data.runs_scored} />
            <Stat label="Wickets" value={data.wickets_taken} />
            <Stat label="Sixes" value={data.sixes} />
            <Stat label="Fours" value={data.fours} />
            <Stat label="Team" value={data.team_name ?? '—'} />
            <Link
              to={`/dashboard/players/${id}`}
              className="text-sm font-medium text-[#12233D] underline sm:col-span-2"
            >
              Edit player profile
            </Link>
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-[#12233D]">{value}</p>
    </div>
  );
}
