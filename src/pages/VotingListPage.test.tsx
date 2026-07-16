import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import VotingListPage from './VotingListPage';

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

vi.mock('@/hooks/useVoting', () => ({
  useNomineeVotingPlayers: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 1,
          tournament: { id: 't1', name: 'Premier League', logo: null, start: '', total_teams: 4 },
          player: [{ id: 'p1', full_name: 'Player One' }],
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('VotingListPage', () => {
  it('renders voting nominations table', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <VotingListPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Voting polls')).toBeInTheDocument();
    expect(screen.getByText('Premier League')).toBeInTheDocument();
    expect(screen.getByText('Create nomination')).toBeInTheDocument();
  });
});
