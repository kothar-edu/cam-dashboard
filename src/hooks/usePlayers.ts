import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPlayer,
  getPlayer,
  listPlayers,
  updatePlayer,
  type CreatePlayerPayload,
  type UpdatePlayerPayload,
} from '@/api/players';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function usePlayers(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['players', activeTenantId, params],
    queryFn: () => listPlayers(params),
    enabled: !!activeTenantId,
    placeholderData: keepPreviousData,
  });
}

export function usePlayer(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['player', activeTenantId, id],
    queryFn: () => getPlayer(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: CreatePlayerPayload) => createPlayer(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players', activeTenantId] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePlayerPayload }) =>
      updatePlayer(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['players', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['player', activeTenantId, variables.id] });
    },
  });
}
