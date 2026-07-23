import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveMatch } from './useLiveMatch';

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
});
