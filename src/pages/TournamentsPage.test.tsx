import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TournamentsPage from './TournamentsPage';

vi.mock('@/hooks/useTournaments', () => ({
  useTournaments: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Summer League',
          logo: null,
          start: '2026-06-01T00:00:00Z',
          end: '2026-08-01T00:00:00Z',
          total_teams: 8,
          is_active: true,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateTournament: () => ({
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

describe('TournamentsPage', () => {
  it('renders tournament cards with view matches link', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <TournamentsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('link', { name: 'Summer League' })).toHaveAttribute(
      'href',
      '/dashboard/tournaments/1/stats'
    );
    expect(screen.getByRole('link', { name: 'View matches' })).toHaveAttribute(
      'href',
      '/dashboard/tournaments/1/stats?tab=matches'
    );
    expect(screen.getByText(/8 teams/)).toBeInTheDocument();
  });
});
