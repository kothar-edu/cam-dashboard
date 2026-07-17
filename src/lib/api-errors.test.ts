import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage, parseApiFieldErrors } from './api-errors';

function axiosErrorWithData(data: unknown) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as never,
    data,
  });
}

describe('parseApiFieldErrors', () => {
  it('maps DRF field validation arrays to strings', () => {
    const error = axiosErrorWithData({
      round: ['"scsdfs" is not a valid choice.'],
      ground: ['This field may not be blank.'],
    });

    expect(parseApiFieldErrors(error)).toEqual({
      round: '"scsdfs" is not a valid choice.',
      ground: 'This field may not be blank.',
    });
  });

  it('returns empty object for non-axios errors', () => {
    expect(parseApiFieldErrors(new Error('nope'))).toEqual({});
  });
});

describe('getApiErrorMessage', () => {
  it('prefers detail message when present', () => {
    const error = axiosErrorWithData({ detail: 'Permission denied.' });
    expect(getApiErrorMessage(error, 'Fallback')).toBe('Permission denied.');
  });

  it('joins field errors when detail is absent', () => {
    const error = axiosErrorWithData({
      round: ['"scsdfs" is not a valid choice.'],
    });
    expect(getApiErrorMessage(error, 'Fallback')).toBe('"scsdfs" is not a valid choice.');
  });

  it('uses fallback for unknown errors', () => {
    expect(getApiErrorMessage(new Error('nope'), 'Fallback')).toBe('Fallback');
  });
});
