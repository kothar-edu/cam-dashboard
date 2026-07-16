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

export async function getTeam(id: string): Promise<Team> {
  const { data } = await apiClient.get<Team>(`/game/teams/${id}/`);
  return data;
}

export type CreateTeamPayload = {
  name: string;
  code: string;
  logo?: string | null;
};

export type UpdateTeamPayload = {
  name?: string;
  code?: string;
  logo?: string | null;
};

export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  const { data } = await apiClient.post<Team>('/game/teams/', payload);
  return data;
}

export async function updateTeam(id: string, payload: UpdateTeamPayload): Promise<Team> {
  const { data } = await apiClient.patch<Team>(`/game/teams/${id}/`, payload);
  return data;
}
