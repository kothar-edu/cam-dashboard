import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select dropdown viewport clamping', () => {
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 400,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: originalInnerHeight,
    });
  });

  it('keeps the options list within the viewport so all options can scroll into view', async () => {
    const user = userEvent.setup();
    const options = Array.from({ length: 12 }, (_, i) => ({
      value: String(i),
      label: `Tournament ${i + 1}`,
    }));

    render(
      <div style={{ position: 'fixed', top: 300, right: 20, width: 280 }}>
        <Select value="" onValueChange={vi.fn()}>
          <SelectTrigger>
            <SelectValue placeholder="Select tournament" />
          </SelectTrigger>
          <SelectContent searchable>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    await user.click(screen.getByRole('button', { name: /select tournament/i }));
    const listbox = screen.getByRole('listbox');
    const list = listbox.querySelector('.overflow-y-auto');

    expect(listbox).toBeInTheDocument();
    expect(list).toBeTruthy();

    const panelRect = listbox.getBoundingClientRect();
    expect(panelRect.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    expect(panelRect.top).toBeGreaterThanOrEqual(-1);

    // Last option exists in the DOM (reachable via scroll) even when near viewport bottom.
    expect(screen.getByRole('option', { name: 'Tournament 12' })).toBeInTheDocument();
    expect(Number.parseFloat(getComputedStyle(listbox).maxHeight)).toBeLessThanOrEqual(
      window.innerHeight
    );
  });
});
