import { apiClient, getStoredAccessToken, getStoredTenantId } from './client';
import type { LiveMatchInfo } from '@/types/liveMatch';

function resolveWsOrigin(): string {
  const viteBase = (import.meta.env.VITE_URL ?? '/').replace(/\/+$/, '');
  const httpOrigin = viteBase || window.location.origin;
  const wsProtocol = httpOrigin.startsWith('https') ? 'wss' : 'ws';
  return `${wsProtocol}${httpOrigin.replace(/^https?/, '')}`;
}

export function buildLiveScoreWsUrl(matchId: string, tenantOverride?: string | null): string {
  const base = `${resolveWsOrigin()}/ws/livescore/v2/${matchId}/`;

  const params = new URLSearchParams();
  const token = getStoredAccessToken();
  if (token) params.set('token', token);
  const tenantId = tenantOverride ?? getStoredTenantId();
  if (tenantId) params.set('tenant', tenantId);

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export async function fetchLiveMatchInfo(
  matchId: string,
  tenantOverride?: string | null
): Promise<LiveMatchInfo> {
  const response = await apiClient.get(`/game/match/${matchId}/`, {
    headers: tenantOverride ? { 'X-Tenant-ID': tenantOverride } : undefined,
  });
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
    sponsors: (data.sponsors ?? []).map((sponsor: Record<string, unknown>) => ({
      id: String(sponsor.id),
      name: String(sponsor.name),
      imageUrl: (sponsor.image as string | null) ?? null,
      level: sponsor.sponsor_type as LiveMatchInfo['sponsors'][number]['level'],
    })),
  };
}
