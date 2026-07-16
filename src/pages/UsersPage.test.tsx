import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from './UsersPage';

vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 'u1',
          full_name: 'Anish Shrestha',
          email: 'anish@example.com',
          picture: null,
          roles: ['Player'],
          is_verified: true,
          is_email_verified: true,
          is_phone_verified: false,
          is_payment_verified: true,
          payment_status: 'verified',
          subscription_end_date: '2026-12-31',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('UsersPage', () => {
  it('renders global users table', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <UsersPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Anish Shrestha')).toBeInTheDocument();
    expect(screen.getByText('anish@example.com')).toBeInTheDocument();
    expect(screen.getByText('verified')).toBeInTheDocument();
  });
});
