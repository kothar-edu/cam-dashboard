import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignTenantAdmin,
  createTenant,
  listTenantMemberships,
  revokeTenantAdmin,
  type AssignTenantAdminPayload,
  type CreateTenantPayload,
} from '@/api/tenantAdmin';
import { listAccessibleTenantsPaged } from '@/api/tenants';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useTenantMemberships(tenantId?: number) {
  return useQuery({
    queryKey: ['tenantMemberships', tenantId],
    queryFn: () => listTenantMemberships(tenantId ? { tenant: tenantId } : undefined),
    enabled: tenantId !== undefined,
  });
}

export function useAccessibleTenantsPaged(params: ListParams) {
  return useQuery({
    queryKey: ['accessibleTenantsPaged', params],
    queryFn: () => listAccessibleTenantsPaged(params),
  });
}

export function useCreateTenant() {
  const { refreshTenants } = useTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => createTenant(payload),
    onSuccess: () => {
      void refreshTenants();
      queryClient.invalidateQueries({ queryKey: ['accessibleTenantsPaged'] });
    },
  });
}

export function useAssignTenantAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTenantAdminPayload) => assignTenantAdmin(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenantMemberships', variables.tenant] });
    },
  });
}

export function useRevokeTenantAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipId, tenantId }: { membershipId: number; tenantId: number }) =>
      revokeTenantAdmin(membershipId).then(() => tenantId),
    onSuccess: (tenantId) => {
      queryClient.invalidateQueries({ queryKey: ['tenantMemberships', tenantId] });
    },
  });
}
