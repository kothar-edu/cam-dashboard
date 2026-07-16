import { apiClient } from './client';

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  re_new_password: string;
};

export type CreateAdminPayload = {
  email: string;
  full_name: string;
  gender: string;
  phone?: string;
  dob: string;
  nationality: number;
  other_country?: string;
  visa_type: string;
  role?: number;
  team?: string;
};

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/user/change_password/', payload);
  return data;
}

export async function createAdminUser(payload: CreateAdminPayload): Promise<{ id: string; email: string }> {
  const { data } = await apiClient.post<{ id: string; email: string }>('/user/', payload);
  return data;
}
