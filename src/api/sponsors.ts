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
