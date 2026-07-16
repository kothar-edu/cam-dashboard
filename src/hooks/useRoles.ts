import { useQuery } from '@tanstack/react-query';
import { listRoles } from '@/api/roles';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
    staleTime: 60 * 60 * 1000,
  });
}
