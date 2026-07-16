import { useQuery } from '@tanstack/react-query';
import { listScorecards } from '@/api/scorecards';
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
