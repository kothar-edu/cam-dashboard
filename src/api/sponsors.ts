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
  image?: File | null;
};

export async function getSponsor(id: string): Promise<Sponsor> {
  const { data } = await apiClient.get<Sponsor>(`/game/sponsor/${id}/`);
  return data;
}

function appendSponsorFields(form: FormData, payload: SponsorPayload) {
  form.append('name', payload.name);
  if (payload.supported_url) form.append('supported_url', payload.supported_url);
  if (payload.extra_info) form.append('extra_info', payload.extra_info);
  if (payload.sponsor_type) form.append('sponsor_type', payload.sponsor_type);
  if (payload.image) form.append('image', payload.image);
}

export async function createSponsor(payload: SponsorPayload): Promise<Sponsor> {
  if (payload.image) {
    const form = new FormData();
    appendSponsorFields(form, payload);
    const { data } = await apiClient.post<Sponsor>('/game/sponsor/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.post<Sponsor>('/game/sponsor/', {
    name: payload.name,
    supported_url: payload.supported_url ?? null,
    extra_info: payload.extra_info ?? null,
    sponsor_type: payload.sponsor_type,
  });
  return data;
}

export async function updateSponsor(id: string, payload: SponsorPayload): Promise<Sponsor> {
  if (payload.image) {
    const form = new FormData();
    appendSponsorFields(form, payload);
    const { data } = await apiClient.patch<Sponsor>(`/game/sponsor/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.patch<Sponsor>(`/game/sponsor/${id}/`, {
    name: payload.name,
    supported_url: payload.supported_url ?? null,
    extra_info: payload.extra_info ?? null,
    sponsor_type: payload.sponsor_type,
  });
  return data;
}

export async function deleteSponsor(id: string): Promise<void> {
  await apiClient.delete(`/game/sponsor/${id}/`);
}
