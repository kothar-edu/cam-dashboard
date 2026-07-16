import { useQuery } from '@tanstack/react-query';
import { listTournaments } from '@/api/tournaments';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useTournaments(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['tournaments', activeTenantId, params],
    queryFn: () => listTournaments(params),
    enabled: !!activeTenantId,
  });
}
