import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardHomePage from './DashboardHomePage';

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    data: { teamCount: 3, playerCount: 40, tournamentCount: 2, upcomingFixtures: [] },
    isLoading: false,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
    tenants: [],
    loading: false,
    setActiveTenantId: vi.fn(),
    refreshTenants: vi.fn(),
  }),
}));

describe('DashboardHomePage', () => {
  it('shows real stat counts', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <DashboardHomePage />
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/CAM Youth/)).toBeInTheDocument();
  });
});
