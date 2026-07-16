import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTeam, getTeam, listTeams, updateTeam, type CreateTeamPayload, type UpdateTeamPayload } from '@/api/teams';
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

export function useTeam(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['team', activeTenantId, id],
    queryFn: () => getTeam(id!),
    enabled: !!activeTenantId && !!id,
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

export function useUpdateTeam() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeamPayload }) => updateTeam(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teams', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['team', activeTenantId, variables.id] });
    },
  });
}
