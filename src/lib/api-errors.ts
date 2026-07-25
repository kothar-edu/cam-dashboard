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

  // Bulk/many=True endpoints 400 with one error object per submitted row -
  // report the first row that actually failed, not just a generic fallback.
  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index += 1) {
      const row = data[index];
      if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).length === 0)
        continue;
      const [field, value] = Object.entries(row as Record<string, unknown>)[0];
      const message = Array.isArray(value) ? String(value[0]) : String(value);
      return field === 'non_field_errors' || field === 'detail'
        ? `Row ${index + 1}: ${message}`
        : `Row ${index + 1}: ${field} — ${message}`;
    }
    return fallback;
  }

  if (typeof data === 'object' && data !== null) {
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
