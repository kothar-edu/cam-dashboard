import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveMatch } from './useLiveMatch';
import { createInitialLiveMatchState } from '@/lib/liveMatchReducer';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;

  url: string;
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  sent: string[] = [];

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  simulateOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal('WebSocket', FakeWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useLiveMatch', () => {
  it('connects, applies incoming messages to state, and reports connectionStatus', async () => {
    const { result } = renderHook(() => useLiveMatch('match-1', 'view'));

    expect(result.current.connectionStatus).toBe('connecting');

    const socket = FakeWebSocket.instances[0];
    act(() => socket.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    act(() =>
      socket.simulateMessage({
        event_type: 'LIVE',
        detail: {
          viewers: 3,
          current: { over: 0, ball: 0, inning: 1, runs: 10, wickets: 0, target: 0, crr: 0, balls_remaining: 120, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 0 },
          game: { this_over: [], current_players: { bowler: null, wicket_keeper: null, striker: null, non_striker: null } },
        },
      }),
    );

    expect(result.current.state.current.runs).toBe(10);
  });

  it('sets connectionStatus to reconnecting after the socket closes, then open again after reconnect', async () => {
    const { result } = renderHook(() => useLiveMatch('match-1', 'view'));
    const first = FakeWebSocket.instances[0];
    act(() => first.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    act(() => first.onclose?.());
    await waitFor(() => expect(result.current.connectionStatus).toBe('reconnecting'));

    // The hook's RECONNECT_DELAY_MS (1500ms) exceeds @testing-library/dom's
    // default waitFor timeout (1000ms), so this assertion needs a longer
    // timeout to observe the reconnect actually firing with real timers.
    await waitFor(() => expect(FakeWebSocket.instances.length).toBe(2), { timeout: 3000 });
    act(() => FakeWebSocket.instances[1].simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));
  });

  it('mode "score" sends events over the socket', async () => {
    const { result } = renderHook(() => useLiveMatch('match-1', 'score'));
    const socket = FakeWebSocket.instances[0];
    act(() => socket.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    act(() => result.current.sendEvent({ event_type: 'SCORE', detail: { value: 4 } }));

    expect(JSON.parse(socket.sent[0])).toEqual({ event_type: 'SCORE', detail: { value: 4 } });
  });

  it('mode "view" throws instead of sending', async () => {
    const { result } = renderHook(() => useLiveMatch('match-1', 'view'));
    const socket = FakeWebSocket.instances[0];
    act(() => socket.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    expect(() => result.current.sendEvent({ event_type: 'SCORE', detail: { value: 4 } })).toThrow();
  });

  it('ignores late close/message events from a socket superseded by a matchId change', async () => {
    const { result, rerender } = renderHook(
      ({ matchId }: { matchId: string }) => useLiveMatch(matchId, 'view'),
      { initialProps: { matchId: 'match-1' } },
    );

    const first = FakeWebSocket.instances[0];
    act(() => first.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    // Switch matches. React runs the old effect's cleanup (which closes
    // `first`) and then immediately runs the new effect for 'match-2' in the
    // same commit, before `first`'s own onclose would fire in a real browser.
    rerender({ matchId: 'match-2' });

    await waitFor(() => expect(FakeWebSocket.instances.length).toBe(2));
    const second = FakeWebSocket.instances[1];
    act(() => second.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    // Simulate the stale first socket's real (always-async) onclose firing
    // late, after the new generation has already taken over. It must not
    // schedule a reconnect for the old match or touch the new socket.
    act(() => first.onclose?.());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(FakeWebSocket.instances.length).toBe(2);
    expect(result.current.connectionStatus).toBe('open');

    // A late message from the stale first socket must not corrupt the state
    // the new match's UI is reading.
    act(() =>
      first.simulateMessage({
        event_type: 'LIVE',
        detail: {
          viewers: 3,
          current: { over: 0, ball: 0, inning: 1, runs: 999, wickets: 0, target: 0, crr: 0, balls_remaining: 120, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 0 },
          game: { this_over: [], current_players: { bowler: null, wicket_keeper: null, striker: null, non_striker: null } },
        },
      }),
    );
    expect(result.current.state.current.runs).not.toBe(999);
  });

  it('resets state and connectionStatus when matchId changes', async () => {
    const { result, rerender } = renderHook(
      ({ matchId }: { matchId: string }) => useLiveMatch(matchId, 'view'),
      { initialProps: { matchId: 'match-1' } },
    );

    const first = FakeWebSocket.instances[0];
    act(() => first.simulateOpen());
    await waitFor(() => expect(result.current.connectionStatus).toBe('open'));

    // Populate derived state (fallOfWickets, extras, lastEvent, etc.) via a
    // WICKET message, the same shape used for SCORE/WICKET elsewhere in this
    // file.
    act(() =>
      first.simulateMessage({
        event_type: 'WICKET',
        detail: {
          current: { over: 1, ball: 3, inning: 1, runs: 12, wickets: 1, target: 0, crr: 6, balls_remaining: 114, required_runs: 0, rrr: 0, status: 'IN_PROGRESS', projected: 0 },
          game: {
            this_over: [
              {
                striker: 'player-1',
                bowler: 'player-2',
                value: 'BOWLED',
                extras: 0,
                runs: 0,
                dismissed: 'player-1',
                fielder: null,
                is_bat_involved: true,
                commentary: 'bowled',
              },
            ],
            current_players: { bowler: null, wicket_keeper: null, striker: null, non_striker: null },
          },
        },
      }),
    );

    expect(result.current.state.fallOfWickets.length).toBe(1);
    expect(result.current.state.current.runs).toBe(12);

    // Switch matches without unmounting.
    rerender({ matchId: 'match-2' });

    expect(result.current.state).toEqual(createInitialLiveMatchState());
    expect(result.current.connectionStatus).toBe('connecting');
  });
});
