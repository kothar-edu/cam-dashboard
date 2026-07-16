import { apiClient } from './client';

export type GameConfig = {
  is_voting_open: boolean;
  is_registration_open: boolean;
  four_boundary_label: string;
  six_boundary_label: string;
};

export type BoundaryLabelsUpdate = Pick<GameConfig, 'four_boundary_label' | 'six_boundary_label'>;

export async function getGameConfig(): Promise<GameConfig> {
  const response = await apiClient.get<GameConfig>('/game/config/');
  return response.data;
}

export async function updateGameConfig(data: BoundaryLabelsUpdate): Promise<GameConfig> {
  const response = await apiClient.patch<GameConfig>('/game/config/', data);
  return response.data;
}
