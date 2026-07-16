import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';
import type { Fixture } from './fixtures';

export async function listScorecards(params?: ListParams): Promise<Paginated<Fixture>> {
  const response = await apiClient.get<Paginated<Fixture>>('/game/match/', {
    params: { status: 'Ended', ...params },
  });
  return parsePaginated(response.data);
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
