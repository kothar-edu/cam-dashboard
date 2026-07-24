import { useQuery } from '@tanstack/react-query';
import { fetchLiveMatchInfo } from '@/api/livescore';

export function useLiveMatchInfo(matchId: string | undefined, tenant?: string | null) {
  return useQuery({
    queryKey: ['live-match-info', matchId, tenant],
    queryFn: () => fetchLiveMatchInfo(matchId as string, tenant),
    enabled: !!matchId,
  });
}
