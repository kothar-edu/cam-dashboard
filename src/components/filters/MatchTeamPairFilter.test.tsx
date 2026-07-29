import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MatchTeamPairFilter } from './MatchTeamPairFilter';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('MatchTeamPairFilter', () => {
  it('swaps team slots and clears both', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <MatchTeamPairFilter
        value={{ teamId: 'a', opponentTeamId: 'b' }}
        onChange={onChange}
        teamOptions={options}
      />
    );
    await user.click(screen.getByRole('button', { name: /swap teams/i }));
    expect(onChange).toHaveBeenCalledWith({ teamId: 'b', opponentTeamId: 'a' });

    onChange.mockClear();
    rerender(
      <MatchTeamPairFilter
        value={{ teamId: 'b', opponentTeamId: 'a' }}
        onChange={onChange}
        teamOptions={options}
      />
    );
    await user.click(screen.getByRole('button', { name: /clear team filter/i }));
    expect(onChange).toHaveBeenCalledWith({ teamId: '', opponentTeamId: '' });
  });
});
