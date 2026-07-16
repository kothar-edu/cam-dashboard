import { useQuery } from '@tanstack/react-query';
import { listPlayers } from '@/api/players';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function usePlayers(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['players', activeTenantId, params],
    queryFn: () => listPlayers(params),
    enabled: !!activeTenantId,
  });
}
