import { useCallback, useEffect, useRef, useState } from 'react';
import { buildLiveScoreWsUrl } from '@/api/livescore';
import {
  createInitialLiveMatchState,
  liveMatchReducer,
  type LiveMatchState,
} from '@/lib/liveMatchReducer';
import type { IncomingLiveScoreMessage, OutgoingLiveScoreMessage } from '@/types/liveMatch';

export type LiveMatchMode = 'score' | 'view';
export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

export function useLiveMatch(
  matchId: string | undefined,
  mode: LiveMatchMode,
  tenant?: string | null
) {
  const [state, setState] = useState<LiveMatchState>(createInitialLiveMatchState);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return undefined;

    setState(createInitialLiveMatchState());
    setConnectionStatus('connecting');

    let cancelled = false;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (cancelled) return;
      setConnectionStatus('connecting');
      const socket = new WebSocket(buildLiveScoreWsUrl(matchId as string, tenant));
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        attempts = 0;
        setConnectionStatus('open');
      };

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
    [mode]
  );

  return { state, connectionStatus, sendEvent };
}
