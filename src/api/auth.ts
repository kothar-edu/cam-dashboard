import { apiClient, setAuthTokens } from './client';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  roles: string[];
  tenant_admin_schemas: string[];
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/user/login/', { email, password });
  setAuthTokens(data.access, data.refresh);
  return data;
}

export async function fetchMyProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/user/me/');
  return data;
}
