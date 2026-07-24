import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTeamRoster } from './useTeamRoster';
import * as playersApi from '@/api/players';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTeamRoster', () => {
  it('fetches every player on the given team', async () => {
    const players = [{ id: 'p1', full_name: 'Player One', jersey_no: 7, current_team: 'team-1', is_active: true, team_name: 'Team A', user: null }];
    const spy = vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({ count: 1, results: players });

    const { result } = renderHook(() => useTeamRoster('team-1'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(players));
    expect(spy).toHaveBeenCalledWith({ current_team: 'team-1', limit: 500 });
  });

  it('does not fetch when teamId is undefined', () => {
    const spy = vi.spyOn(playersApi, 'listPlayers');
    renderHook(() => useTeamRoster(undefined), { wrapper });
    expect(spy).not.toHaveBeenCalled();
  });
});
