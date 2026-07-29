import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamRosterPage from './TeamRosterPage';

vi.mock('@/hooks/useTeams', () => ({
  useTeam: () => ({
    data: {
      id: 'team-1',
      name: 'Royal Strikers',
      code: 'RST',
      logo: null,
      total_players: 2,
      is_active: true,
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/useTeamRoster', () => ({
  useTeamRoster: () => ({
    data: [
      {
        id: 'p1',
        full_name: 'Alex Batter',
        jersey_no: 7,
        current_team: 'team-1',
        is_active: true,
        team_name: 'Royal Strikers',
        role: 'Batsman',
        user: { id: 'u1', full_name: 'Alex Batter', email: 'alex@example.com' },
      },
      {
        id: 'p2',
        full_name: 'Blake Bowler',
        jersey_no: 11,
        current_team: 'team-1',
        is_active: true,
        team_name: 'Royal Strikers',
        user: { id: 'u2', full_name: 'Blake Bowler', email: 'blake@example.com' },
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({
    data: {
      count: 2,
      results: [
        {
          id: 'u1',
          full_name: 'Alex Batter',
          email: 'alex@example.com',
          picture: 'https://example.com/alex.jpg',
          roles: [],
          is_verified: true,
          is_email_verified: true,
          is_phone_verified: false,
          is_payment_verified: true,
          payment_status: 'verified',
          subscription_end_date: null,
        },
        {
          id: 'u2',
          full_name: 'Blake Bowler',
          email: 'blake@example.com',
          picture: null,
          roles: [],
          is_verified: false,
          is_email_verified: false,
          is_phone_verified: false,
          is_payment_verified: false,
          payment_status: 'pending',
          subscription_end_date: null,
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
      <MemoryRouter initialEntries={['/dashboard/teams/team-1/roster']}>
        <Routes>
          <Route path="/dashboard/teams/:id/roster" element={<TeamRosterPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TeamRosterPage', () => {
  it('renders player cards with verification tags and filters by search', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Royal Strikers' })).toBeInTheDocument();
    expect(screen.getByText('Alex Batter')).toBeInTheDocument();
    expect(screen.getByText('Blake Bowler')).toBeInTheDocument();
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Payment done').length).toBeGreaterThan(0);
    expect(screen.getByText('Payment pending')).toBeInTheDocument();
    expect(screen.getByText('#7')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Alex Batter' })).toHaveAttribute(
      'src',
      'https://example.com/alex.jpg'
    );

    await user.type(screen.getByPlaceholderText(/Search by name/i), 'Blake');
    expect(screen.queryByText('Alex Batter')).not.toBeInTheDocument();
    expect(screen.getByText('Blake Bowler')).toBeInTheDocument();
  });
});
