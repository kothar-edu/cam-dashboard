import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScorecardsPage from './ScorecardsPage';

vi.mock('@/hooks/useScorecards', () => ({
  useScorecards: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          opponent_a: { id: 'a', team_name: 'Team Alpha', team_logo: null },
          opponent_b: { id: 'b', team_name: 'Team Beta', team_logo: null },
          tournament: {
            id: 't1',
            name: 'Summer League',
            logo: null,
            start: '2026-06-01',
            total_teams: 8,
          },
          status: 'Ended',
          time: '2026-07-10T10:00:00Z',
          ground: 'Main Ground',
          round: 'Final',
          winner: { id: 'a', team: 'Team Alpha' },
          man_of_the_match: { id: 'p1', full_name: 'Alex Captain' },
          abandoned: false,
          tied: false,
          dls: false,
          result: {
            opponent_a: {
              runs_scored: 156,
              overs_bowled: 19.3,
              wickets_lost: 7,
              wickets_taken: 10,
            },
            opponent_b: {
              runs_scored: 142,
              overs_bowled: 20,
              wickets_lost: 10,
              wickets_taken: 7,
            },
          },
        },
      ],
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

describe('ScorecardsPage', () => {
  it('renders scorecard cards with scores and match details', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ScorecardsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Scorecards')).toBeInTheDocument();
    expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team Beta').length).toBeGreaterThan(0);
    expect(screen.getByText('156/7 (19.3 ov)')).toBeInTheDocument();
    expect(screen.getByText('142/10 (20 ov)')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha won')).toBeInTheDocument();
    expect(screen.getByText('Main Ground')).toBeInTheDocument();
    expect(screen.getByText(/Alex Captain/)).toBeInTheDocument();
    expect(screen.getByText('Summer League')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard/scorecards/1');
  });
});
