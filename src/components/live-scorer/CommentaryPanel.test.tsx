import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentaryPanel } from './CommentaryPanel';

describe('CommentaryPanel', () => {
  it('sends typed commentary and clears the textarea', () => {
    const broadcastCommentary = vi.fn();
    render(<CommentaryPanel broadcastCommentary={broadcastCommentary} disabled={false} />);

    const textarea = screen.getByPlaceholderText('Add commentary');
    fireEvent.change(textarea, { target: { value: 'What a shot!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Commentary' }));

    expect(broadcastCommentary).toHaveBeenCalledWith('What a shot!');
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('disables the submit button while empty or disconnected', () => {
    render(<CommentaryPanel broadcastCommentary={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: 'Add Commentary' })).toBeDisabled();
  });
});
