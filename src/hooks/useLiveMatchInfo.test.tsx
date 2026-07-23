import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLiveMatchInfo } from './useLiveMatchInfo';
import * as livescoreApi from '@/api/livescore';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLiveMatchInfo', () => {
  it('fetches match info once a matchId is provided', async () => {
    const info = {
      ground: 'Main Ground',
      tournamentName: 'Cup',
      powerplayOvers: 6,
      livestreamOverlay: { sponsorText: 'Sponsor', topLeftImage: null, topRightImage: null },
    };
    vi.spyOn(livescoreApi, 'fetchLiveMatchInfo').mockResolvedValue(info);

    const { result } = renderHook(() => useLiveMatchInfo('match-1'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(info));
  });

  it('does not fetch when matchId is undefined', () => {
    const spy = vi.spyOn(livescoreApi, 'fetchLiveMatchInfo');
    renderHook(() => useLiveMatchInfo(undefined), { wrapper });
    expect(spy).not.toHaveBeenCalled();
  });
});
