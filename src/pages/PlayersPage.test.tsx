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
  it('renders player table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <PlayersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Jersey')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    const nameLink = screen.getByRole('link', { name: 'Anish Shrestha' });
    expect(nameLink).toHaveAttribute('href', '/dashboard/players/1/stats');
    expect(screen.getByText('Royal Strikers')).toBeInTheDocument();
  });
});
