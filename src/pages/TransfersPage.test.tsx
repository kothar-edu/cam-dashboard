import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransfersPage from './TransfersPage';

vi.mock('@/hooks/usePlayers', () => ({
  usePlayers: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 'p1',
          full_name: 'Virat Kohli',
          jersey_no: 18,
          current_team: 't1',
          is_active: true,
          team_name: 'Royal Challengers',
          user: null,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    data: {
      count: 2,
      results: [
        { id: 't1', name: 'Royal Challengers', code: 'RCB', logo: null, total_players: 15 },
        { id: 't2', name: 'Super Kings', code: 'CSK', logo: null, total_players: 14 },
      ],
    },
  }),
}));

vi.mock('@/hooks/useTransfers', () => ({
  useTransferPlayer: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('TransfersPage', () => {
  it('renders player transfer table', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <TransfersPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Player Transfers')).toBeInTheDocument();
    expect(screen.getByText('Virat Kohli')).toBeInTheDocument();
    expect(screen.getByText('Royal Challengers')).toBeInTheDocument();
    expect(screen.getByText('Transfer player')).toBeInTheDocument();
  });
});
