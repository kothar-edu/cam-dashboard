import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import FixtureFormPage from './FixtureFormPage';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useFixtures', () => ({
  useFixture: () => ({ data: undefined, isLoading: false }),
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
    data: {
      results: [{ id: 'tournament-1', name: 'Summer League' }],
    },
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

describe('FixtureFormPage', () => {
  it('renders create fixture form fields', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/dashboard/fixtures/new']}>
          <FixtureFormPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Create fixture' })).toBeInTheDocument();
    expect(screen.getByText('Tournament (optional)')).toBeInTheDocument();
    expect(screen.getByText('Series name')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.queryByText('Round', { selector: 'label' })).not.toBeInTheDocument();
  });
});
