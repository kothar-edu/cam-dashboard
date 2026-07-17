import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSponsor,
  deleteSponsor,
  getSponsor,
  listSponsors,
  updateSponsor,
  type SponsorPayload,
} from '@/api/sponsors';
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

export function useSponsor(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['sponsor', activeTenantId, id],
    queryFn: () => getSponsor(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreateSponsor() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: SponsorPayload) => createSponsor(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sponsors', activeTenantId] }),
  });
}

export function useUpdateSponsor() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SponsorPayload }) =>
      updateSponsor(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['sponsors', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['sponsor', activeTenantId, variables.id] });
    },
  });
}

export function useDeleteSponsor() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (id: string) => deleteSponsor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sponsors', activeTenantId] }),
  });
}
