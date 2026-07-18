import { apiClient } from './client';
import { ListParams, Paginated, parsePaginated } from './pagination';

export type DashboardUser = {
  id: string;
  full_name: string;
  email: string;
  picture: string | null;
  roles: string[];
  is_verified: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_payment_verified: boolean;
  payment_status: string;
  subscription_end_date: string | null;
};

export type UserDetail = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string;
  roles: string[];
  payment_status: string;
  subscription_end_date: string | null;
  is_payment_verified: boolean;
};

export type UserLookup = {
  id: string;
  email: string;
  full_name: string;
};

export async function listUsers(params?: ListParams): Promise<Paginated<DashboardUser>> {
  const response = await apiClient.get<Paginated<DashboardUser> | DashboardUser[]>('/user/', {
    params,
  });
  return parsePaginated(response.data);
}

export async function lookupUserByEmail(email: string): Promise<UserLookup> {
  const { data } = await apiClient.get<UserLookup>('/user/lookup/', { params: { email } });
  return data;
}

export type UpdateUserPaymentPayload = {
  is_payment_verified?: boolean;
  payment_status?: string;
};

export async function updateUserPayment(
  userId: string,
  payload: UpdateUserPaymentPayload
): Promise<DashboardUser> {
  const { data } = await apiClient.patch<DashboardUser>(`/user/${userId}/`, payload);
  return data;
}

export async function getUser(userId: string): Promise<UserDetail> {
  const { data } = await apiClient.get<UserDetail>(`/user/${userId}/`);
  return data;
}

export type UpdateUserPayload = {
  full_name?: string;
  phone?: string;
  gender?: string;
  payment_status?: string;
  subscription_end_date?: string | null;
  is_payment_verified?: boolean;
  groups?: number[];
};

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<UserDetail> {
  const { data } = await apiClient.patch<UserDetail>(`/user/${userId}/`, payload);
  return data;
}
