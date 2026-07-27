import { apiClient } from './client';
import type { Team } from './teams';
import { ListParams, Paginated, parsePaginated } from './pagination';

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
  runs_scored?: number;
  runs_conceded?: number;
  wickets_taken?: number;
  wickets_lost?: number;
  overs_bowled?: number;
  overs_faced?: number;
};

export type TournamentPlayerStats = {
  id: string;
  user?: { id: string; email?: string; full_name?: string } | null;
  current_team?: Team | null;
  stats: {
    matches_played?: number;
    total_runs_scored?: number;
    total_fours?: number;
    total_sixes?: number;
    fifties?: number;
    hundreds?: number;
    batting_average?: number;
    best_strike_rate?: number;
    total_wickets_taken?: number;
    total_runs_conceded?: number;
    total_maidens?: number;
    total_overs_bowled?: number;
    best_bowling_economy?: number | null;
    total_catches?: number;
    total_stumps?: number;
    total_run_outs?: number;
  };
};

export async function fetchPointsTable(tournamentId: string): Promise<PointsTableRow[]> {
  const response = await apiClient.get<PointsTableRow[]>(
    `/game/tournament/${tournamentId}/points-table/`
  );
  return response.data;
}

export async function fetchTournamentPlayerStats(
  tournamentId: string,
  params?: ListParams & { ordering?: string }
): Promise<Paginated<TournamentPlayerStats>> {
  const response = await apiClient.get<Paginated<TournamentPlayerStats> | TournamentPlayerStats[]>(
    `/game/tournament/${tournamentId}/player-stats/`,
    { params }
  );
  return parsePaginated(response.data);
}
