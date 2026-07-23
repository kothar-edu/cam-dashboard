import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAuthTokens, clearAuthTokens, setStoredTenantId } from './client';
import { buildLiveScoreWsUrl } from './livescore';

describe('buildLiveScoreWsUrl', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
  });

  it('builds a wss url with token and tenant query params when both are stored', () => {
    setAuthTokens('access-123', 'refresh-456');
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe(
      'wss://app.example.com/ws/livescore/v2/match-1/?token=access-123&tenant=acme'
    );
  });

  it('omits token query param when no access token is stored', () => {
    clearAuthTokens();
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe('wss://app.example.com/ws/livescore/v2/match-1/?tenant=acme');
  });
});
