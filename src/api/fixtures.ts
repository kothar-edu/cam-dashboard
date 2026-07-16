import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';
import type { Tournament } from './tournaments';

export type FixtureOpponent = {
  id: string;
  team_name: string;
};

export type Fixture = {
  id: string;
  opponent_a: FixtureOpponent;
  opponent_b: FixtureOpponent;
  tournament: Tournament | null;
  status: string;
  time: string;
  ground: string | null;
  round: string | null;
};

export async function listFixtures(params?: ListParams): Promise<Paginated<Fixture>> {
  const response = await apiClient.get<Paginated<Fixture>>('/game/match/', { params });
  return parsePaginated(response.data);
}
