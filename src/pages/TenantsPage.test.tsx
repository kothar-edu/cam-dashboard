import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TenantsPage from './TenantsPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    canManageTenants: true,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    tenants: [{ id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true }],
    activeTenant: {
      id: 1,
      name: 'CAM Youth',
      schema_name: 'cam_youth_association',
      is_active: true,
    },
    loading: false,
  }),
}));

vi.mock('@/hooks/useTenantAdmin', () => ({
  useAccessibleTenantsPaged: () => ({
    data: {
      count: 1,
      results: [
        { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useTenantMemberships: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 10,
          user: 'u1',
          user_email: 'admin@example.com',
          tenant: 1,
          tenant_name: 'CAM Youth',
          role: 'tenant_admin',
          created: '2026-07-16T00:00:00Z',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useCreateTenant: () => ({ mutate: vi.fn(), isPending: false, isError: false, isSuccess: false }),
  useAssignTenantAdmin: () => ({ mutate: vi.fn(), isPending: false }),
  useRevokeTenantAdmin: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/components/forms/UserEmailLookupField', () => ({
  UserEmailLookupField: () => <div>Email lookup</div>,
}));

describe('TenantsPage', () => {
  it('renders tenant management for superusers', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <TenantsPage />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Tenants' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New organization/i })).toBeInTheDocument();
    expect(screen.getAllByText('CAM Youth').length).toBeGreaterThan(0);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Assign tenant admin/i })).toBeInTheDocument();
  });
});
