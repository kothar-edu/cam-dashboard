import { apiClient } from './client';

export type PaymentSettings = {
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  bank_branch: string;
  verification_fee_amount: string | null;
  require_payment_verification: boolean;
};

export type PaymentSettingsUpdate = Partial<PaymentSettings>;

export async function getTenantPaymentSettings(tenantId: number): Promise<PaymentSettings> {
  const { data } = await apiClient.get<PaymentSettings>(`/tenants/${tenantId}/payment-settings/`);
  return data;
}

export async function updateTenantPaymentSettings(
  tenantId: number,
  payload: PaymentSettingsUpdate
): Promise<PaymentSettings> {
  const { data } = await apiClient.patch<PaymentSettings>(
    `/tenants/${tenantId}/payment-settings/`,
    payload
  );
  return data;
}

export async function getTeamPaymentSettings(teamId: string): Promise<PaymentSettings> {
  const { data } = await apiClient.get<PaymentSettings>(`/game/teams/${teamId}/payment-settings/`);
  return data;
}

export async function updateTeamPaymentSettings(
  teamId: string,
  payload: PaymentSettingsUpdate
): Promise<PaymentSettings> {
  const { data } = await apiClient.patch<PaymentSettings>(
    `/game/teams/${teamId}/payment-settings/`,
    payload
  );
  return data;
}
