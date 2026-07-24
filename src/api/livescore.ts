import { apiClient, getStoredAccessToken, getStoredTenantId } from './client';
import type { LiveMatchInfo } from '@/types/liveMatch';

function resolveWsOrigin(): string {
  // Mirrors client.ts's own VITE_URL resolution: an absolute VITE_URL points
  // at a separately-hosted Django backend (e.g. local dev, 5173 vs 8000) and
  // must win. Only fall back to the page's own origin when VITE_URL is unset
  // (same-origin reverse-proxy deploys, where frontend and backend share a host).
  const viteBase = (import.meta.env.VITE_URL ?? '/').replace(/\/+$/, '');
  const httpOrigin = viteBase || window.location.origin;
  const wsProtocol = httpOrigin.startsWith('https') ? 'wss' : 'ws';
  return `${wsProtocol}${httpOrigin.replace(/^https?/, '')}`;
}

export function buildLiveScoreWsUrl(matchId: string): string {
  const base = `${resolveWsOrigin()}/ws/livescore/v2/${matchId}/`;

  const params = new URLSearchParams();
  const token = getStoredAccessToken();
  if (token) params.set('token', token);
  const tenantId = getStoredTenantId();
  if (tenantId) params.set('tenant', tenantId);

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export async function fetchLiveMatchInfo(matchId: string): Promise<LiveMatchInfo> {
  const response = await apiClient.get(`/game/match/${matchId}/`);
  const data = response.data;
  return {
    ground: data.ground ?? null,
    tournamentName: data.tournament?.name ?? null,
    powerplayOvers: data.powerplay_overs,
    livestreamOverlay: {
      sponsorText: data.livestream_overlay?.sponsor_text ?? null,
      topLeftImage: data.livestream_overlay?.top_left_image ?? null,
      topRightImage: data.livestream_overlay?.top_right_image ?? null,
    },
    boundaryLabels: {
      four: data.boundary_labels?.four ?? null,
      six: data.boundary_labels?.six ?? null,
    },
  };
}
