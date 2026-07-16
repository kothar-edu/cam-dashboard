import { useQuery } from '@tanstack/react-query';
import { listFixtures } from '@/api/fixtures';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useFixtures(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['fixtures', activeTenantId, params],
    queryFn: () => listFixtures(params),
    enabled: !!activeTenantId,
  });
}
