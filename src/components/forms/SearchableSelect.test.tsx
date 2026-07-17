import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from './SearchableSelect';

describe('SearchableSelect', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
  ];

  it('renders label and trigger with placeholder', () => {
    render(
      <SearchableSelect
        label="Team"
        value=""
        onChange={vi.fn()}
        options={options}
        placeholder="Select team"
      />
    );

    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select team/i })).toBeInTheDocument();
  });

  it('opens custom dropdown and selects an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchableSelect
        label="Team"
        value=""
        onChange={onChange}
        options={options}
        placeholder="Select team"
        searchable={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /select team/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('enables search for long option lists', async () => {
    const user = userEvent.setup();

    render(
      <SearchableSelect
        label="Tenant"
        value=""
        onChange={vi.fn()}
        options={Array.from({ length: 6 }, (_, i) => ({
          value: String(i),
          label: `Tenant ${i}`,
        }))}
        placeholder="Select tenant"
      />
    );

    await user.click(screen.getByRole('button', { name: /select tenant/i }));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
