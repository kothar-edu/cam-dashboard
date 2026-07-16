import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Tournament = {
  id: string;
  name: string;
  logo: string | null;
  start: string;
  total_teams: number;
};

export async function listTournaments(params?: ListParams): Promise<Paginated<Tournament>> {
  const response = await apiClient.get<Paginated<Tournament> | Tournament[]>('/game/tournament/', {
    params,
  });
  return parsePaginated(response.data);
}
