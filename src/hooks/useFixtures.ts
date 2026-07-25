import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFixture,
  createFixturesBulk,
  getFixture,
  listFixtures,
  updateFixture,
  forfeitFixture,
  abandonFixture,
  startMatch,
  type BulkFixtureRowPayload,
  type CreateFixturePayload,
  type UpdateFixturePayload,
  type ForfeitFixturePayload,
  type StartMatchPayload,
} from '@/api/fixtures';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useFixtures(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['fixtures', activeTenantId, params],
    queryFn: () => listFixtures(params),
    enabled: !!activeTenantId,
  });
}

export function useFixture(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['fixture', activeTenantId, id],
    queryFn: () => getFixture(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useCreateFixture() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: CreateFixturePayload) => createFixture(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] }),
  });
}

export function useCreateFixturesBulk() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: BulkFixtureRowPayload[]) => createFixturesBulk(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] }),
  });
}

export function useUpdateFixture() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFixturePayload }) =>
      updateFixture(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] });
      qc.invalidateQueries({
        queryKey: ['fixture', activeTenantId, variables.id],
      });
    },
  });
}

export function useForfeitFixture() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ForfeitFixturePayload }) =>
      forfeitFixture(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] });
      qc.invalidateQueries({
        queryKey: ['fixture', activeTenantId, variables.id],
      });
    },
  });
}

export function useAbandonFixture() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (id: string) => abandonFixture(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['fixture', activeTenantId, id] });
    },
  });
}

export function useStartMatch() {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StartMatchPayload }) =>
      startMatch(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['fixtures', activeTenantId] });
      qc.invalidateQueries({ queryKey: ['fixture', activeTenantId, variables.id] });
    },
  });
}
