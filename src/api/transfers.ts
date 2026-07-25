import { apiClient } from './client';
import type { Player } from './players';

export type TransferPlayerPayload = {
  team: string;
};

export async function transferPlayer(
  playerId: string,
  payload: TransferPlayerPayload
): Promise<Player> {
  const { data } = await apiClient.post<Player>(`/game/player/${playerId}/transfer/`, payload);
  return data;
}
