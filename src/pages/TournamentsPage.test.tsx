import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
          total_teams: 8,
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

describe('TournamentsPage', () => {
  it('renders tournament table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <TournamentsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Start date')).toBeInTheDocument();
    expect(screen.getByText('Summer League')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
