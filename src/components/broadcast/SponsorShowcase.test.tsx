import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SponsorShowcase } from './SponsorShowcase';
import type { BroadcastSponsor } from '@/types/liveMatch';

const sponsors: BroadcastSponsor[] = [
  { id: 's1', name: 'Acme Corp', imageUrl: 'https://example.com/title.png', level: 'Title' },
  { id: 's2', name: 'Widget Inc', imageUrl: null, level: 'Gold' },
];

afterEach(() => {
  vi.useRealTimers();
});

describe('SponsorShowcase', () => {
  it('renders nothing when there are no sponsors', () => {
    const { container } = render(<SponsorShowcase sponsors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the first sponsor with its logo and level badge', () => {
    render(<SponsorShowcase sponsors={sponsors} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText(/Title Sponsor/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Acme Corp' })).toHaveAttribute(
      'src',
      'https://example.com/title.png'
    );
  });

  it('falls back to name-only when a sponsor has no logo', () => {
    render(<SponsorShowcase sponsors={[sponsors[1]]} />);
    expect(screen.getByText('Widget Inc')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('rotates to the next sponsor on a timer', () => {
    vi.useFakeTimers();
    render(<SponsorShowcase sponsors={sponsors} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4501);
    });
    expect(screen.getByText('Widget Inc')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('does not rotate with only one sponsor', () => {
    vi.useFakeTimers();
    render(<SponsorShowcase sponsors={[sponsors[0]]} />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });
});
