import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'admin@example.com',
      full_name: 'Admin',
      is_staff: true,
      is_superuser: true,
    },
    canManageTenants: true,
    tenantAdminSchemas: ['cam_youth_association'],
    roles: ['staff'],
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
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

vi.mock('@/hooks/useSettings', () => ({
  useChangePassword: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

vi.mock('@/hooks/useCreateAdmin', () => ({
  useCreateAdminUser: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

vi.mock('@/hooks/useCountries', () => ({
  useCountries: () => ({ data: [{ id: 1, name: 'Australia', code: 'AU' }] }),
}));

vi.mock('@/hooks/useRoles', () => ({
  useRoles: () => ({ data: [{ id: 1, name: 'Admin' }] }),
}));

vi.mock('@/hooks/useGameConfig', () => ({
  useGameConfig: () => ({
    data: {
      is_registration_open: true,
      is_voting_open: false,
      four_boundary_label: '',
      six_boundary_label: '',
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateGameConfig: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/usePosts', () => ({
  usePosts: () => ({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  }),
  useDeletePost: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useSponsors', () => ({
  useSponsors: () => ({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  }),
  useDeleteSponsor: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/usePaymentSettings', () => ({
  useTenantPaymentSettings: () => ({
    data: {
      bank_account_name: 'CAM',
      bank_account_number: '123',
      bank_name: 'Bank',
      bank_branch: 'Main',
      verification_fee_amount: '50',
      require_payment_verification: true,
      require_id_verification: false,
      student_fee_enabled: false,
      student_fee_amount: null,
    },
    isLoading: false,
    isError: false,
  }),
  useUpdateTenantPaymentSettings: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderSettings(initialEntry = '/dashboard/settings') {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SettingsPage', () => {
  it('renders unified settings navigation with app settings by default', () => {
    renderSettings();

    expect(screen.getByText('Settings')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Settings sections' });
    expect(nav).toHaveTextContent('App settings');
    expect(nav).toHaveTextContent('Registration settings');
    expect(nav).toHaveTextContent('Account');
    expect(nav).toHaveTextContent('Create admin');
    expect(screen.getByRole('tab', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByText('Registration open')).toBeInTheDocument();
  });

  it('shows app settings toggles when selected', () => {
    renderSettings('/dashboard/settings?section=app');
    expect(screen.getByRole('tab', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Posts' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sponsors' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Boundary labels' })).toBeInTheDocument();
    expect(screen.getByText('Registration open')).toBeInTheDocument();
    expect(screen.getByText('Voting open')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save app settings' })).toBeInTheDocument();
  });

  it('opens posts tab from app settings query', () => {
    renderSettings('/dashboard/settings?section=app&tab=posts');
    expect(screen.getAllByRole('link', { name: /New post/i }).length).toBeGreaterThan(0);
  });

  it('shows registration settings when selected', () => {
    renderSettings('/dashboard/settings?section=registration');
    expect(screen.getByText('Account name')).toBeInTheDocument();
    expect(screen.getByText('Require payment verification')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save registration settings' })).toBeInTheDocument();
  });

  it('shows create-admin document fields', () => {
    renderSettings('/dashboard/settings?section=create-admin');
    expect(screen.getByText('ID card (optional)')).toBeInTheDocument();
    expect(screen.getByText('Payslip (optional)')).toBeInTheDocument();
  });
});
