import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from './AuthContext';
import { TenantProvider, useTenant } from './TenantContext';

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  fetchMyProfile: vi.fn().mockResolvedValue({
    id: '1',
    email: 'a@b.com',
    full_name: 'A',
    is_staff: true,
    is_superuser: false,
  }),
}));

vi.mock('@/api/tenants', () => ({
  listAccessibleTenants: vi.fn().mockResolvedValue([
    { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    { id: 2, name: 'Other League', schema_name: 'other_league', is_active: true },
  ]),
}));

function TenantProbe() {
  const { tenants, activeTenantId } = useTenant();
  return (
    <div>
      <span data-testid="count">{tenants.length}</span>
      <span data-testid="active">{activeTenantId ?? 'none'}</span>
    </div>
  );
}

describe('TenantContext', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cam_dashboard_access', 'token');
  });

  it('loads accessible tenants when authenticated', async () => {
    render(
      <AuthProvider>
        <TenantProvider>
          <TenantProbe />
        </TenantProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
  });

  it('clears stale stored tenant if not in accessible list', async () => {
    localStorage.setItem('cam_dashboard_tenant', 'stale_tenant');
    render(
      <AuthProvider>
        <TenantProvider>
          <TenantProbe />
        </TenantProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('none'));
    expect(localStorage.getItem('cam_dashboard_tenant')).toBeNull();
  });
});
