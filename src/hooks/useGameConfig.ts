import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGameConfig, updateGameConfig, type GameConfigUpdate } from '@/api/gameConfig';
import { useTenant } from '@/contexts/TenantContext';

export function useGameConfig() {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['gameConfig', activeTenantId],
    queryFn: getGameConfig,
    enabled: !!activeTenantId,
  });
}

export function useUpdateGameConfig() {
  const queryClient = useQueryClient();
  const { activeTenantId } = useTenant();

  return useMutation({
    mutationFn: (data: GameConfigUpdate) => updateGameConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameConfig', activeTenantId] });
    },
  });
}
