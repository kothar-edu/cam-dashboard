import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Tournament = {
  id: string;
  name: string;
  logo: string | null;
  start: string;
  total_teams: number;
  is_active: boolean;
  is_public?: boolean;
};

export async function listTournaments(params?: ListParams): Promise<Paginated<Tournament>> {
  const response = await apiClient.get<Paginated<Tournament> | Tournament[]>('/game/tournament/', {
    params,
  });
  return parsePaginated(response.data);
}

export type TournamentDetail = Tournament & {
  end: string;
  team_size: number;
  opponents: Array<{ id: string; team_id: string; team_name: string }>;
  is_public?: boolean;
};

export type CreateTournamentPayload = {
  name: string;
  start: string;
  end: string;
  team_size: number;
  teams: string[];
  is_active?: boolean;
  is_public?: boolean;
};

export async function getTournament(id: string): Promise<TournamentDetail> {
  const { data } = await apiClient.get<TournamentDetail>(`/game/tournament/${id}/`);
  return data;
}

export async function createTournament(payload: CreateTournamentPayload): Promise<TournamentDetail> {
  const { data } = await apiClient.post<TournamentDetail>('/game/tournament/', payload);
  return data;
}

export async function updateTournament(
  id: string,
  payload: Partial<CreateTournamentPayload>
): Promise<TournamentDetail> {
  const { data } = await apiClient.patch<TournamentDetail>(`/game/tournament/${id}/`, payload);
  return data;
}

export async function addTeamsToTournament(
  tournamentId: string,
  teamIds: string[]
): Promise<TournamentDetail> {
  const { data } = await apiClient.post<TournamentDetail>(
    `/game/tournament/${tournamentId}/add-teams/`,
    { teams: teamIds }
  );
  return data;
}

export type CreateTournamentFixturePayload = {
  opponent_a: string;
  opponent_b: string;
  round?: string;
  time: string;
  ground: string;
};

export async function createTournamentFixture(
  tournamentId: string,
  payload: CreateTournamentFixturePayload
) {
  const { data } = await apiClient.post(
    `/game/tournament/${tournamentId}/create-fixture/`,
    payload
  );
  return data;
}
