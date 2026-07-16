import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SettingsPage from './SettingsPage';

vi.mock('@/hooks/useSettings', () => ({
  useChangePassword: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

describe('SettingsPage', () => {
  it('renders change password form', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <SettingsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Change password')).toBeInTheDocument();
    expect(screen.getByText('Current password')).toBeInTheDocument();
    expect(screen.getByText('New password')).toBeInTheDocument();
    expect(screen.getByText('Update password')).toBeInTheDocument();
  });
});
