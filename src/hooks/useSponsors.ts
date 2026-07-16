import { useQuery } from '@tanstack/react-query';
import { listSponsors } from '@/api/sponsors';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useSponsors(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['sponsors', activeTenantId, params],
    queryFn: () => listSponsors(params),
    enabled: !!activeTenantId,
  });
}
