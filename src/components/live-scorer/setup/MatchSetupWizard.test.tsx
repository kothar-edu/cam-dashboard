import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MatchSetupWizard } from './MatchSetupWizard';
import * as playersApi from '@/api/players';
import * as fixturesApi from '@/api/fixtures';
import type { FixtureDetail } from '@/api/fixtures';

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ activeTenantId: 'tenant-1', activeTenant: { id: 'tenant-1', schema_name: 'tenant-1', name: 'Tenant' } }),
}));

function player(id: string, name: string, team: string) {
  return { id, full_name: name, jersey_no: null, current_team: team, is_active: true, team_name: team, user: null };
}

// 12 players per team so a reserve can be picked from whoever's left after the XI.
const ROSTER_A = Array.from({ length: 12 }, (_, i) => player(`a${i + 1}`, `A Player ${i + 1}`, 'team-a'));
const ROSTER_B = Array.from({ length: 12 }, (_, i) => player(`b${i + 1}`, `B Player ${i + 1}`, 'team-b'));

const FIXTURE = {
  id: 'match-1',
  opponent_a: { id: 'opp-a', team: { id: 'team-a', name: 'Team Alpha', code: 'ALP', logo: null } },
  opponent_b: { id: 'opp-b', team: { id: 'team-b', name: 'Team Beta', code: 'BET', logo: null } },
  status: 'Upcoming',
  time: '2026-01-01T00:00:00Z',
  ground: null,
  round: null,
  result: null,
} as unknown as FixtureDetail;

function renderWizard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MatchSetupWizard fixture={FIXTURE} />
    </QueryClientProvider>,
  );
}

async function selectPlayers(players: ReturnType<typeof player>[]) {
  await screen.findByText(players[0].full_name);
  for (const p of players) {
    fireEvent.click(screen.getByText(p.full_name));
  }
}

function mockRosterByTeam() {
  return vi.spyOn(playersApi, 'listPlayers').mockImplementation(async (params) => {
    const results = params?.current_team === 'team-a' ? ROSTER_A : ROSTER_B;
    return { count: results.length, results };
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MatchSetupWizard', () => {
  it('walks through both squads, both reserves skipped, and starts the match with the right payload', async () => {
    mockRosterByTeam();
    const startSpy = vi.spyOn(fixturesApi, 'startMatch').mockResolvedValue({ detail: 'started' });

    renderWizard();

    // Step 1: Team A XI
    expect(await screen.findByText('Team Alpha — Starting XI')).toBeInTheDocument();
    await selectPlayers(ROSTER_A.slice(0, 11));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 2: Team A reserve — skip
    expect(await screen.findByText('Team Alpha — Reserve (12th Man)')).toBeInTheDocument();
    expect(screen.queryByText('A Player 1')).not.toBeInTheDocument(); // already in the XI, excluded
    fireEvent.click(screen.getByRole('button', { name: 'Continue without reserve' }));

    // Step 3: Team B XI
    expect(await screen.findByText('Team Beta — Starting XI')).toBeInTheDocument();
    await selectPlayers(ROSTER_B.slice(0, 11));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 4: Team B reserve — skip
    expect(await screen.findByText('Team Beta — Reserve (12th Man)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue without reserve' }));

    // Step 5: Review
    expect(await screen.findByText('Review & Start Match')).toBeInTheDocument();
    expect((await screen.findAllByText('A Player 1')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('B Player 1')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));

    await waitFor(() =>
      expect(startSpy).toHaveBeenCalledWith('match-1', {
        opponent_a: { players: ROSTER_A.slice(0, 11).map((p) => p.id), reserves: [] },
        opponent_b: { players: ROSTER_B.slice(0, 11).map((p) => p.id), reserves: [] },
      }),
    );
  });

  it('lets the user pick a reserve and includes it in the start payload', async () => {
    mockRosterByTeam();
    const startSpy = vi.spyOn(fixturesApi, 'startMatch').mockResolvedValue({ detail: 'started' });

    renderWizard();

    await screen.findByText('Team Alpha — Starting XI');
    await selectPlayers(ROSTER_A.slice(0, 11));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText('Team Alpha — Reserve (12th Man)');
    fireEvent.click(await screen.findByText('A Player 12'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText('Team Beta — Starting XI');
    await selectPlayers(ROSTER_B.slice(0, 11));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText('Team Beta — Reserve (12th Man)');
    fireEvent.click(screen.getByRole('button', { name: 'Continue without reserve' }));

    await screen.findByText('Review & Start Match');
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));

    await waitFor(() =>
      expect(startSpy).toHaveBeenCalledWith('match-1', {
        opponent_a: { players: ROSTER_A.slice(0, 11).map((p) => p.id), reserves: ['a12'] },
        opponent_b: { players: ROSTER_B.slice(0, 11).map((p) => p.id), reserves: [] },
      }),
    );
  });

  it('lets the user go back a step and change the previous selection', async () => {
    mockRosterByTeam();
    renderWizard();

    await screen.findByText('Team Alpha — Starting XI');
    await selectPlayers(ROSTER_A.slice(0, 11));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText('Team Alpha — Reserve (12th Man)');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Team Alpha — Starting XI')).toBeInTheDocument();
    expect(screen.getByText('11/11')).toBeInTheDocument();
  });
});
