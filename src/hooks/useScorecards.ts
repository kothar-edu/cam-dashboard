import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyScorecard,
  getFixture,
  listScorecards,
  validateScorecard,
  type ScorecardEditPatch,
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

export function useValidateScorecard(scorecardId?: string) {
  return useMutation({
    mutationFn: (patch: ScorecardEditPatch) => validateScorecard(scorecardId!, patch),
  });
}

export function useApplyScorecard(scorecardId?: string) {
  const qc = useQueryClient();
  const { activeTenantId } = useTenant();
  return useMutation({
    mutationFn: (patch: ScorecardEditPatch) => applyScorecard(scorecardId!, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecard', activeTenantId, scorecardId] });
      qc.invalidateQueries({ queryKey: ['scorecards', activeTenantId] });
    },
  });
}
