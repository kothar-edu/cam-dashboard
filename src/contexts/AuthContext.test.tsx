import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('@/api/auth', () => ({
  login: vi.fn().mockResolvedValue({
    access: 'a',
    refresh: 'r',
    roles: ['staff'],
    tenant_admin_schemas: [],
  }),
  fetchMyProfile: vi.fn().mockResolvedValue({
    id: '1',
    email: 'a@b.com',
    full_name: 'A',
    is_staff: true,
    is_superuser: false,
  }),
}));

function Probe() {
  const { isAuthenticated, user } = useAuth();
  return <div>{isAuthenticated ? user?.email : 'logged-out'}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());

  it('exposes login and isAuthenticated', async () => {
    localStorage.setItem('cam_dashboard_access', 'token');
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('a@b.com')).toBeInTheDocument());
  });
});
