import { useMutation, useQuery } from '@tanstack/react-query';
import { lookupUserByEmail } from '@/api/users';

export function useLookupUserByEmail(email: string, enabled = true) {
  const trimmed = email.trim();
  return useQuery({
    queryKey: ['user-lookup', trimmed],
    queryFn: () => lookupUserByEmail(trimmed),
    enabled: enabled && trimmed.length >= 3,
    retry: false,
  });
}

export function useLookupUserByEmailMutation() {
  return useMutation({
    mutationFn: (email: string) => lookupUserByEmail(email.trim()),
  });
}
