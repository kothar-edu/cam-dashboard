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

export async function listUsers(params?: ListParams): Promise<Paginated<DashboardUser>> {
  const response = await apiClient.get<Paginated<DashboardUser> | DashboardUser[]>('/user/', {
    params,
  });
  return parsePaginated(response.data);
}
