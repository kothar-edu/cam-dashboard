import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PointsPage from './PointsPage';

vi.mock('@/hooks/useTournaments', () => ({
  useTournaments: () => ({
    data: {
      count: 1,
      results: [{ id: 't1', name: 'Summer League', logo: null, start: '2026-06-01', total_teams: 8 }],
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePointsTable', () => ({
  usePointsTable: () => ({
    data: [
      {
        id: 'o1',
        team: { id: '1', name: 'Royal Strikers', code: 'RST', logo: null, total_players: 15 },
        group: 'A',
        matches_played: 5,
        matches_won: 4,
        matches_lost: 1,
        abandoned: 0,
        tied: 0,
        points: 8,
        nrr: 1.234,
      },
    ],
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

describe('PointsPage', () => {
  it('renders points table headers and standings row', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PointsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Played')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('NRR')).toBeInTheDocument();
    expect(screen.getByText('Royal Strikers')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
