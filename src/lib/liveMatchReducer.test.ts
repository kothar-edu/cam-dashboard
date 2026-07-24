import { describe, it, expect } from 'vitest';
import { createInitialLiveMatchState, liveMatchReducer } from './liveMatchReducer';
import type { IncomingLiveScoreMessage, ScoreEvent } from '@/types/liveMatch';

function scoreEvent(overrides: Partial<ScoreEvent> = {}): ScoreEvent {
  return {
    striker: 'p-striker',
    bowler: 'p-bowler',
    value: 1,
    extras: 0,
    runs: 1,
    dismissed: null,
    fielder: null,
    is_bat_involved: true,
    commentary: '',
    ...overrides,
  };
}

describe('liveMatchReducer', () => {
  it('starts with a zeroed current state and empty score history', () => {
    const state = createInitialLiveMatchState();
    expect(state.current.runs).toBe(0);
    expect(state.current.wickets).toBe(0);
    expect(state.scoreHistory).toEqual([]);
  });

  it('applies a SCORE message: updates current, appends to this over, sets lastEvent', () => {
    const state = createInitialLiveMatchState();
    const message: IncomingLiveScoreMessage = {
      event_type: 'SCORE',
      detail: {
        current: {
          over: 0,
          ball: 1,
          inning: 1,
          runs: 4,
          wickets: 0,
          target: 0,
          crr: 24,
          balls_remaining: 119,
          required_runs: 0,
          rrr: 0,
          status: 'IN_PROGRESS',
          projected: 0,
        },
        game: {
          this_over: [scoreEvent({ value: 4, runs: 4 })],
          current_players: {
            bowler: null,
            wicket_keeper: null,
            striker: null,
            non_striker: null,
          },
        },
      },
    };

    const next = liveMatchReducer(state, message);

    expect(next.current.runs).toBe(4);
    expect(next.scoreHistory).toEqual([[scoreEvent({ value: 4, runs: 4 })]]);
    expect(next.lastEvent).toEqual({ kind: 'SCORE', value: 4 });
    expect(next).not.toBe(state);
  });

  it('does not mutate the input state object', () => {
    const state = createInitialLiveMatchState();
    const frozen = JSON.stringify(state);

    liveMatchReducer(state, {
      event_type: 'LIVE',
      detail: {
        viewers: 5,
        current: { ...state.current, runs: 10 },
        game: {
          this_over: [],
          current_players: { bowler: null, wicket_keeper: null, striker: null, non_striker: null },
        },
      },
    });

    expect(JSON.stringify(state)).toBe(frozen);
  });

  it('preserves currentPlayers on a LIVE viewer-count ping whose game object is empty', () => {
    const striker = {
      id: 's1',
      full_name: 'Striker One',
      picture: null,
      reserve: false,
      stats: {
        runs_scored: 16, balls_faced: 9, fours: 2, sixes: 0, is_out: false, crr: 0, srr: 0,
        runs_conceded: 0, overs_bowled: 0, wickets_taken: 0, wickets_lost: 0, maidens: 0, err: 0,
      },
    };
    let state = createInitialLiveMatchState();
    state = liveMatchReducer(state, {
      event_type: 'SUMMARY',
      detail: {
        current: state.current,
        score_history: [],
        opponents: {},
        game: { this_over: [], current_players: { bowler: null, wicket_keeper: null, striker, non_striker: null } },
      },
    });
    expect(state.currentPlayers.striker).toEqual(striker);

    // Real backend behavior (apps/livescore/utils/game_play.py's update_viewers,
    // extra_summary=False): LIVE is a periodic viewer-count ping whose `game`
    // is `{}` on the wire - no `current_players` key at all.
    const next = liveMatchReducer(state, {
      event_type: 'LIVE',
      detail: { viewers: 3, current: state.current, game: {} },
    });

    expect(next.currentPlayers.striker).toEqual(striker);
    expect(next.viewers).toBe(3);
  });
});

describe('derived broadcast stats', () => {
  const baseCurrent = {
    over: 0,
    ball: 0,
    inning: 1,
    runs: 0,
    wickets: 0,
    target: 0,
    crr: 0,
    balls_remaining: 120,
    required_runs: 0,
    rrr: 0,
    status: 'IN_PROGRESS',
    projected: 0,
  };

  function withPlayers(overrides: Partial<Record<'striker' | 'non_striker' | 'bowler', any>> = {}) {
    return {
      bowler: overrides.bowler ?? { id: 'b1', full_name: 'Bowler', picture: null, reserve: false, stats: zeroStats() },
      wicket_keeper: null,
      striker: overrides.striker ?? { id: 's1', full_name: 'Striker', picture: null, reserve: false, stats: zeroStats() },
      non_striker: overrides.non_striker ?? { id: 's2', full_name: 'Non-Striker', picture: null, reserve: false, stats: zeroStats() },
    };
  }

  function zeroStats() {
    return {
      runs_scored: 0,
      balls_faced: 0,
      fours: 0,
      sixes: 0,
      is_out: false,
      crr: 0,
      srr: 0,
      runs_conceded: 0,
      overs_bowled: 0,
      wickets_taken: 0,
      wickets_lost: 0,
      maidens: 0,
      err: 0,
    };
  }

  it('accumulates extras by category', () => {
    let state = createInitialLiveMatchState();
    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 1 },
        game: { this_over: [scoreEvent({ value: 'WIDE_BALL', extras: 1, runs: 0 })], current_players: withPlayers() },
      },
    });
    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 2 },
        game: { this_over: [scoreEvent({ value: 'WIDE_BALL', extras: 1, runs: 0 }), scoreEvent({ value: 'LEG_BYE', extras: 1, runs: 0 })], current_players: withPlayers() },
      },
    });

    // Note: extras accumulate from `lastBall` (the newest element of `this_over`) only,
    // consistent with how `lastEvent` already treats `this_over[length - 1]` as "the ball
    // that just happened". The WIDE_BALL from message 1 is not recounted when message 2's
    // `this_over` re-includes it alongside the new LEG_BYE ball, so `wide` stays at 1.
    expect(state.extras).toEqual({ wide: 1, no_ball: 0, bye: 0, leg_bye: 1, penalty: 0 });
  });

  it('resets partnership and records a fall-of-wicket entry on WICKET', () => {
    let state = createInitialLiveMatchState();
    state = liveMatchReducer(state, {
      event_type: 'WICKET',
      detail: {
        current: { ...baseCurrent, runs: 23, wickets: 1, over: 4, ball: 2 },
        game: {
          this_over: [scoreEvent({ value: 'BOWLED', dismissed: 's1', runs: 0 })],
          current_players: withPlayers({ striker: { id: 's3', full_name: 'New Batter', picture: null, reserve: false, stats: zeroStats() } }),
        },
      },
    });

    expect(state.fallOfWickets).toEqual([
      { wicketNumber: 1, scoreAtWicket: 23, over: 4, ball: 2, playerId: 's1', dismissalType: 'BOWLED' },
    ]);
    expect(state.partnership.runsAtStart).toBe(23);
    expect(state.partnership.ballsSinceWicket).toBe(0);
  });

  it('ignores a replayed WICKET for a wicket number already recorded, instead of appending a duplicate fallOfWickets entry', () => {
    const wicketMessage = {
      event_type: 'WICKET' as const,
      detail: {
        current: { ...baseCurrent, runs: 23, wickets: 1, over: 4, ball: 2 },
        game: {
          this_over: [scoreEvent({ value: 'BOWLED', dismissed: 's1', runs: 0 })],
          current_players: withPlayers({ striker: { id: 's3', full_name: 'New Batter', picture: null, reserve: false, stats: zeroStats() } }),
        },
      },
    };

    let state = createInitialLiveMatchState();
    state = liveMatchReducer(state, wicketMessage);
    // A couple more legal balls bowled before the (buggy) replay arrives.
    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 25, wickets: 1, over: 4, ball: 3 },
        game: { this_over: [scoreEvent({ value: 2, runs: 2 })], current_players: state.currentPlayers },
      },
    });
    const stateBeforeReplay = state;

    // The backend re-broadcasts the same WICKET message (e.g. reconnect resync).
    state = liveMatchReducer(state, wicketMessage);

    expect(state.fallOfWickets).toHaveLength(1);
    expect(state.partnership).toEqual(stateBeforeReplay.partnership);
  });

  it('marks the dismissed player is_out in opponents.batting.players immediately, without waiting for the next SUMMARY', () => {
    const s1 = { id: 's1', full_name: 'Striker', picture: null, reserve: false, stats: zeroStats() };
    const s2 = { id: 's2', full_name: 'Non-Striker', picture: null, reserve: false, stats: zeroStats() };

    let state = createInitialLiveMatchState();
    state = liveMatchReducer(state, {
      event_type: 'SUMMARY',
      detail: {
        current: baseCurrent,
        score_history: [],
        opponents: {
          batting: { id: 'opp-a', name: 'Team A', code: 'A', logo: null, players: [s1, s2], stats: zeroStats() },
          bowling: { id: 'opp-b', name: 'Team B', code: 'B', logo: null, players: [], stats: zeroStats() },
        },
        game: { this_over: [], current_players: withPlayers() },
      },
    });

    state = liveMatchReducer(state, {
      event_type: 'WICKET',
      detail: {
        current: { ...baseCurrent, wickets: 1 },
        game: {
          this_over: [scoreEvent({ value: 'BOWLED', dismissed: 's1', runs: 0 })],
          current_players: withPlayers({ striker: { id: 's3', full_name: 'New Batter', picture: null, reserve: false, stats: zeroStats() } }),
        },
      },
    });

    expect(state.opponents.batting?.players.find((p) => p.id === 's1')?.stats.is_out).toBe(true);
    expect(state.opponents.batting?.players.find((p) => p.id === 's2')?.stats.is_out).toBe(false);
  });

  it('fires a 50-run milestone exactly once when a batter crosses the threshold', () => {
    let state = createInitialLiveMatchState();
    const strikerAt49 = { id: 's1', full_name: 'Striker', picture: null, reserve: false, stats: { ...zeroStats(), runs_scored: 49 } };
    const strikerAt50 = { id: 's1', full_name: 'Striker', picture: null, reserve: false, stats: { ...zeroStats(), runs_scored: 50 } };

    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 49 },
        game: { this_over: [scoreEvent({ value: 1, runs: 1 })], current_players: withPlayers({ striker: strikerAt49 }) },
      },
    });
    expect(state.milestones).toEqual([]);

    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 50 },
        game: { this_over: [scoreEvent({ value: 1, runs: 1 })], current_players: withPlayers({ striker: strikerAt50 }) },
      },
    });
    expect(state.milestones).toEqual([{ key: 's1:50', playerId: 's1', kind: '50', atOver: 0, atBall: 0 }]);

    // Sending the same 50-run state again must not refire the milestone.
    state = liveMatchReducer(state, {
      event_type: 'LIVE',
      detail: { viewers: 1, current: state.current, game: { this_over: [], current_players: withPlayers({ striker: strikerAt50 }) } },
    });
    state = liveMatchReducer(state, {
      event_type: 'SCORE',
      detail: {
        current: { ...baseCurrent, runs: 51 },
        game: { this_over: [scoreEvent({ value: 1, runs: 1 })], current_players: withPlayers({ striker: strikerAt50 }) },
      },
    });
    expect(state.milestones).toHaveLength(1);
  });
});
