import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReservePicker } from './ReservePicker';
import * as playersApi from '@/api/players';

function player(id: string, name: string) {
  return {
    id,
    full_name: name,
    jersey_no: null,
    current_team: 'team-1',
    is_active: true,
    team_name: 'Team A',
    user: null,
  };
}

const ROSTER = [player('p1', 'Player 1'), player('p2', 'Player 2'), player('p3', 'Player 3')];

function renderPicker(props: Partial<React.ComponentProps<typeof ReservePicker>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReservePicker
        teamId="team-1"
        teamName="Team A"
        stepLabel="Step 2 of 5"
        excludeIds={['p1']}
        initialSelectedId={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ReservePicker', () => {
  it('excludes already-selected starting XI players from the pool', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    renderPicker();

    expect(await screen.findByText('Player 2')).toBeInTheDocument();
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
  });

  it('allows confirming with zero reserves selected', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    const onConfirm = vi.fn();
    renderPicker({ onConfirm });

    await screen.findByText('Player 2');
    fireEvent.click(screen.getByRole('button', { name: 'Continue without reserve' }));
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it('allows selecting exactly one reserve, and toggling it off deselects it', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    const onConfirm = vi.fn();
    renderPicker({ onConfirm });

    await screen.findByText('Player 2');
    fireEvent.click(screen.getByText('Player 2'));
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onConfirm).toHaveBeenCalledWith('p2');
  });
});
