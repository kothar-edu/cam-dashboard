import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTournament,
  getTournament,
  listTournaments,
  updateTournament,
  type CreateTournamentPayload,
} from '@/api/tournaments';
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

export function useTournament(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['tournament', activeTenantId, id],
    queryFn: () => getTournament(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreateTournament() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: CreateTournamentPayload) => createTournament(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments', activeTenantId] }),
  });
}

export function useUpdateTournament() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTournamentPayload> }) =>
      updateTournament(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tournaments', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['tournament', activeTenantId, variables.id] });
    },
  });
}
