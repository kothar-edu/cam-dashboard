import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Team = {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  total_players: number;
};

export async function listTeams(params?: ListParams): Promise<Paginated<Team>> {
  const response = await apiClient.get<Paginated<Team> | Team[]>('/game/teams/', { params });
  return parsePaginated(response.data);
}
