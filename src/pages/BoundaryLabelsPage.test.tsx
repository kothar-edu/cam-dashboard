import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BoundaryLabelsPage from './BoundaryLabelsPage';

vi.mock('@/hooks/useGameConfig', () => ({
  useGameConfig: () => ({
    data: {
      is_voting_open: false,
      is_registration_open: true,
      four_boundary_label: 'Four runs!',
      six_boundary_label: 'Six maximum!',
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateGameConfig: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('BoundaryLabelsPage', () => {
  it('renders boundary label form with loaded values', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <BoundaryLabelsPage />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Four boundary label')).toHaveValue('Four runs!');
    expect(screen.getByLabelText('Six boundary label')).toHaveValue('Six maximum!');
    expect(screen.getByRole('button', { name: 'Save labels' })).toBeInTheDocument();
  });
});
