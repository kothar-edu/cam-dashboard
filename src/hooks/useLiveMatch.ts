import { useCallback, useEffect, useRef, useState } from 'react';
import { buildLiveScoreWsUrl } from '@/api/livescore';
import { createInitialLiveMatchState, liveMatchReducer, type LiveMatchState } from '@/lib/liveMatchReducer';
import type { IncomingLiveScoreMessage, OutgoingLiveScoreMessage } from '@/types/liveMatch';

export type LiveMatchMode = 'score' | 'view';
export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

export function useLiveMatch(matchId: string | undefined, mode: LiveMatchMode, tenant?: string | null) {
  const [state, setState] = useState<LiveMatchState>(createInitialLiveMatchState);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return undefined;

    // Reset derived state and connection status for the new matchId
    // "generation". Without this, switching matchId on a mounted hook (e.g.
    // client-side navigation between /broadcast/:matchId routes without a
    // remount) would carry the previous match's extras, fallOfWickets,
    // partnership, and firedMilestoneKeys into the new match's state until
    // enough new SCORE/WICKET events overwrote them - and would keep
    // reporting a stale 'open' connectionStatus for the new (not-yet-open)
    // socket. Harmless on first mount too, since state is already the
    // initial value then.
    setState(createInitialLiveMatchState());
    setConnectionStatus('connecting');

    // These are intentionally local to this effect invocation (not hook-level
    // refs) so each matchId "generation" gets its own isolated closure. If
    // this effect is cleaned up (matchId change or unmount) before the old
    // socket's async onclose fires, `cancelled` for THIS generation is
    // captured by that stale handler and can never be reset by a later
    // effect run - preventing the stale handler from reconnecting into the
    // new generation's socketRef or acting on a stale attempt count.
    let cancelled = false;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (cancelled) return;
      // No functional guard needed here: the effect-top reset above already
      // handles the matchId-change case (connectionStatus starts at
      // 'connecting' before this first connect() call), and for the
      // recursive reconnect-after-drop call, onclose already set
      // 'reconnecting' before scheduling the retry - so unconditionally
      // setting 'connecting' here is always correct.
      setConnectionStatus('connecting');
      const socket = new WebSocket(buildLiveScoreWsUrl(matchId as string, tenant));
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        attempts = 0;
        setConnectionStatus('open');
      };

      // Guarded (unlike onopen/onclose/onerror, this one is *not* optional to
      // skip): although `state` is reset to fresh initial state at the top
      // of each effect run, a message that arrives from a superseded socket
      // after cleanup (e.g. already in flight when close() was called) would
      // otherwise still merge stale/wrong-match data into the state the new
      // matchId's UI is reading.
      socket.onmessage = (event) => {
        if (cancelled) return;
        const message = JSON.parse(event.data) as IncomingLiveScoreMessage;
        setState((prev) => liveMatchReducer(prev, message));
      };

      socket.onclose = () => {
        if (cancelled) return;
        if (attempts >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('closed');
          return;
        }
        setConnectionStatus('reconnecting');
        attempts += 1;
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        if (cancelled) return;
        socket.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [matchId, tenant]);

  const sendEvent = useCallback(
    (message: OutgoingLiveScoreMessage) => {
      if (mode !== 'score') {
        throw new Error('useLiveMatch: sendEvent is only available in "score" mode');
      }
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('useLiveMatch: cannot send while disconnected');
      }
      socketRef.current.send(JSON.stringify(message));
    },
    [mode],
  );

  return { state, connectionStatus, sendEvent };
}
