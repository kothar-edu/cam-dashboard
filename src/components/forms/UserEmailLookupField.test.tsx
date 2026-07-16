import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
