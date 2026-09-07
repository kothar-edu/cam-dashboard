import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const profile = {
  id: '1',
  email: 'a@b.com',
  full_name: 'A',
  is_staff: true,
  is_superuser: false,
};

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  fetchMyProfile: vi.fn(() => Promise.resolve(profile)),
}));

function Probe() {
  const { canManageTenants, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{canManageTenants ? 'can-manage' : 'cannot-manage'}</div>;
}

function renderProbe() {
  localStorage.setItem('cam_dashboard_access', 'token');
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

describe('canManageTenants', () => {
  beforeEach(() => {
    localStorage.clear();
    profile.is_superuser = false;
  });

  it('is false for a staff account that is not a superuser', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByText('cannot-manage')).toBeInTheDocument());
  });

  it('is true for a superuser', async () => {
    profile.is_superuser = true;
    renderProbe();
    await waitFor(() => expect(screen.getByText('can-manage')).toBeInTheDocument());
  });
});
