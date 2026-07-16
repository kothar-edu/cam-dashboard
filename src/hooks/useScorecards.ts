import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getFixture,
  listScorecards,
  updateLineupBatting,
  updateLineupBowling,
  type LineupBattingUpdatePayload,
  type LineupBowlingUpdatePayload,
} from '@/api/scorecards';
import type { ListParams } from '@/api/pagination';
import { useTenant } from '@/contexts/TenantContext';

export function useScorecards(params?: ListParams) {
  const { activeTenantId } = useTenant();

  return useQuery({
    queryKey: ['scorecards', activeTenantId, params],
    queryFn: () => listScorecards(params),
    enabled: !!activeTenantId,
  });
}

export function useScorecard(id?: string) {
  const { activeTenantId } = useTenant();
  return useQuery({
    queryKey: ['scorecard', activeTenantId, id],
    queryFn: () => getFixture(id!),
    enabled: !!activeTenantId && !!id,
  });
}

export function useUpdateLineupBatting(scorecardId?: string) {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: LineupBattingUpdatePayload[]) => updateLineupBatting(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecard', activeTenantId, scorecardId] });
    },
  });
}

export function useUpdateLineupBowling(scorecardId?: string) {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (payload: LineupBowlingUpdatePayload[]) => updateLineupBowling(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecard', activeTenantId, scorecardId] });
    },
  });
}
