import { useMemo } from 'react';
import type {
  BatAdvantage,
  BatScore,
  OutgoingLiveScoreMessage,
  PlayerRole,
  WicketType,
} from '@/types/liveMatch';

export function useScoreActions(sendEvent: (message: OutgoingLiveScoreMessage) => void) {
  return useMemo(
    () => ({
      broadcastScore: (
        value: BatScore | BatAdvantage,
        extras = 0,
        is_bat_involved?: boolean,
        bye_type?: 'BYE' | 'LEG_BYE'
      ) => {
        sendEvent({ event_type: 'SCORE', detail: { value, extras, is_bat_involved, bye_type } });
      },
      broadcastWicket: (
        value: WicketType,
        dismissed?: string,
        successful_runs = 0,
        fielder: string | null = null,
        extras = 0
      ) => {
        sendEvent({
          event_type: 'WICKET',
          detail: { value, dismissed, successful_runs, fielder, extras },
        });
      },
      updatePlayer: (type: PlayerRole, id: string) => {
        sendEvent({ event_type: 'UPDATE_PLAYER', detail: { type, id } });
      },
      broadcastCommentary: (message: string) => {
        const trimmed = message.trim();
        if (!trimmed) return;
        sendEvent({ event_type: 'COMMENTARY', detail: { message: trimmed.slice(0, 2048) } });
      },
      broadcastGameEvent: (value: string, data: Record<string, unknown> = {}) => {
        sendEvent({ event_type: 'EVENT', detail: { value, ...data } });
      },
      updateRetiredHurtStatus: (player_id: string, can_return: boolean) => {
        sendEvent({ event_type: 'UPDATE_RETIRED_HURT', detail: { player_id, can_return } });
      },
    }),
    [sendEvent]
  );
}
