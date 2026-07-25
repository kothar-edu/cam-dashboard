import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchSettingsDialog } from './MatchSettingsDialog';

describe('MatchSettingsDialog', () => {
  it('submits target/over-limit/bowling-limit/DLS when confirmed', () => {
    const onSubmit = vi.fn();
    render(<MatchSettingsDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('New target'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('New over limit'), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText('New bowling limit'), { target: { value: '4' } });
    fireEvent.click(screen.getByLabelText('DLS'));
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));

    expect(onSubmit).toHaveBeenCalledWith({
      target: 150,
      max_overs: 16,
      bowling_limit: 4,
      DLS: true,
    });
  });
});
