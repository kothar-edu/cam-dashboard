import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type PlayerUser = {
  id: string;
  full_name: string;
  email?: string;
  picture?: string | null;
  is_verified?: boolean;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  is_payment_verified?: boolean;
  payment_status?: string;
};

export type PlayerTeamRef = {
  id: string;
  name: string;
  code?: string;
  logo?: string | null;
};

export type PlayerTeamHistory = {
  id: string | number;
  team: PlayerTeamRef | null;
  joined_at: string | null;
  left_at: string | null;
  matches_played?: number;
};

export type Player = {
  id: string;
  full_name: string;
  jersey_no: number | null;
  current_team: string | null;
  is_active: boolean;
  team_name: string | null;
  user: PlayerUser | null;
  picture?: string | null;
  role?: string | null;
};

export async function listPlayers(params?: ListParams): Promise<Paginated<Player>> {
  const response = await apiClient.get<Paginated<Player>>('/game/player/', { params });
  return parsePaginated(response.data);
}

export type PlayerDetail = {
  id: string;
  full_name?: string;
  jersey_no: number | null;
  is_active: boolean;
  dob: string | null;
  role: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  matches_played: number;
  runs_scored: number;
  wickets_taken: number;
  sixes: number;
  fours: number;
  maidens: number;
  hattricks: number;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  current_team: PlayerTeamRef | string | null;
  current_team_joined_at?: string | null;
  user: PlayerUser | null;
  playerteamhistory_set?: PlayerTeamHistory[];
  team_name?: string | null;
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

export type UpdatePlayerPayload = Partial<CreatePlayerPayload> & {
  is_active?: boolean;
};

export async function getPlayer(id: string): Promise<PlayerDetail> {
  const { data } = await apiClient.get<PlayerDetail>(`/game/player/${id}/`);
  return data;
}

export async function createPlayer(payload: CreatePlayerPayload): Promise<PlayerDetail> {
  const { data } = await apiClient.post<PlayerDetail>('/game/player/', payload);
  return data;
}

export async function updatePlayer(
  id: string,
  payload: UpdatePlayerPayload
): Promise<PlayerDetail> {
  const { data } = await apiClient.patch<PlayerDetail>(`/game/player/${id}/`, payload);
  return data;
}

export function playerDisplayName(player: PlayerDetail): string {
  return player.full_name || player.user?.full_name || 'Unknown player';
}

export function playerTeamName(player: PlayerDetail): string | null {
  if (player.team_name) return player.team_name;
  if (player.current_team && typeof player.current_team === 'object') {
    return player.current_team.name;
  }
  return null;
}
