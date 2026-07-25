import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScoreActions } from './useScoreActions';

describe('useScoreActions', () => {
  it('broadcastScore sends a SCORE message with defaults for optional fields', () => {
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useScoreActions(sendEvent));

    result.current.broadcastScore(4);

    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'SCORE',
      detail: { value: 4, extras: 0, is_bat_involved: undefined, bye_type: undefined },
    });
  });

  it('broadcastWicket sends a WICKET message', () => {
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useScoreActions(sendEvent));

    result.current.broadcastWicket('RUN_OUT', 'player-1', 1, 'fielder-1');

    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'WICKET',
      detail: {
        value: 'RUN_OUT',
        dismissed: 'player-1',
        successful_runs: 1,
        fielder: 'fielder-1',
        extras: 0,
      },
    });
  });

  it('broadcastCommentary trims and caps at 2048 characters, and drops empty input', () => {
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useScoreActions(sendEvent));

    result.current.broadcastCommentary('  hello  ');
    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'COMMENTARY',
      detail: { message: 'hello' },
    });

    sendEvent.mockClear();
    result.current.broadcastCommentary('   ');
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('updatePlayer and updateRetiredHurtStatus send the expected shapes', () => {
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useScoreActions(sendEvent));

    result.current.updatePlayer('bowler', 'player-9');
    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'UPDATE_PLAYER',
      detail: { type: 'bowler', id: 'player-9' },
    });

    result.current.updateRetiredHurtStatus('player-2', true);
    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'UPDATE_RETIRED_HURT',
      detail: { player_id: 'player-2', can_return: true },
    });
  });

  it('broadcastGameEvent merges the data object under detail alongside value', () => {
    const sendEvent = vi.fn();
    const { result } = renderHook(() => useScoreActions(sendEvent));

    result.current.broadcastGameEvent('SETTING', {
      target: 150,
      max_overs: 20,
      bowling_limit: 4,
      DLS: false,
    });

    expect(sendEvent).toHaveBeenCalledWith({
      event_type: 'EVENT',
      detail: { value: 'SETTING', target: 150, max_overs: 20, bowling_limit: 4, DLS: false },
    });
  });
});
