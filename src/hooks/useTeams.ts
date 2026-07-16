import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTeam, listTeams, type CreateTeamPayload } from '@/api/teams';
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

export function useCreateTeam() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => createTeam(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', activeTenantId] }),
  });
}
