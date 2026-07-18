import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/api/users';

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId as string),
    enabled: Boolean(userId),
  });
}
