import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScoreLivePage from './ScoreLivePage';
import * as useLiveMatchModule from '@/hooks/useLiveMatch';
import { createInitialLiveMatchState } from '@/lib/liveMatchReducer';

const FIXTURE_DATA = {
  id: 'match-1',
  opponent_a: { id: 'team-1', team: { id: 'team-1', name: 'Team Alpha', code: 'ALP', logo: null } },
  opponent_b: { id: 'team-2', team: { id: 'team-2', name: 'Team Beta', code: 'BET', logo: null } },
};

vi.mock('@/hooks/useLiveMatch');
vi.mock('@/hooks/useFixtures', () => ({
  useFixture: () => ({ data: FIXTURE_DATA, isLoading: false }),
  useForfeitFixture: () => ({ mutate: vi.fn(), isPending: false }),
  useAbandonFixture: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ activeTenantId: 'tenant-1', activeTenant: { id: 'tenant-1', schema_name: 'tenant-1', name: 'Tenant' } }),
}));

function renderPage(matchId = 'match-1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/dashboard/fixtures/${matchId}/score`]}>
        <Routes>
          <Route path="/dashboard/fixtures/:id/score" element={<ScoreLivePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ScoreLivePage', () => {
  beforeEach(() => {
    vi.mocked(useLiveMatchModule.useLiveMatch).mockReturnValue({
      state: createInitialLiveMatchState(),
      connectionStatus: 'reconnecting',
      sendEvent: vi.fn(),
    });
  });

  it('shows a reconnecting banner and disables scoring controls when not connected', () => {
    renderPage();
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeDisabled();
  });

  it('renders the fixture opponent team names in the page title', () => {
    renderPage();
    expect(screen.getByText('Team Alpha vs Team Beta')).toBeInTheDocument();
  });

  it('enables controls once connectionStatus is open', () => {
    vi.mocked(useLiveMatchModule.useLiveMatch).mockReturnValue({
      state: createInitialLiveMatchState(),
      connectionStatus: 'open',
      sendEvent: vi.fn(),
    });
    renderPage();
    expect(screen.getByRole('button', { name: '4' })).toBeEnabled();
  });
});
