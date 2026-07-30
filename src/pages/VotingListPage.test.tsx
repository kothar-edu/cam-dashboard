import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import VotingListPage from './VotingListPage';

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

vi.mock('@/hooks/useVoting', () => ({
  useNomineeVotingPlayers: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 'a7096220-0000-4000-8000-000000000001',
          is_voting_open: true,
          tournament: { id: 't1', name: 'Premier League', logo: null, start: '', total_teams: 4 },
          player: [
            { id: 'p1', full_name: 'Player One', team_name: 'Team A' },
            { id: 'p2', full_name: 'Player Two', team_name: 'Team B' },
          ],
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useVotingPolls: () => ({
    data: {
      count: 1,
      results: [
        {
          tournament: { id: 't1', name: 'Premier League', logo: null, start: '', total_teams: 4 },
          player: [
            { id: 'p1', full_name: 'Player One', total_votes: 12, team_name: 'Team A' },
            { id: 'p2', full_name: 'Player Two', total_votes: 5, team_name: 'Team B' },
          ],
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateNomineeVotingPlayer: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('VotingListPage', () => {
  it('renders poll cards with graphical standings for all nominees', () => {
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
    expect(screen.getByText('Voting open')).toBeInTheDocument();
    expect(screen.getByText('Vote standings')).toBeInTheDocument();
    expect(screen.getAllByText('Player One').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Player Two').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getByText(/17 total votes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close voting' })).toBeInTheDocument();
    expect(screen.getByText('Votes cast')).toBeInTheDocument();
  });
});
