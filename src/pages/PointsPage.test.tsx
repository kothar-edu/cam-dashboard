import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PointsPage from './PointsPage';

vi.mock('@/hooks/useTournaments', () => ({
  useTournaments: () => ({
    data: {
      count: 1,
      results: [
        { id: 't1', name: 'Summer League', logo: null, start: '2026-06-01', total_teams: 8 },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePointsTable', () => ({
  usePointsTable: () => ({
    data: [
      {
        id: 'o1',
        team: {
          id: '1',
          name: 'Royal Strikers',
          code: 'RST',
          logo: null,
          total_players: 15,
          is_active: true,
        },
        group: 'A',
        matches_played: 5,
        matches_won: 4,
        matches_lost: 1,
        abandoned: 0,
        tied: 0,
        points: 8,
        nrr: 1.234,
        runs_scored: 820,
        runs_conceded: 640,
        wickets_taken: 38,
        wickets_lost: 22,
        overs_bowled: 95,
        overs_faced: 98,
      },
      {
        id: 'o2',
        team: {
          id: '2',
          name: 'City Knights',
          code: 'CKN',
          logo: null,
          total_players: 14,
          is_active: true,
        },
        group: 'A',
        matches_played: 5,
        matches_won: 2,
        matches_lost: 3,
        abandoned: 0,
        tied: 0,
        points: 4,
        nrr: -0.45,
        runs_scored: 610,
        runs_conceded: 700,
        wickets_taken: 24,
        wickets_lost: 30,
        overs_bowled: 100,
        overs_faced: 92,
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useTournamentPlayerStats: (_id: string | null, params?: { ordering?: string }) => ({
    data: {
      count: 1,
      results:
        params?.ordering === '-total_wickets_taken'
          ? [
              {
                id: 'p2',
                user: { id: 'u2', full_name: 'Bowler Ace' },
                current_team: { id: '1', name: 'Royal Strikers', code: 'RST', logo: null },
                stats: { total_wickets_taken: 12, total_runs_conceded: 180, matches_played: 5 },
              },
            ]
          : [
              {
                id: 'p1',
                user: { id: 'u1', full_name: 'Star Batter' },
                current_team: { id: '1', name: 'Royal Strikers', code: 'RST', logo: null },
                stats: { total_runs_scored: 245, matches_played: 5 },
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

describe('PointsPage', () => {
  it('renders polished standings and statistics', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <PointsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Points Table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Royal Strikers/i })).toHaveAttribute(
      'href',
      '/dashboard/teams/1/roster'
    );
    expect(screen.getAllByText('City Knights').length).toBeGreaterThan(0);
    expect(screen.getByText('Pts')).toBeInTheDocument();
    expect(screen.getByText('NRR')).toBeInTheDocument();
    expect(screen.getAllByText('+1.234').length).toBeGreaterThan(0);
    expect(screen.getByText('Table leader')).toBeInTheDocument();
    expect(screen.getByText('Points race')).toBeInTheDocument();
    expect(screen.getByText('Runs for vs against')).toBeInTheDocument();
    expect(screen.getByText('Top run scorers')).toBeInTheDocument();
    expect(screen.getByText('Star Batter')).toBeInTheDocument();
    expect(screen.getByText('Bowler Ace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Group A' })).toBeInTheDocument();
  });
});
