import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentDetailPage from './TournamentDetailPage';

vi.mock('@/hooks/useTournaments', () => ({
  useTournament: () => ({
    data: {
      id: 't1',
      name: 'Summer League',
      logo: null,
      start: '2026-06-01T00:00:00Z',
      end: '2026-08-01T00:00:00Z',
      total_teams: 8,
      team_size: 11,
      is_active: true,
      opponents: [],
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/usePointsTable', () => ({
  usePointsTable: () => ({
    data: [
      {
        id: 'r1',
        team: {
          id: 'team1',
          name: 'Eagles',
          code: 'EAG',
          logo: null,
          total_players: 11,
          is_active: true,
        },
        group: null,
        matches_played: 4,
        matches_won: 3,
        matches_lost: 1,
        abandoned: 0,
        tied: 0,
        points: 6,
        nrr: 0.5,
        runs_scored: 400,
        runs_conceded: 350,
        wickets_taken: 20,
        wickets_lost: 15,
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useTournamentPlayerStats: (_id: string | null, params?: { ordering?: string }) => {
    const batter = {
      id: 'p1',
      user: { id: 'u1', full_name: 'Alex Batter' },
      current_team: {
        id: 'team1',
        name: 'Eagles',
        code: 'EAG',
        logo: null,
        total_players: 11,
        is_active: true,
      },
      stats: {
        matches_played: 4,
        total_runs_scored: 180,
        total_fours: 12,
        total_sixes: 5,
        batting_average: 45,
        best_strike_rate: 132.5,
        total_wickets_taken: 2,
        total_runs_conceded: 40,
      },
    };
    const bowler = {
      id: 'p2',
      user: { id: 'u2', full_name: 'Blake Bowler' },
      current_team: {
        id: 'team1',
        name: 'Eagles',
        code: 'EAG',
        logo: null,
        total_players: 11,
        is_active: true,
      },
      stats: {
        matches_played: 4,
        total_runs_scored: 40,
        total_fours: 3,
        total_sixes: 1,
        total_wickets_taken: 10,
        total_runs_conceded: 90,
        total_overs_bowled: 16,
        best_bowling_economy: 5.6,
      },
    };

    if (params?.ordering === '-total_wickets_taken') {
      return { data: { count: 1, results: [bowler] }, isLoading: false, isError: false };
    }
    return { data: { count: 1, results: [batter] }, isLoading: false, isError: false };
  },
}));

vi.mock('@/hooks/useFixtures', () => ({
  useFixtures: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 'm1',
          opponent_a: { id: 'oa', team_name: 'Eagles' },
          opponent_b: { id: 'ob', team_name: 'Hawks' },
          tournament: {
            id: 't1',
            name: 'Summer League',
            logo: null,
            start: '2026-06-01T00:00:00Z',
            total_teams: 8,
            is_active: true,
          },
          status: 'Ended',
          time: '2026-06-15T10:00:00Z',
          ground: 'Main Oval',
          round: 'Round 1',
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

function renderPage() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/dashboard/tournaments/t1/stats']}>
        <Routes>
          <Route path="/dashboard/tournaments/:id/stats" element={<TournamentDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TournamentDetailPage', () => {
  it('renders cricbuzz-style stats and switches tabs', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Summer League' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Most Runs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Most Wickets' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Most Runs' })).toBeInTheDocument();
    expect(screen.getByText('Alex Batter')).toBeInTheDocument();
    expect(screen.getByText('180')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Most Wickets' }));
    expect(screen.getByRole('heading', { name: 'Most Wickets' })).toBeInTheDocument();
    expect(screen.getByText('Blake Bowler')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Matches' }));
    expect(screen.getByText('Eagles vs Hawks')).toBeInTheDocument();
    expect(screen.getByText('Main Oval')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Table' }));
    expect(screen.getByText('Eagles')).toBeInTheDocument();
  });
});
