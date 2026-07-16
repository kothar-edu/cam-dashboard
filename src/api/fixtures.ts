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

export type CreateFixturePayload = {
  name: string;
  team_a: string;
  team_b: string;
  time: string;
  ground: string;
  logo?: string;
};

export type FixtureDetail = Fixture & {
  round: string | null;
  result: string | null;
  lineups_a?: LineupEntry[];
  lineups_b?: LineupEntry[];
};

export type LineupEntry = {
  id: string;
  player: { id: string; full_name: string };
  runs_scored: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  dismissed: boolean;
  wickets_taken: number;
  balls_thrown: number;
  runs_conceded: number;
  maidens: number;
  hattricks: number;
};

export type LineupBattingUpdatePayload = {
  id: string;
  runs_scored: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  dismissed: boolean;
};

export type LineupBowlingUpdatePayload = {
  id: string;
  balls_thrown: number;
  runs_conceded: number;
  wickets_taken: number;
  maidens: number;
  hattricks: number;
};

export async function updateLineupBatting(payload: LineupBattingUpdatePayload[]): Promise<void> {
  await apiClient.put('/game/lineup/batting-update/', payload);
}

export async function updateLineupBowling(payload: LineupBowlingUpdatePayload[]): Promise<void> {
  await apiClient.put('/game/lineup/bowling-update/', payload);
}

export type UpdateFixturePayload = {
  time?: string;
  round?: string;
  ground?: string;
  over_limit?: number;
  bowling_limit?: number;
};

export async function getFixture(id: string): Promise<FixtureDetail> {
  const { data } = await apiClient.get<FixtureDetail>(`/game/match/${id}/`);
  return data;
}

export async function createFixture(payload: CreateFixturePayload): Promise<Fixture> {
  const { data } = await apiClient.post<Fixture>('/game/match/', payload);
  return data;
}

export async function createFixturesBulk(payload: CreateFixturePayload[]): Promise<unknown> {
  const { data } = await apiClient.post('/game/match/create-multiple-match/', payload);
  return data;
}

export async function updateFixture(id: string, payload: UpdateFixturePayload): Promise<FixtureDetail> {
  const { data } = await apiClient.patch<FixtureDetail>(`/game/match/${id}/`, payload);
  return data;
}
