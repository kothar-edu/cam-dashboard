import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test modal">
        <p>Modal body</p>
      </Modal>
    );
    expect(screen.getByText('Test modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Test modal">
        <p>Modal body</p>
      </Modal>
    );
    expect(screen.queryByText('Modal body')).not.toBeInTheDocument();
  });

  it('applies scroll-safe sizing so content never becomes unreachable on short viewports', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test modal">
        <p>Modal body</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('overflow-y-auto');
    expect(dialog.className).toContain('max-h-[min(90dvh,40rem)]');
  });

  it('calls onOpenChange(false) when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Test modal">
        <p>Modal body</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
