import { useMutation } from '@tanstack/react-query';
import { createAdminUser, type CreateAdminPayload } from '@/api/settings';

export function useCreateAdminUser() {
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdminUser(payload),
  });
}
