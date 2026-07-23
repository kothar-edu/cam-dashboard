import { useQuery } from '@tanstack/react-query';
import { fetchLiveMatchInfo } from '@/api/livescore';

export function useLiveMatchInfo(matchId: string | undefined) {
  return useQuery({
    queryKey: ['live-match-info', matchId],
    queryFn: () => fetchLiveMatchInfo(matchId as string),
    enabled: !!matchId,
  });
}
