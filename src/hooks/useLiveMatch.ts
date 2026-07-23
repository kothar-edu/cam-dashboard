import { useCallback, useEffect, useRef, useState } from 'react';
import { buildLiveScoreWsUrl } from '@/api/livescore';
import { createInitialLiveMatchState, liveMatchReducer, type LiveMatchState } from '@/lib/liveMatchReducer';
import type { IncomingLiveScoreMessage, OutgoingLiveScoreMessage } from '@/types/liveMatch';

export type LiveMatchMode = 'score' | 'view';
export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

export function useLiveMatch(matchId: string | undefined, mode: LiveMatchMode) {
  const [state, setState] = useState<LiveMatchState>(createInitialLiveMatchState);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return undefined;

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
      setConnectionStatus((prev) => (prev === 'open' ? prev : 'connecting'));
      const socket = new WebSocket(buildLiveScoreWsUrl(matchId as string));
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        attempts = 0;
        setConnectionStatus('open');
      };

      // Guarded (unlike onopen/onclose/onerror, this one is *not* optional to
      // skip): `state` is shared across matchId generations and is not reset
      // when matchId changes, so a message that arrives from a superseded
      // socket after cleanup (e.g. already in flight when close() was
      // called) would otherwise silently merge stale/wrong-match data into
      // the state the new matchId's UI is reading.
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
  }, [matchId]);

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
