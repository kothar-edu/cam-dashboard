import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';
import type { Tournament } from './tournaments';
import type { Player } from './players';

export type VotingPoll = {
  tournament: Tournament;
  player: VotingPlayerResult[];
};

export type VotingPlayerResult = Player & {
  total_votes?: number;
  team_name?: string | null;
};

export type NomineeVotingPlayer = {
  id: number;
  tournament: Tournament;
  player: Player[];
};

export type NomineeVotingPlayerPayload = {
  tournament: string;
  player: string[];
};

export async function listVotingPolls(params?: ListParams): Promise<Paginated<VotingPoll>> {
  const response = await apiClient.get<Paginated<VotingPoll> | VotingPoll[]>('/game/voting/', {
    params,
  });
  return parsePaginated(response.data);
}

export async function getNomineeVotingPlayer(id: number): Promise<NomineeVotingPlayer> {
  const { data } = await apiClient.get<NomineeVotingPlayer>(`/game/nominee-voting-player/${id}/`);
  return data;
}

export async function listNomineeVotingPlayers(
  params?: ListParams & { tournament?: string }
): Promise<Paginated<NomineeVotingPlayer>> {
  const response = await apiClient.get<Paginated<NomineeVotingPlayer> | NomineeVotingPlayer[]>(
    '/game/nominee-voting-player/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function createNomineeVotingPlayer(
  payload: NomineeVotingPlayerPayload
): Promise<NomineeVotingPlayer> {
  const { data } = await apiClient.post<NomineeVotingPlayer>('/game/nominee-voting-player/', payload);
  return data;
}

export async function updateNomineeVotingPlayer(
  id: number,
  payload: NomineeVotingPlayerPayload
): Promise<NomineeVotingPlayer> {
  const { data } = await apiClient.patch<NomineeVotingPlayer>(
    `/game/nominee-voting-player/${id}/`,
    payload
  );
  return data;
}

export async function deleteNomineeVotingPlayer(id: number): Promise<void> {
  await apiClient.delete(`/game/nominee-voting-player/${id}/`);
}
