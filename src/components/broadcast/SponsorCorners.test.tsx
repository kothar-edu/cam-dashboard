import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SponsorCorners } from './SponsorCorners';

describe('SponsorCorners', () => {
  it('renders only the images that are provided', () => {
    render(<SponsorCorners topLeftImage="https://example.com/left.png" topRightImage={null} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});
