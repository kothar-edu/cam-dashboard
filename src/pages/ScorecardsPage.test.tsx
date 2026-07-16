import { render, screen } from '@testing-library/react';
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
          opponent_a: { id: 'a', team_name: 'Team Alpha' },
          opponent_b: { id: 'b', team_name: 'Team Beta' },
          tournament: { id: 't1', name: 'Summer League', logo: null, start: '2026-06-01', total_teams: 8 },
          status: 'Ended',
          time: '2026-07-10T10:00:00Z',
          ground: 'Main Ground',
          round: 'Final',
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

describe('ScorecardsPage', () => {
  it('renders scorecard table headers and completed match row', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ScorecardsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Match')).toBeInTheDocument();
    expect(screen.getByText('Tournament')).toBeInTheDocument();
    expect(screen.getByText('Venue')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha vs Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Main Ground')).toBeInTheDocument();
  });
});
