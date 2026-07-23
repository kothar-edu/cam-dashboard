import type {
  CurrentData,
  CurrentPlayersState,
  IncomingLiveScoreMessage,
  OpponentsState,
  ScoreEvent,
} from '@/types/liveMatch';

export type LastEvent = {
  kind: 'SCORE' | 'WICKET' | null;
  value: ScoreEvent['value'] | null;
};

export type LiveMatchState = {
  current: CurrentData;
  scoreHistory: ScoreEvent[][];
  opponents: OpponentsState;
  currentPlayers: CurrentPlayersState;
  viewers: number;
  lastEvent: LastEvent;
};

const ZERO_CURRENT: CurrentData = {
  over: 0,
  ball: 0,
  inning: 0,
  runs: 0,
  wickets: 0,
  target: 0,
  crr: 0,
  balls_remaining: 0,
  required_runs: 0,
  rrr: 0,
  status: 'STARTING',
  projected: 0,
};

const EMPTY_CURRENT_PLAYERS: CurrentPlayersState = {
  bowler: null,
  wicket_keeper: null,
  striker: null,
  non_striker: null,
};

export function createInitialLiveMatchState(): LiveMatchState {
  return {
    current: ZERO_CURRENT,
    scoreHistory: [],
    opponents: {},
    currentPlayers: EMPTY_CURRENT_PLAYERS,
    viewers: 0,
    lastEvent: { kind: null, value: null },
  };
}

function withOverAppended(scoreHistory: ScoreEvent[][], over: number, thisOver: ScoreEvent[]): ScoreEvent[][] {
  const next = [...scoreHistory];
  next[over] = thisOver;
  return next;
}

export function liveMatchReducer(state: LiveMatchState, message: IncomingLiveScoreMessage): LiveMatchState {
  switch (message.event_type) {
    case 'ERROR':
      return state;

    case 'LIVE':
      return {
        ...state,
        current: message.detail.current,
        currentPlayers: message.detail.game.current_players,
        viewers: message.detail.viewers,
      };

    case 'SUMMARY':
      return {
        ...state,
        current: message.detail.current,
        scoreHistory: message.detail.score_history,
        opponents: message.detail.opponents,
        currentPlayers: message.detail.game.current_players,
      };

    case 'EVENT':
      return {
        ...state,
        current: message.detail.current,
        scoreHistory: message.detail.score_history,
        opponents: message.detail.opponents,
        currentPlayers: message.detail.game.current_players,
      };

    case 'SCORE':
    case 'WICKET': {
      const lastBall = message.detail.game.this_over[message.detail.game.this_over.length - 1];
      return {
        ...state,
        current: message.detail.current,
        scoreHistory: withOverAppended(state.scoreHistory, message.detail.current.over, message.detail.game.this_over),
        currentPlayers: message.detail.game.current_players,
        lastEvent: { kind: message.event_type, value: lastBall?.value ?? null },
      };
    }

    case 'UPDATE_PLAYER':
      return {
        ...state,
        currentPlayers: {
          ...state.currentPlayers,
          [message.detail.playerRole]: message.detail.playerIn,
        },
      };

    default:
      return state;
  }
}
