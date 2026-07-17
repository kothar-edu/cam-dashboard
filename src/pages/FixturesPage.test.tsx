import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import FixturesPage from './FixturesPage';

vi.mock('@/hooks/useFixtures', () => ({
  useFixtures: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          opponent_a: { id: 'a', team_name: 'Team Alpha' },
          opponent_b: { id: 'b', team_name: 'Team Beta' },
          tournament: { id: 't1', name: 'Summer League', logo: null, start: '2026-06-01', total_teams: 8 },
          status: 'Upcoming',
          time: '2026-07-20T10:00:00Z',
          ground: 'Main Ground',
          round: 'Group A',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateFixture: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('FixturesPage', () => {
  it('renders fixture table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <FixturesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('Tournament')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha vs Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Summer League')).toBeInTheDocument();
  });
});
