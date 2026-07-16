import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/api/users';
import type { ListParams } from '@/api/pagination';

export function useUsers(params?: ListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => listUsers(params),
  });
}
