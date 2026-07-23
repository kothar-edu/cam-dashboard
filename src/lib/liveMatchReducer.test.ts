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
});
