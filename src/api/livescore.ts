import { apiClient, getStoredAccessToken, getStoredTenantId } from './client';
import type { LiveMatchInfo } from '@/types/liveMatch';

export function buildLiveScoreWsUrl(matchId: string): string {
  const wsProtocol = window.location.origin.startsWith('https') ? 'wss' : 'ws';
  const host = window.location.origin.replace(/^https?/, '');
  const base = `${wsProtocol}${host}/ws/livescore/v2/${matchId}/`;

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
  };
}
