import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveTeamJoinApplication,
  approveTenantRegistration,
  listTeamJoinApplications,
  listTenantRegistrations,
  rejectTeamJoinApplication,
  rejectTenantRegistration,
} from '@/api/verification';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useTenantRegistrations(params?: ListParams) {
  return useQuery({
    queryKey: ['tenantRegistrations', params],
    queryFn: () => listTenantRegistrations(params),
  });
}

export function useTeamJoinApplications(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['teamJoinApplications', activeTenantId, params],
    queryFn: () => listTeamJoinApplications(params),
    enabled: !!activeTenantId,
  });
}

export function useReviewTenantRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
    }: {
      id: number;
      action: 'approve' | 'reject';
      reason?: string;
    }) => {
      if (action === 'approve') {
        return approveTenantRegistration(id);
      }
      return rejectTenantRegistration(id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantRegistrations'] });
    },
  });
}

export function useReviewTeamJoinApplication() {
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'approve' | 'reject' }) => {
      if (action === 'approve') {
        return approveTeamJoinApplication(id);
      }
      return rejectTeamJoinApplication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamJoinApplications', activeTenantId] });
    },
  });
}
