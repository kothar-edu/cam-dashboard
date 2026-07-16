import { apiClient } from './client';

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  re_new_password: string;
};

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/user/change_password/', payload);
  return data;
}
