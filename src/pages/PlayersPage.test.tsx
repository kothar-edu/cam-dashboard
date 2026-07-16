import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('PlayersPage', () => {
  it('renders player table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PlayersPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Jersey')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Anish Shrestha')).toBeInTheDocument();
    expect(screen.getByText('Royal Strikers')).toBeInTheDocument();
  });
});
