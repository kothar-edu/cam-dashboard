import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTeamPaymentSettings,
  getTenantPaymentSettings,
  updateTeamPaymentSettings,
  updateTenantPaymentSettings,
  type PaymentSettingsUpdate,
} from '@/api/paymentSettings';
import { useTenant } from '@/contexts/TenantContext';

export function useTenantPaymentSettings() {
  const { activeTenant } = useTenant();

  return useQuery({
    queryKey: ['tenantPaymentSettings', activeTenant?.id],
    queryFn: () => getTenantPaymentSettings(activeTenant!.id),
    enabled: !!activeTenant?.id,
  });
}

export function useUpdateTenantPaymentSettings() {
  const queryClient = useQueryClient();
  const { activeTenant } = useTenant();

  return useMutation({
    mutationFn: (payload: PaymentSettingsUpdate) =>
      updateTenantPaymentSettings(activeTenant!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantPaymentSettings', activeTenant?.id] });
    },
  });
}

export function useTeamPaymentSettings(teamId?: string) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['teamPaymentSettings', activeTenantId, teamId],
    queryFn: () => getTeamPaymentSettings(teamId!),
    enabled: !!activeTenantId && !!teamId,
  });
}

export function useUpdateTeamPaymentSettings(teamId: string) {
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  return useMutation({
    mutationFn: (payload: PaymentSettingsUpdate) => updateTeamPaymentSettings(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPaymentSettings', activeTenantId, teamId] });
    },
  });
}
