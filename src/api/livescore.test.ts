import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setAuthTokens, clearAuthTokens, setStoredTenantId } from './client';
import { buildLiveScoreWsUrl } from './livescore';

describe('buildLiveScoreWsUrl', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('builds the ws url from the configured backend origin (VITE_URL), not the page origin', () => {
    vi.stubEnv('VITE_URL', 'http://127.0.0.1:8000');
    vi.stubGlobal('location', { ...window.location, origin: 'http://localhost:5173' });
    setAuthTokens('access-123', 'refresh-456');
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe(
      'ws://127.0.0.1:8000/ws/livescore/v2/match-1/?token=access-123&tenant=acme'
    );
  });

  it('uses wss when the backend origin is https', () => {
    vi.stubEnv('VITE_URL', 'https://api.example.com');
    clearAuthTokens();
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe('wss://api.example.com/ws/livescore/v2/match-1/?tenant=acme');
  });

  it('falls back to the page origin when VITE_URL is unset (same-origin reverse-proxy deploys)', () => {
    vi.stubEnv('VITE_URL', '');
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
    clearAuthTokens();
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe('wss://app.example.com/ws/livescore/v2/match-1/?tenant=acme');
  });

  it('omits token query param when no access token is stored', () => {
    vi.stubEnv('VITE_URL', 'http://127.0.0.1:8000');
    clearAuthTokens();
    setStoredTenantId('acme');

    const url = buildLiveScoreWsUrl('match-1');

    expect(url).toBe('ws://127.0.0.1:8000/ws/livescore/v2/match-1/?tenant=acme');
  });
});
