import { apiClient } from './client';
import type { Tenant } from './tenants';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type TenantMembership = {
  id: number;
  user: string;
  user_email: string;
  tenant: number;
  tenant_name: string;
  role: string;
  created: string;
};

export type CreateTenantPayload = {
  name: string;
};

export type AssignTenantAdminPayload = {
  user: string;
  tenant: number;
};

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  const { data } = await apiClient.post<Tenant>('/tenants/', payload);
  return data;
}

export async function listTenantMemberships(
  params?: ListParams & { tenant?: number }
): Promise<Paginated<TenantMembership>> {
  const response = await apiClient.get<Paginated<TenantMembership> | TenantMembership[]>(
    '/tenants/memberships/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function assignTenantAdmin(
  payload: AssignTenantAdminPayload
): Promise<TenantMembership> {
  const { data } = await apiClient.post<TenantMembership>('/tenants/memberships/', payload);
  return data;
}

export async function revokeTenantAdmin(membershipId: number): Promise<void> {
  await apiClient.delete(`/tenants/memberships/${membershipId}/`);
}
