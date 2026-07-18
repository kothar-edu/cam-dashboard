import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserFormPage from './UserFormPage';

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: {
      id: 'user-1',
      full_name: 'Original Name',
      email: 'user@example.com',
      phone: '9800000000',
      gender: 'f',
      roles: ['Player'],
      payment_status: 'verified',
      subscription_end_date: '2026-09-11',
      is_payment_verified: true,
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/hooks/useUpdateUser', () => ({
  useUpdateUser: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}));

vi.mock('@/hooks/useRoles', () => ({
  useRoles: () => ({
    data: [
      { id: 1, name: 'Audience' },
      { id: 2, name: 'Player' },
      { id: 3, name: 'Team Maintainer' },
      { id: 4, name: 'Admin' },
      { id: 5, name: 'Superuser' },
    ],
  }),
}));

describe('UserFormPage', () => {
  it('prefills fields from the fetched user and hides privileged roles', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/users/user-1']}>
        <Routes>
          <Route path="/dashboard/users/:id" element={<UserFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Edit user' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('9800000000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-09-11')).toBeInTheDocument();

    const playerCheckbox = screen.getByRole('checkbox', { name: 'Player' });
    expect(playerCheckbox).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Audience' })).not.toBeChecked();

    expect(screen.queryByRole('checkbox', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Superuser' })).not.toBeInTheDocument();
  });
});
