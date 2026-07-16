import { apiClient } from './client';

type Paginated<T> = { count: number; results: T[] };

export type FixtureSummary = {
  id: string;
  opponent_a: { team_name: string };
  opponent_b: { team_name: string };
  time: string;
};

export type DashboardStats = {
  teamCount: number;
  playerCount: number;
  tournamentCount: number;
  upcomingFixtures: FixtureSummary[];
};

function getCount<T>(data: Paginated<T> | T[]): number {
  if (Array.isArray(data)) {
    return data.length;
  }
  return data.count ?? data.results?.length ?? 0;
}

function getResults<T>(data: Paginated<T> | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data.results ?? [];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [teams, players, tournaments, fixtures] = await Promise.all([
    apiClient.get<Paginated<unknown>>('/game/teams/'),
    apiClient.get<Paginated<unknown>>('/game/player/', { params: { limit: 1 } }),
    apiClient.get<Paginated<unknown>>('/game/tournament/'),
    apiClient.get<Paginated<FixtureSummary>>('/game/match/', {
      params: { status: 'Upcoming', limit: 5, ordering: 'time' },
    }),
  ]);

  return {
    teamCount: getCount(teams.data),
    playerCount: getCount(players.data),
    tournamentCount: getCount(tournaments.data),
    upcomingFixtures: getResults(fixtures.data),
  };
}
