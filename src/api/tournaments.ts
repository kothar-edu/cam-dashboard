import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Tournament = {
  id: string;
  name: string;
  logo: string | null;
  start: string;
  end?: string;
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
  livestream_sponsor_text?: string;
  livestream_top_left_image?: string | null;
  livestream_top_right_image?: string | null;
};

export type CreateTournamentPayload = {
  name: string;
  start: string;
  end: string;
  team_size: number;
  teams: string[];
  is_active?: boolean;
  is_public?: boolean;
  livestream_sponsor_text?: string;
};

export async function getTournament(id: string): Promise<TournamentDetail> {
  const { data } = await apiClient.get<TournamentDetail>(`/game/tournament/${id}/`);
  return data;
}

export async function createTournament(
  payload: CreateTournamentPayload
): Promise<TournamentDetail> {
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
  is_public?: boolean;
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

export type LivestreamOverlayPayload = {
  sponsorText?: string;
  topLeftFile?: File | null;
  topRightFile?: File | null;
  clearTopLeft?: boolean;
  clearTopRight?: boolean;
  overlayCustom?: boolean;
};

export async function updateTournamentLivestreamOverlay(
  tournamentId: string,
  payload: LivestreamOverlayPayload
): Promise<TournamentDetail> {
  const form = new FormData();
  if (payload.sponsorText !== undefined) {
    form.append('livestream_sponsor_text', payload.sponsorText.trim());
  }
  if (payload.topLeftFile) {
    form.append('livestream_top_left_image', payload.topLeftFile);
  }
  if (payload.topRightFile) {
    form.append('livestream_top_right_image', payload.topRightFile);
  }
  if (payload.clearTopLeft) {
    form.append('clear_top_left', 'true');
  }
  if (payload.clearTopRight) {
    form.append('clear_top_right', 'true');
  }
  const { data } = await apiClient.patch<TournamentDetail>(
    `/game/tournament/${tournamentId}/livestream-overlay/`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function updateMatchLivestreamOverlay(
  matchId: string,
  payload: LivestreamOverlayPayload
) {
  const form = new FormData();
  if (payload.overlayCustom !== undefined) {
    form.append('livestream_overlay_custom', String(payload.overlayCustom));
  }
  if (payload.sponsorText !== undefined) {
    form.append('livestream_sponsor_text', payload.sponsorText.trim());
  }
  if (payload.topLeftFile) {
    form.append('livestream_top_left_image', payload.topLeftFile);
  }
  if (payload.topRightFile) {
    form.append('livestream_top_right_image', payload.topRightFile);
  }
  if (payload.clearTopLeft) {
    form.append('clear_top_left', 'true');
  }
  if (payload.clearTopRight) {
    form.append('clear_top_right', 'true');
  }
  const { data } = await apiClient.patch(`/game/match/${matchId}/livestream-overlay/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
