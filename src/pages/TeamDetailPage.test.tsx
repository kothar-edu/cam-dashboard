import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TeamDetailPage from './TeamDetailPage';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/hooks/useTeams', () => ({
  useTeam: () => ({
    data: {
      id: 'team-1',
      name: 'Royal Strikers',
      code: 'RST',
      logo: null,
      total_players: 12,
      is_active: true,
      maintainer: {
        id: 'user-1',
        email: 'maintainer@example.com',
        full_name: 'Alex Maintainer',
      },
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateTeam: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/usePaymentSettings', () => ({
  useTeamPaymentSettings: () => ({ data: undefined, isLoading: false }),
  useUpdateTeamPaymentSettings: () => ({ mutate: vi.fn(), isPending: false }),
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

describe('TeamDetailPage', () => {
  it('shows the current maintainer on the edit form', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/dashboard/teams/team-1']}>
          <Routes>
            <Route path="/dashboard/teams/:id" element={<TeamDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Current maintainer:/)).toBeInTheDocument();
    expect(screen.getByText(/Alex Maintainer \(maintainer@example.com\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reassign maintainer' })).toBeInTheDocument();
  });
});
