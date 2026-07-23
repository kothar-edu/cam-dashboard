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
  const attemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    if (!matchId) return undefined;

    function connect() {
      setConnectionStatus((prev) => (prev === 'open' ? prev : 'connecting'));
      const socket = new WebSocket(buildLiveScoreWsUrl(matchId as string));
      socketRef.current = socket;

      socket.onopen = () => {
        attemptsRef.current = 0;
        setConnectionStatus('open');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as IncomingLiveScoreMessage;
        setState((prev) => liveMatchReducer(prev, message));
      };

      socket.onclose = () => {
        if (unmountedRef.current) return;
        if (attemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('closed');
          return;
        }
        setConnectionStatus('reconnecting');
        attemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
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
