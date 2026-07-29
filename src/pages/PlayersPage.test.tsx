import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PlayersPage from './PlayersPage';

vi.mock('@/hooks/usePlayers', () => ({
  usePlayers: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          full_name: 'Anish Shrestha',
          jersey_no: 7,
          current_team: 'team-1',
          is_active: true,
          team_name: 'Royal Strikers',
          user: { id: 'u1', full_name: 'Anish Shrestha' },
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useUpdatePlayer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    data: {
      count: 1,
      results: [{ id: 'team-1', name: 'Royal Strikers', code: 'RS', is_active: true }],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: {
      id: 1,
      name: 'CAM Youth',
      schema_name: 'cam_youth_association',
      is_active: true,
    },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('PlayersPage', () => {
  it('renders search and linked player/team names', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <PlayersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Search players')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Anish Shrestha' })).toHaveAttribute(
      'href',
      '/dashboard/players/1/stats'
    );
    expect(screen.getByRole('link', { name: 'Royal Strikers' })).toHaveAttribute(
      'href',
      '/dashboard/teams/team-1/roster'
    );
  });
});
