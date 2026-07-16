import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/api/dashboard';
import { useTenant } from '@/contexts/TenantContext';

export function useDashboardStats() {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['dashboard-stats', activeTenantId],
    queryFn: fetchDashboardStats,
    enabled: !!activeTenantId,
  });
}
