import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SponsorCorners } from './SponsorCorners';

describe('SponsorCorners', () => {
  it('renders the top-right logo when provided', () => {
    render(<SponsorCorners topRightImage="https://example.com/right.png" />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('renders nothing when no logo is provided', () => {
    const { container } = render(<SponsorCorners topRightImage={null} />);
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
