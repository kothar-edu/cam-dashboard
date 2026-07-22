import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type TenantRegistration = {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  tenant: number;
  tenant_name: string;
  tenant_schema_name: string;
  is_paid: boolean;
  receipt: string | null;
  id_document: string | null;
  id_document_verified_at: string | null;
  id_document_verified_by: string | null;
  is_student_fee: boolean;
  study_document: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created: string;
};

export type TeamJoinApplication = {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  team: string;
  team_name: string;
  team_code: string;
  is_paid: boolean;
  receipt: string | null;
  id_document: string | null;
  reuse_tenant_id_document: boolean;
  resolved_id_document_url: string | null;
  is_student_fee: boolean;
  study_document: string | null;
  is_approved: boolean;
  created: string;
};

export async function listTenantRegistrations(
  params?: ListParams
): Promise<Paginated<TenantRegistration>> {
  const response = await apiClient.get<Paginated<TenantRegistration> | TenantRegistration[]>(
    '/tenants/registrations/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function approveTenantRegistration(id: number): Promise<TenantRegistration> {
  const { data } = await apiClient.post<TenantRegistration>(
    `/tenants/registrations/${id}/approve/`
  );
  return data;
}

export async function rejectTenantRegistration(
  id: number,
  reason?: string
): Promise<TenantRegistration> {
  const { data } = await apiClient.post<TenantRegistration>(
    `/tenants/registrations/${id}/reject/`,
    { reason: reason ?? '' }
  );
  return data;
}

export async function listTeamJoinApplications(
  params?: ListParams
): Promise<Paginated<TeamJoinApplication>> {
  const response = await apiClient.get<Paginated<TeamJoinApplication> | TeamJoinApplication[]>(
    '/game/my-team/applications/',
    { params }
  );
  return parsePaginated(response.data);
}

export async function approveTeamJoinApplication(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    `/game/my-team/applications/${id}/approve/`
  );
  return data;
}

export async function rejectTeamJoinApplication(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    `/game/my-team/applications/${id}/reject/`
  );
  return data;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = import.meta.env.VITE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}
