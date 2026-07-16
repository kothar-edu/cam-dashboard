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
  picture?: File | null;
  id_card?: File | null;
  pay_slip?: File | null;
  study_document?: File | null;
};

function appendCreateAdminFields(form: FormData, payload: CreateAdminPayload) {
  form.append('email', payload.email);
  form.append('full_name', payload.full_name);
  form.append('gender', payload.gender);
  form.append('dob', payload.dob);
  form.append('nationality', String(payload.nationality));
  form.append('visa_type', payload.visa_type);
  if (payload.phone) form.append('phone', payload.phone);
  if (payload.other_country) form.append('other_country', payload.other_country);
  if (payload.role != null) form.append('role', String(payload.role));
  if (payload.team) form.append('team', payload.team);
  if (payload.picture) form.append('picture', payload.picture);
  if (payload.id_card) form.append('id_card', payload.id_card);
  if (payload.pay_slip) form.append('pay_slip', payload.pay_slip);
  if (payload.study_document) form.append('study_document', payload.study_document);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/user/change_password/', payload);
  return data;
}

export async function createAdminUser(payload: CreateAdminPayload): Promise<{ id: string; email: string }> {
  const hasFiles = Boolean(payload.picture || payload.id_card || payload.pay_slip || payload.study_document);
  if (hasFiles) {
    const form = new FormData();
    appendCreateAdminFields(form, payload);
    const { data } = await apiClient.post<{ id: string; email: string }>('/user/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await apiClient.post<{ id: string; email: string }>('/user/', payload);
  return data;
}
