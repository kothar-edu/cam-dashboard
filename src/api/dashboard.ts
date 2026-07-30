import { apiClient } from './client';

type Paginated<T> = { count: number; results: T[] };

export type DashboardStats = {
  teamCount: number;
  playerCount: number;
  tournamentCount: number;
  /** Live + Upcoming matches (from /game/match/upcoming/'s real count, not a capped list length). */
  liveAndUpcomingCount: number;
};

function getCount<T>(data: Paginated<T> | T[]): number {
  if (Array.isArray(data)) {
    return data.length;
  }
  return data.count ?? data.results?.length ?? 0;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [teams, players, tournaments, upcoming] = await Promise.all([
    apiClient.get<Paginated<unknown>>('/game/teams/'),
    apiClient.get<Paginated<unknown>>('/game/player/', { params: { limit: 1 } }),
    apiClient.get<Paginated<unknown>>('/game/tournament/'),
    apiClient.get<Paginated<unknown>>('/game/match/upcoming/', { params: { limit: 1 } }),
  ]);

  return {
    teamCount: getCount(teams.data),
    playerCount: getCount(players.data),
    tournamentCount: getCount(tournaments.data),
    liveAndUpcomingCount: getCount(upcoming.data),
  };
}
