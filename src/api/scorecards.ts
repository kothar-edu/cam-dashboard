import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';
import type { Fixture } from './fixtures';

export async function listScorecards(params?: ListParams): Promise<Paginated<Fixture>> {
  const response = await apiClient.get<Paginated<Fixture>>('/game/match/', {
    params: { status: 'Ended', ...params },
  });
  return parsePaginated(response.data);
}
