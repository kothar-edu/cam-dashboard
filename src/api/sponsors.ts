import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type Sponsor = {
  id: string;
  name: string;
  image: string | null;
  supported_url: string | null;
  extra_info: string | null;
  sponsor_type: string;
};

export async function listSponsors(params?: ListParams): Promise<Paginated<Sponsor>> {
  const response = await apiClient.get<Paginated<Sponsor> | Sponsor[]>('/game/sponsor/', {
    params,
  });
  return parsePaginated(response.data);
}

export type SponsorPayload = {
  name: string;
  supported_url?: string | null;
  extra_info?: string | null;
  sponsor_type?: string;
  image?: string | null;
};

export async function getSponsor(id: string): Promise<Sponsor> {
  const { data } = await apiClient.get<Sponsor>(`/game/sponsor/${id}/`);
  return data;
}

export async function createSponsor(payload: SponsorPayload): Promise<Sponsor> {
  const { data } = await apiClient.post<Sponsor>('/game/sponsor/', payload);
  return data;
}

export async function updateSponsor(id: string, payload: SponsorPayload): Promise<Sponsor> {
  const { data } = await apiClient.patch<Sponsor>(`/game/sponsor/${id}/`, payload);
  return data;
}

export async function deleteSponsor(id: string): Promise<void> {
  await apiClient.delete(`/game/sponsor/${id}/`);
}
