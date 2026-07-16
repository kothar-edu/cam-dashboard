import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredAccessToken, setAuthTokens, clearAuthTokens } from './client';

describe('api client storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves access token', () => {
    setAuthTokens('access-abc', 'refresh-xyz');
    expect(getStoredAccessToken()).toBe('access-abc');
  });

  it('clears tokens on logout', () => {
    setAuthTokens('a', 'r');
    clearAuthTokens();
    expect(getStoredAccessToken()).toBeNull();
  });
});
