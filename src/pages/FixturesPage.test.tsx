import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import FixturesPage from './FixturesPage';

const useFixturesMock = vi.fn();

vi.mock('@/hooks/useFixtures', () => ({
  useFixtures: (params: unknown) => useFixturesMock(params),
  useUpdateFixture: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useForfeitFixture: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useAbandonFixture: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    data: {
      count: 2,
      results: [
        { id: 'team-alpha', name: 'Team Alpha', code: 'ALP', logo: null, total_players: 11, is_active: true },
        { id: 'team-beta', name: 'Team Beta', code: 'BET', logo: null, total_players: 11, is_active: true },
      ],
    },
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

function renderPage() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('FixturesPage', () => {
  beforeEach(() => {
    useFixturesMock.mockReset();
    useFixturesMock.mockReturnValue({
      data: {
        count: 1,
        results: [
          {
            id: '1',
            opponent_a: { id: 'a', team_name: 'Team Alpha' },
            opponent_b: { id: 'b', team_name: 'Team Beta' },
            tournament: { id: 't1', name: 'Summer League', logo: null, start: '2026-06-01', total_teams: 8 },
            status: 'Upcoming',
            time: '2026-07-20T10:00:00Z',
            ground: 'Main Ground',
            round: 'Group A',
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
  });

  it('renders fixture table headers and row data', () => {
    renderPage();

    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('Tournament')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha vs Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Summer League')).toBeInTheDocument();
  });

  it('defaults to the Upcoming tab and fetches with status=Upcoming', () => {
    renderPage();

    expect(useFixturesMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'Upcoming', offset: 0 })
    );
  });

  it('renders Live/Upcoming/Ended tabs and refetches with the new status on click, resetting to page 1', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Live' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ended' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ended' }));

    expect(useFixturesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'Ended', offset: 0 })
    );
  });

  it('passes team and opponent_team params once both Team A and Team B are selected', async () => {
    const user = userEvent.setup();
    renderPage();

    const [teamATrigger, teamBTrigger] = screen.getAllByRole('button', { name: 'Any team' });

    await user.click(teamATrigger);
    await user.click(screen.getByRole('option', { name: 'Team Alpha' }));

    await user.click(teamBTrigger);
    await user.click(screen.getByRole('option', { name: 'Team Beta' }));

    expect(useFixturesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ team: 'team-alpha', opponent_team: 'team-beta' })
    );
  });

  it('omits team params entirely when no team filter is selected', () => {
    renderPage();

    const lastCall = useFixturesMock.mock.calls.at(-1)?.[0];
    expect(lastCall).not.toHaveProperty('team');
    expect(lastCall).not.toHaveProperty('opponent_team');
  });
});
