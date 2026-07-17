import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { describe, it, expect, vi } from 'vitest';
import { UserEmailLookupField } from './UserEmailLookupField';

const mutate = vi.fn();

vi.mock('@/hooks/useUserLookup', () => ({
  useLookupUserByEmailMutation: () => ({
    mutate,
    isPending: false,
  }),
}));

describe('UserEmailLookupField', () => {
  it('looks up a user by email', async () => {
    const user = userEvent.setup();
    const onResolved = vi.fn();

    render(<UserEmailLookupField onResolved={onResolved} />);

    await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: 'Look up' }));

    expect(mutate).toHaveBeenCalled();
  });

  it('surfaces permission errors from lookup failures', async () => {
    const forbidden = new AxiosError('Forbidden');
    forbidden.response = {
      status: 403,
      data: {},
      headers: {},
      statusText: 'Forbidden',
      config: { headers: new AxiosHeaders() },
    };
    mutate.mockImplementation((_email, handlers) => {
      handlers.onError(forbidden);
    });
    const user = userEvent.setup();

    render(<UserEmailLookupField onResolved={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@example.com');
    await user.click(screen.getByRole('button', { name: 'Look up' }));

    expect(
      screen.getByText('You do not have permission to look up users.')
    ).toBeInTheDocument();
  });
});
