import { useQuery } from '@tanstack/react-query';
import { fetchPointsTable } from '@/api/points';
import { useTenant } from '@/contexts/TenantContext';

export function usePointsTable(tournamentId: string | null) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['points-table', activeTenantId, tournamentId],
    queryFn: () => fetchPointsTable(tournamentId!),
    enabled: !!activeTenantId && !!tournamentId,
  });
}
