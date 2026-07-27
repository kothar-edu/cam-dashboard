import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamLogoBadge } from './TeamLogoBadge';

describe('TeamLogoBadge', () => {
  it('shows batting label and team code fallback when logo is missing', () => {
    render(
      <TeamLogoBadge
        side="batting"
        team={{
          id: '1',
          name: 'Rising CC',
          code: 'TRC',
          logo: null,
          players: [],
          stats: {} as any,
        }}
      />
    );

    expect(screen.getByTestId('team-logo-batting')).toBeInTheDocument();
    expect(screen.getByText('Batting')).toBeInTheDocument();
    expect(screen.getByText('TRC')).toBeInTheDocument();
  });

  it('renders bowling team logo image when present', () => {
    render(
      <TeamLogoBadge
        side="bowling"
        team={{
          id: '2',
          name: 'Lumbini',
          code: 'LCC',
          logo: 'https://example.com/logo.png',
          players: [],
          stats: {} as any,
        }}
      />
    );

    expect(screen.getByTestId('team-logo-bowling')).toBeInTheDocument();
    expect(screen.getByAltText('Lumbini logo')).toHaveAttribute(
      'src',
      'https://example.com/logo.png'
    );
  });
});
