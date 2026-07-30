import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

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

export async function listAccessibleTenantsPaged(params: ListParams): Promise<Paginated<Tenant>> {
  const { data } = await apiClient.get<Paginated<Tenant> | Tenant[]>('/tenants/accessible/', {
    params,
  });
  return parsePaginated(data);
}
