import { isAxiosError } from 'axios';

export type FieldErrors = Record<string, string>;

export function parseApiFieldErrors(error: unknown): FieldErrors {
  if (!isAxiosError(error) || !error.response?.data) return {};

  const data = error.response.data;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};

  const errors: FieldErrors = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'detail' || key === 'non_field_errors') continue;
    if (Array.isArray(value) && value.length > 0) {
      errors[key] = String(value[0]);
    } else if (typeof value === 'string') {
      errors[key] = value;
    }
  }
  return errors;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error) || !error.response?.data) return fallback;

  const data = error.response.data;
  if (typeof data === 'string') return data;

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    if ('detail' in data) {
      const detail = data.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0) return String(detail[0]);
    }

    if ('non_field_errors' in data) {
      const nonField = data.non_field_errors;
      if (Array.isArray(nonField) && nonField.length > 0) return String(nonField[0]);
    }

    const fieldErrors = parseApiFieldErrors(error);
    const messages = Object.values(fieldErrors);
    if (messages.length > 0) return messages.join(' ');
  }

  return fallback;
}
