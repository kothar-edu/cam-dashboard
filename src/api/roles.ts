import { apiClient } from './client';

export type Role = {
  id: number;
  name: string;
};

export async function listRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/user/role/');
  return data;
}
