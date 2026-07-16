import { newsfeedClient } from './client';
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
  const response = await newsfeedClient.get<Paginated<VotingPoll> | VotingPoll[]>('/voting/', {
    params,
  });
  return parsePaginated(response.data);
}

export async function getNomineeVotingPlayer(id: number): Promise<NomineeVotingPlayer> {
  const { data } = await newsfeedClient.get<NomineeVotingPlayer>(`/nominee-voting-player/${id}/`);
  return data;
}

export async function listNomineeVotingPlayers(
  params?: ListParams & { tournament?: string }
): Promise<Paginated<NomineeVotingPlayer>> {
  const response = await newsfeedClient.get<Paginated<NomineeVotingPlayer> | NomineeVotingPlayer[]>(
    '/nominee-voting-player/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function createNomineeVotingPlayer(
  payload: NomineeVotingPlayerPayload
): Promise<NomineeVotingPlayer> {
  const { data } = await newsfeedClient.post<NomineeVotingPlayer>('/nominee-voting-player/', payload);
  return data;
}

export async function updateNomineeVotingPlayer(
  id: number,
  payload: NomineeVotingPlayerPayload
): Promise<NomineeVotingPlayer> {
  const { data } = await newsfeedClient.patch<NomineeVotingPlayer>(
    `/nominee-voting-player/${id}/`,
    payload
  );
  return data;
}

export async function deleteNomineeVotingPlayer(id: number): Promise<void> {
  await newsfeedClient.delete(`/nominee-voting-player/${id}/`);
}
