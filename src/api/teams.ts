import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type TeamMaintainer = {
  id: string;
  email: string;
  full_name: string;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  total_players: number;
  is_active: boolean;
  maintainer?: TeamMaintainer | null;
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
  logo?: File | null;
};

export type UpdateTeamPayload = {
  name?: string;
  code?: string;
  logo?: File | null;
  is_active?: boolean;
  maintainer?: string | null;
};

function appendTeamFields(form: FormData, payload: CreateTeamPayload | UpdateTeamPayload) {
  if ('name' in payload && payload.name != null) form.append('name', payload.name);
  if ('code' in payload && payload.code != null) form.append('code', payload.code);
  if (payload.logo) form.append('logo', payload.logo);
  if ('maintainer' in payload && payload.maintainer !== undefined) {
    form.append('maintainer', payload.maintainer ?? '');
  }
}

export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  if (payload.logo) {
    const form = new FormData();
    appendTeamFields(form, payload);
    const { data } = await apiClient.post<Team>('/game/teams/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.post<Team>('/game/teams/', { name: payload.name, code: payload.code });
  return data;
}

export async function updateTeam(id: string, payload: UpdateTeamPayload): Promise<Team> {
  if (payload.logo) {
    const form = new FormData();
    appendTeamFields(form, payload);
    const { data } = await apiClient.patch<Team>(`/game/teams/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.patch<Team>(`/game/teams/${id}/`, payload);
  return data;
}

export async function setTeamActive(id: string, isActive: boolean): Promise<Team> {
  const { data } = await apiClient.patch<Team>(`/game/teams/${id}/`, { is_active: isActive });
  return data;
}
