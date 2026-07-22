import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FixtureFormPage from './FixtureFormPage';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const FIXTURE_DATA = {
  id: 'fixture-1',
  time: '2026-07-17T12:00:00Z',
  ground: 'Main Ground',
  round: 'Final',
  is_public: false,
  live_stream_url: 'https://www.youtube.com/watch?v=abc123',
  opponent_a: { id: 'team-1', team_name: 'Team Alpha' },
  opponent_b: { id: 'team-2', team_name: 'Team Beta' },
};

vi.mock('@/hooks/useFixtures', () => ({
  useFixture: () => ({
    data: FIXTURE_DATA,
    isLoading: false,
  }),
  useCreateFixture: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateFixture: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    data: {
      results: [
        { id: 'team-1', name: 'Team Alpha' },
        { id: 'team-2', name: 'Team Beta' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useTournaments', () => ({
  useTournaments: () => ({
    data: { results: [{ id: 'tournament-1', name: 'Summer League' }] },
    isLoading: false,
  }),
  useTournament: () => ({ data: undefined, isLoading: false }),
  useCreateTournamentFixture: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('FixtureFormPage edit', () => {
  it('shows stored is_public and YouTube URL fields', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/dashboard/fixtures/fixture-1']}>
          <Routes>
            <Route path="/dashboard/fixtures/:id" element={<FixtureFormPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Edit fixture' })).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', { name: 'Public match (visible to guests and non-members)' })
      ).not.toBeChecked();
    });
    expect(screen.getByDisplayValue('https://www.youtube.com/watch?v=abc123')).toBeInTheDocument();
  });
});
