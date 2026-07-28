import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';
import type { Fixture, FixtureDetail } from './fixtures';

export async function listScorecards(params?: ListParams): Promise<Paginated<Fixture>> {
  const response = await apiClient.get<Paginated<Fixture>>('/game/match/', {
    params: { status: 'Ended', ...params },
  });
  return parsePaginated(response.data);
}

export type ScorecardBallPatch = {
  innings_index: number;
  over_index: number;
  ball_index: number;
  value?: string | number;
  runs?: number;
  extras?: number;
  striker?: string | null;
  non_striker?: string | null;
  bowler?: string | null;
  wicket_keeper?: string | null;
  dismissed?: string | null;
  fielder?: string | null;
  commentary?: string | null;
  is_bat_involved?: boolean;
  bye_type?: 'BYE' | 'LEG_BYE' | null;
};

export type ScorecardLineupPatch = {
  id: number;
  runs_scored?: number;
  balls_faced?: number;
  fours?: number;
  sixes?: number;
  dismissed?: boolean;
  balls_thrown?: number;
  runs_conceded?: number;
  wickets_taken?: number;
  maidens?: number;
  hattricks?: number;
  catches?: number;
  run_outs?: number;
  direct_hits?: number;
  run_out_supports?: number;
  stumps?: number;
};

export type ScorecardMatchPatch = {
  man_of_the_match?: string | null;
  abandoned?: boolean;
  dls?: boolean;
  tied?: boolean;
};

export type ScorecardEditPatch = {
  lineups?: ScorecardLineupPatch[];
  balls?: ScorecardBallPatch[];
  match?: ScorecardMatchPatch;
};

export type ScorecardChangeItem = {
  entity: string;
  entity_id: string;
  field: string;
  before: unknown;
  after: unknown;
  label: string;
};

export type ScorecardEditOutcome = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  changes: ScorecardChangeItem[];
  preview: {
    winner?: string | null;
    tied?: boolean;
    abandoned?: boolean;
    dls?: boolean;
    man_of_the_match?: string | null;
    has_ball_history?: boolean;
  };
  fixture?: FixtureDetail;
};

export type ScoreBall = {
  striker?: string | null;
  non_striker?: string | null;
  bowler?: string | null;
  wicket_keeper?: string | null;
  value?: string | number;
  runs?: number;
  extras?: number;
  total_runs?: number;
  dismissed?: string | null;
  fielder?: string | null;
  commentary?: string | null;
  is_bat_involved?: boolean;
  bye_type?: string | null;
};

export type ScoreOver = {
  bowler?: string | null;
  wicket_keeper?: string | null;
  runs?: number;
  extras?: number;
  wickets?: number;
  total_runs?: number;
  scores?: ScoreBall[];
};

export type ScoreInning = {
  batting?: string;
  bowling?: string;
  runs?: number;
  wickets?: number;
  overs?: ScoreOver[];
};

export type ScorecardResultDump = {
  innings?: ScoreInning[];
  opponents?: Array<{
    id: string;
    name?: string;
    code?: string;
    players?: Array<{ id: string; full_name?: string }>;
  }>;
};

export async function validateScorecard(
  matchId: string,
  patch: ScorecardEditPatch
): Promise<ScorecardEditOutcome> {
  const { data } = await apiClient.post<ScorecardEditOutcome>(
    `/game/match/${matchId}/scorecard/validate/`,
    patch,
    { validateStatus: (status) => status < 500 }
  );
  return data;
}

export async function applyScorecard(
  matchId: string,
  patch: ScorecardEditPatch
): Promise<ScorecardEditOutcome> {
  const { data } = await apiClient.post<ScorecardEditOutcome>(
    `/game/match/${matchId}/scorecard/apply/`,
    patch,
    { validateStatus: (status) => status < 500 }
  );
  return data;
}

export function parseScorecardResult(result: unknown): ScorecardResultDump | null {
  if (!result || typeof result !== 'object') return null;
  const dump = result as ScorecardResultDump;
  if (!Array.isArray(dump.innings)) return null;
  return dump;
}

export function hasBallHistory(result: unknown): boolean {
  const dump = parseScorecardResult(result);
  if (!dump?.innings) return false;
  return dump.innings.some((inn) =>
    (inn.overs || []).some((over) => (over.scores || []).length > 0)
  );
}

export { getFixture } from './fixtures';
export {
  updateLineupBatting,
  updateLineupBowling,
  updateLineupFielding,
  type FixtureDetail,
  type LineupEntry,
  type LineupBattingUpdatePayload,
  type LineupBowlingUpdatePayload,
  type LineupFieldingUpdatePayload,
} from './fixtures';
