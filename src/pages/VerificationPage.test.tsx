import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VerificationPage from './VerificationPage';

vi.mock('@/hooks/useVerification', () => ({
  useTenantRegistrations: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 1,
          user_id: 'u1',
          user_email: 'player@example.com',
          user_name: 'Test Player',
          tenant: 1,
          tenant_name: 'CAM Youth',
          tenant_schema_name: 'cam_youth_association',
          is_paid: true,
          receipt: '/media/receipt.jpg',
          status: 'pending',
          rejection_reason: null,
          created: '2026-07-16T00:00:00Z',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useTeamJoinApplications: () => ({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  }),
  useReviewTenantRegistration: () => ({ mutate: vi.fn(), isPending: false }),
  useReviewTeamJoinApplication: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('VerificationPage', () => {
  it('renders tenant registration review table', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <VerificationPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Tenant registrations')).toBeInTheDocument();
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('player@example.com')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('opens the reject dialog with scroll-safe sizing so the Reject button stays reachable on short viewports', async () => {
    const user = userEvent.setup();
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <VerificationPage />
      </QueryClientProvider>
    );

    const [rowRejectButton] = screen.getAllByRole('button', { name: 'Reject' });
    await user.click(rowRejectButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('overflow-y-auto');
    expect(dialog.className).toContain('max-h-[min(90dvh,40rem)]');
    expect(within(dialog).getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('opens the receipt viewer with scroll-safe sizing', async () => {
    const user = userEvent.setup();
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <VerificationPage />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole('button', { name: 'View' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('overflow-y-auto');
    expect(screen.getByText('Open receipt')).toBeInTheDocument();
  });
});
