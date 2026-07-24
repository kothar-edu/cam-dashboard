import { useQuery } from '@tanstack/react-query';
import { listPlayers } from '@/api/players';

const ROSTER_FETCH_LIMIT = 500;

export function useTeamRoster(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-roster', teamId],
    queryFn: async () => {
      const { results } = await listPlayers({ current_team: teamId as string, limit: ROSTER_FETCH_LIMIT });
      return results;
    },
    enabled: !!teamId,
  });
}
