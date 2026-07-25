import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TeamsPage from './TeamsPage';

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Royal Strikers',
          code: 'RST',
          logo: null,
          total_players: 15,
          is_active: true,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useSetTeamActive: () => ({
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

describe('TeamsPage', () => {
  it('renders team table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <TeamsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Abbreviation')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Royal Strikers')).toBeInTheDocument();
    expect(screen.getByText('RST')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
  });
});
