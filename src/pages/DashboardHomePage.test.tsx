import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardHomePage from './DashboardHomePage';

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    data: { teamCount: 3, playerCount: 40, tournamentCount: 2, liveAndUpcomingCount: 5 },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useFixtures', () => ({
  useUpcomingFixtures: () => ({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', full_name: 'Admin User', email: 'admin@email.com' },
    roles: ['Audience', 'Superuser'],
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
    tenants: [],
    loading: false,
    setActiveTenantId: vi.fn(),
    refreshTenants: vi.fn(),
  }),
}));

function renderPage() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DashboardHomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardHomePage', () => {
  it('shows real stat counts', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/CAM Youth/)).toBeInTheDocument();
  });

  it('shows the signed-in user and their role', () => {
    renderPage();
    expect(screen.getByText(/Signed in as Admin User/)).toBeInTheDocument();
    expect(screen.getByText('admin@email.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows the live and upcoming matches panel', () => {
    renderPage();
    expect(screen.getByText('Live & Upcoming Matches')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search team, tournament/i)).toBeInTheDocument();
  });
});
