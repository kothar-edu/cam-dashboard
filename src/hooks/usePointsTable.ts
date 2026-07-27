import { useQuery } from '@tanstack/react-query';
import { fetchPointsTable, fetchTournamentPlayerStats } from '@/api/points';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function usePointsTable(tournamentId: string | null) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['points-table', activeTenantId, tournamentId],
    queryFn: () => fetchPointsTable(tournamentId!),
    enabled: !!activeTenantId && !!tournamentId,
  });
}

export function useTournamentPlayerStats(
  tournamentId: string | null,
  params?: ListParams & { ordering?: string }
) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['tournament-player-stats', activeTenantId, tournamentId, params],
    queryFn: () => fetchTournamentPlayerStats(tournamentId!, params),
    enabled: !!activeTenantId && !!tournamentId,
  });
}
