import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, type UpdateUserPayload } from '@/api/users';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUser(userId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
}
