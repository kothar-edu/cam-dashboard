import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';

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

describe('SettingsPage', () => {
  it('renders password and create-admin tabs', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create admin' })).toBeInTheDocument();
    expect(screen.getByText('Current password')).toBeInTheDocument();
  });
});
