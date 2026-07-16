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

export type PlayerDetail = Player & {
  dob: string | null;
  role: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  matches_played: number;
  runs_scored: number;
  wickets_taken: number;
  sixes: number;
  fours: number;
};

export type CreatePlayerPayload = {
  user: string;
  current_team: string;
  dob?: string;
  role?: string;
  batting_style?: string;
  bowling_style?: string;
  jersey_no?: number;
};

export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;

export async function getPlayer(id: string): Promise<PlayerDetail> {
  const { data } = await apiClient.get<PlayerDetail>(`/game/player/${id}/`);
  return data;
}

export async function createPlayer(payload: CreatePlayerPayload): Promise<PlayerDetail> {
  const { data } = await apiClient.post<PlayerDetail>('/game/player/', payload);
  return data;
}

export async function updatePlayer(id: string, payload: UpdatePlayerPayload): Promise<PlayerDetail> {
  const { data } = await apiClient.patch<PlayerDetail>(`/game/player/${id}/`, payload);
  return data;
}
