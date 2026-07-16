import { useQuery } from '@tanstack/react-query';
import { listPosts } from '@/api/posts';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function usePosts(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['posts', activeTenantId, params],
    queryFn: () => listPosts(params),
    enabled: !!activeTenantId,
  });
}
