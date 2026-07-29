import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DebouncedSearchField } from './DebouncedSearchField';

describe('DebouncedSearchField', () => {
  it('centers the search icon and keeps the typed value', () => {
    const onChange = vi.fn();
    render(
      <DebouncedSearchField
        value="Warri"
        onChange={onChange}
        aria-label="Search players"
        placeholder="Search…"
      />
    );
    const input = screen.getByRole('searchbox', { name: 'Search players' });
    expect(input).toHaveValue('Warri');
    const icon = screen.getByTestId('search-field-icon');
    const iconClass = icon.getAttribute('class') ?? '';
    expect(iconClass).toMatch(/absolute/);
    expect(iconClass).toMatch(/top-1\/2/);
    expect(iconClass).toMatch(/-translate-y-1\/2/);
  });
});
