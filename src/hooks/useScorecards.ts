import { useQuery } from '@tanstack/react-query';
import { getFixture, listScorecards } from '@/api/scorecards';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useScorecards(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['scorecards', activeTenantId, params],
    queryFn: () => listScorecards(params),
    enabled: !!activeTenantId,
  });
}

export function useScorecard(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['scorecard', activeTenantId, id],
    queryFn: () => getFixture(id!),
    enabled: !!activeTenantId && !!id,
  });
}
