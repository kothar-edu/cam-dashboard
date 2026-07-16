import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transferPlayer } from '@/api/transfers';
import { useTenant } from '@/contexts/TenantContext';

export function useTransferPlayer() {
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  return useMutation({
    mutationFn: ({ playerId, teamId }: { playerId: string; teamId: string }) =>
      transferPlayer(playerId, { team: teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', activeTenantId] });
    },
  });
}
