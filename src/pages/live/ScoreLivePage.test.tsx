import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScoreLivePage from './ScoreLivePage';
import * as useLiveMatchModule from '@/hooks/useLiveMatch';
import { createInitialLiveMatchState } from '@/lib/liveMatchReducer';

const LINEUP_ENTRY = {
  id: 'lineup-1',
  player: { id: 'p1', full_name: 'Player One' },
  runs_scored: 0,
  balls_faced: 0,
  fours: 0,
  sixes: 0,
  dismissed: false,
  wickets_taken: 0,
  balls_thrown: 0,
  runs_conceded: 0,
  maidens: 0,
  hattricks: 0,
  catches: 0,
  run_outs: 0,
  direct_hits: 0,
  run_out_supports: 0,
  stumps: 0,
};

const FIXTURE_WITH_LINEUPS = {
  id: 'match-1',
  opponent_a: { id: 'team-1', team: { id: 'team-1', name: 'Team Alpha', code: 'ALP', logo: null } },
  opponent_b: { id: 'team-2', team: { id: 'team-2', name: 'Team Beta', code: 'BET', logo: null } },
  lineups_a: [LINEUP_ENTRY],
  lineups_b: [LINEUP_ENTRY],
};

const FIXTURE_WITHOUT_LINEUPS = {
  ...FIXTURE_WITH_LINEUPS,
  lineups_a: [],
  lineups_b: [],
};

let mockFixture: unknown = FIXTURE_WITH_LINEUPS;

vi.mock('@/hooks/useLiveMatch');
vi.mock('@/hooks/useFixtures', () => ({
  useFixture: () => ({ data: mockFixture, isLoading: false }),
  useForfeitFixture: () => ({ mutate: vi.fn(), isPending: false }),
  useAbandonFixture: () => ({ mutate: vi.fn(), isPending: false }),
  useStartMatch: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/hooks/useTeamRoster', () => ({
  useTeamRoster: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenantId: 'tenant-1',
    activeTenant: { id: 'tenant-1', schema_name: 'tenant-1', name: 'Tenant' },
  }),
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
    </QueryClientProvider>
  );
}

describe('ScoreLivePage', () => {
  beforeEach(() => {
    mockFixture = FIXTURE_WITH_LINEUPS;
    vi.mocked(useLiveMatchModule.useLiveMatch).mockReturnValue({
      state: createInitialLiveMatchState(),
      connectionStatus: 'reconnecting',
      sendEvent: vi.fn(),
    });
  });

  it('shows a reconnecting status and disables scoring controls when not connected', () => {
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

  it('shows the pre-match setup wizard instead of the scoring console when no lineups exist yet', () => {
    mockFixture = FIXTURE_WITHOUT_LINEUPS;
    renderPage();
    expect(screen.getByText('Team Alpha — Starting XI')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument();
  });
});
