import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useScorecard } from '@/hooks/useScorecards';
import type { LineupEntry } from '@/api/scorecards';

export default function ScorecardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useScorecard(id);

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Scorecard" backTo="/dashboard/scorecards" />
        {isLoading && !data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError || !data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Unable to load scorecard.</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-[#12233D]">
                {data.opponent_a.team_name} vs {data.opponent_b.team_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.tournament?.name ?? 'Custom match'} · {data.status} · {data.ground ?? 'Venue TBC'}
              </p>
              {data.result ? <p className="mt-2 text-sm">{data.result}</p> : null}
            </div>
            <LineupTable title={data.opponent_a.team_name} lineups={data.lineups_a ?? []} />
            <LineupTable title={data.opponent_b.team_name} lineups={data.lineups_b ?? []} />
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function LineupTable({ title, lineups }: { title: string; lineups: LineupEntry[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="border-b px-4 py-3 font-semibold text-[#12233D]">{title}</div>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2">Player</th>
            <th className="px-4 py-2">Runs</th>
            <th className="px-4 py-2">Balls</th>
            <th className="px-4 py-2">Wickets</th>
          </tr>
        </thead>
        <tbody>
          {lineups.length ? (
            lineups.map((lineup) => (
              <tr key={lineup.id} className="border-t">
                <td className="px-4 py-2">{lineup.player.full_name}</td>
                <td className="px-4 py-2">{lineup.runs_scored}</td>
                <td className="px-4 py-2">{lineup.balls_faced}</td>
                <td className="px-4 py-2">{lineup.wickets_taken}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-4 text-muted-foreground" colSpan={4}>
                No lineup data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
