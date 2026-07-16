import { apiClient } from './client';
import type { Team } from './teams';

export type PointsTableRow = {
  id: string;
  team: Team;
  group: string | null;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  abandoned: number;
  tied: number;
  points: number;
  nrr: number;
};

export async function fetchPointsTable(tournamentId: string): Promise<PointsTableRow[]> {
  const response = await apiClient.get<PointsTableRow[]>(
    `/game/tournament/${tournamentId}/points-table/`
  );
  return response.data;
}
