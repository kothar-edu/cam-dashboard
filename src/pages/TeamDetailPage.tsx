import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useTeams } from '@/hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTeams();
  const team = useMemo(() => data?.results.find((row) => row.id === id), [data, id]);

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Team details" backTo="/dashboard/teams" />
        {isLoading && !data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : isError || !team ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Team not found. The teams API does not expose per-id retrieve; check the list page.
          </div>
        ) : (
          <div className="max-w-xl space-y-3 rounded-lg border bg-white p-6">
            <p>
              <span className="font-medium text-[#12233D]">Name:</span> {team.name}
            </p>
            <p>
              <span className="font-medium text-[#12233D]">Code:</span> {team.code}
            </p>
            <p>
              <span className="font-medium text-[#12233D]">Players:</span> {team.total_players}
            </p>
            <ButtonLink to="/dashboard/teams">Back to teams</ButtonLink>
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function ButtonLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-[#12233D] underline">
      {children}
    </Link>
  );
}
