import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNomineeVotingPlayer,
  deleteNomineeVotingPlayer,
  getNomineeVotingPlayer,
  listNomineeVotingPlayers,
  listVotingPolls,
  updateNomineeVotingPlayer,
  type NomineeVotingPlayerPayload,
} from '@/api/voting';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useVotingPolls(params?: ListParams) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['voting-polls', activeTenantId, params],
    queryFn: () => listVotingPolls(params),
    enabled: !!activeTenantId,
  });
}

export function useNomineeVotingPlayers(params?: ListParams & { tournament?: string }) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['nominee-voting-players', activeTenantId, params],
    queryFn: () => listNomineeVotingPlayers(params),
    enabled: !!activeTenantId,
  });
}

export function useNomineeVotingPlayer(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['nominee-voting-player', activeTenantId, id],
    queryFn: () => getNomineeVotingPlayer(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreateNomineeVotingPlayer() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: NomineeVotingPlayerPayload) => createNomineeVotingPlayer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voting-polls', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['nominee-voting-players', activeTenantId] });
    },
  });
}

export function useUpdateNomineeVotingPlayer() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NomineeVotingPlayerPayload }) =>
      updateNomineeVotingPlayer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voting-polls', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['nominee-voting-players', activeTenantId] });
    },
  });
}

export function useDeleteNomineeVotingPlayer() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (id: string) => deleteNomineeVotingPlayer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voting-polls', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['nominee-voting-players', activeTenantId] });
    },
  });
}
