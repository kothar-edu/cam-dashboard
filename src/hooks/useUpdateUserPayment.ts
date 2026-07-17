import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserPayment, type UpdateUserPaymentPayload } from '@/api/users';

export function useUpdateUserPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPaymentPayload }) =>
      updateUserPayment(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
