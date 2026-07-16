import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type PlayerUser = {
  id: string;
  full_name: string;
  email?: string;
};

export type Player = {
  id: string;
  full_name: string;
  jersey_no: number | null;
  current_team: string | null;
  is_active: boolean;
  team_name: string | null;
  user: PlayerUser | null;
};

export async function listPlayers(params?: ListParams): Promise<Paginated<Player>> {
  const response = await apiClient.get<Paginated<Player>>('/game/player/', { params });
  return parsePaginated(response.data);
}
