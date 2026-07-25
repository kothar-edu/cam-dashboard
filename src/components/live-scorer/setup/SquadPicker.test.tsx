import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SquadPicker } from './SquadPicker';
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

const ROSTER = Array.from({ length: 12 }, (_, i) => player(`p${i + 1}`, `Player ${i + 1}`));

function renderPicker(props: Partial<React.ComponentProps<typeof SquadPicker>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SquadPicker
        teamId="team-1"
        teamName="Team A"
        stepLabel="Step 1 of 5"
        initialSelectedIds={[]}
        onConfirm={vi.fn()}
        {...props}
      />
    </QueryClientProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SquadPicker', () => {
  it('disables Continue until exactly 11 players are selected', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    renderPicker();

    expect(await screen.findByText('Player 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    for (let i = 1; i <= 11; i++) {
      fireEvent.click(screen.getByText(`Player ${i}`));
    }
    expect(screen.getByText('11/11')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('calls onConfirm with the selected player ids', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    const onConfirm = vi.fn();
    renderPicker({ onConfirm });

    await screen.findByText('Player 1');
    for (let i = 1; i <= 11; i++) {
      fireEvent.click(screen.getByText(`Player ${i}`));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onConfirm).toHaveBeenCalledWith(ROSTER.slice(0, 11).map((p) => p.id));
  });

  it('filters the roster by search text', async () => {
    vi.spyOn(playersApi, 'listPlayers').mockResolvedValue({
      count: ROSTER.length,
      results: ROSTER,
    });
    renderPicker();

    await screen.findByText('Player 1');
    fireEvent.change(screen.getByPlaceholderText('Search players…'), {
      target: { value: 'Player 2' },
    });

    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
  });
});
