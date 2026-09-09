import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type JerseyWindow = {
  id: number;
  tournament: { id: string; name: string };
  from_date_time: string;
  to_date_time: string;
  description?: string | null;
};

export type CreateJerseyWindowPayload = {
  tournament: string;
  from_date_time: string;
  to_date_time: string;
  description?: string;
};

export type JerseyOrder = {
  id: number;
  jersey_request: JerseyWindow;
  player: { id: string; full_name: string };
  jersey_number: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  status_message?: string | null;
};

export type ReviewJerseyOrderPayload = {
  player_jersey_request: number;
  status: 'Approved' | 'Rejected';
  message?: string;
};

export async function listJerseyWindows(
  params?: ListParams & { tournament?: string }
): Promise<Paginated<JerseyWindow>> {
  const response = await apiClient.get<Paginated<JerseyWindow> | JerseyWindow[]>(
    '/game/initiate-jersey-request/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function createJerseyWindow(
  payload: CreateJerseyWindowPayload
): Promise<JerseyWindow> {
  const { data } = await apiClient.post<JerseyWindow>(
    '/game/initiate-jersey-request/',
    payload
  );
  return data;
}

export async function updateJerseyWindow(
  windowId: number,
  payload: Partial<CreateJerseyWindowPayload>
): Promise<JerseyWindow> {
  const { data } = await apiClient.patch<JerseyWindow>(
    `/game/initiate-jersey-request/${windowId}/`,
    payload
  );
  return data;
}

export async function deleteJerseyWindow(windowId: number): Promise<void> {
  await apiClient.delete(`/game/initiate-jersey-request/${windowId}/`);
}

export async function listJerseyOrders(
  params?: ListParams & { tournament?: string }
): Promise<Paginated<JerseyOrder>> {
  const response = await apiClient.get<Paginated<JerseyOrder> | JerseyOrder[]>(
    '/game/player-jersey-request/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function reviewJerseyOrder(
  payload: ReviewJerseyOrderPayload
): Promise<void> {
  await apiClient.post('/game/player-jersey-request/update-status/', payload);
}
