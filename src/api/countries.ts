import { apiClient } from './client';

export type Country = {
  id: number;
  name: string;
  code: string;
};

export async function listCountries(): Promise<Country[]> {
  const { data } = await apiClient.get<Country[] | { results: Country[] }>('/places/country/');
  return Array.isArray(data) ? data : data.results;
}
