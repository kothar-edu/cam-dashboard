import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DebouncedSearchField } from './DebouncedSearchField';

describe('DebouncedSearchField', () => {
  it('keeps the search icon inside the field and preserves typed value', () => {
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
    expect(iconClass).not.toMatch(/absolute/);
    expect(iconClass).toMatch(/h-4/);
    expect(iconClass).toMatch(/w-4/);
    expect(icon.parentElement?.className ?? '').toMatch(/items-center/);
  });
});
