import { apiClient } from './client';

export type Tenant = {
  id: number;
  name: string;
  schema_name: string;
  is_active: boolean;
};

export async function listAccessibleTenants(): Promise<Tenant[]> {
  const { data } = await apiClient.get<Tenant[]>('/tenants/accessible/');
  return data;
}
