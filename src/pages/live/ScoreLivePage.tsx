import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFixture } from '@/hooks/useFixtures';
import { MatchSetupWizard } from '@/components/live-scorer/setup/MatchSetupWizard';
import { ScoringConsole } from './ScoringConsole';

export default function ScoreLivePage() {
  const { id } = useParams<{ id: string }>();
  const { data: fixture, isLoading } = useFixture(id);

  if (isLoading || !fixture) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  const hasLineups = Boolean(fixture.lineups_a?.length) || Boolean(fixture.lineups_b?.length);

  return (
    <TenantRequired>
      <div className="space-y-4">
        <PageHeader
          title={`${fixture.opponent_a.team.name} vs ${fixture.opponent_b.team.name}`}
          backTo="/dashboard/fixtures"
        />

        {hasLineups ? <ScoringConsole fixture={fixture} /> : <MatchSetupWizard fixture={fixture} />}
      </div>
    </TenantRequired>
  );
}
