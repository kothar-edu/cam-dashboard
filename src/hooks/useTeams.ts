import { useQuery } from '@tanstack/react-query';
import { listTeams } from '@/api/teams';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useTeams(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['teams', activeTenantId, params],
    queryFn: () => listTeams(params),
    enabled: !!activeTenantId,
  });
}
