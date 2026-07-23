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

export type ExtrasBreakdown = {
  wide: number;
  no_ball: number;
  bye: number;
  leg_bye: number;
  penalty: number;
};

export type FallOfWicketEntry = {
  wicketNumber: number;
  scoreAtWicket: number;
  over: number;
  ball: number;
  playerId: string | null;
  dismissalType: ScoreEvent['value'];
};

export type PartnershipState = {
  runsAtStart: number;
  ballsSinceWicket: number;
  batterIds: [string | null, string | null];
};

export type MilestoneEvent = {
  key: string;
  playerId: string;
  kind: '50' | '100' | '5WICKETS';
  atOver: number;
  atBall: number;
};

// Known limitation: fallOfWickets, extras, and milestones are derived live,
// ball-by-ball, from SCORE/WICKET messages received while connected. They do
// NOT backfill on a fresh page load mid-innings — the SUMMARY/LIVE messages
// sent on (re)connect carry only the current aggregate state, not a per-ball
// history with point-in-time score snapshots, so "the score when wicket #2
// fell" cannot be reconstructed from a cold connect without a backend change
// (out of scope; see design spec's Non-goals). `partnership` is the exception:
// it recovers correctly on reconnect since it's derived from the
// always-current current.runs/currentPlayers, just reset relative to
// whatever current.wickets count is present at connect time.
export type LiveMatchState = {
  current: CurrentData;
  scoreHistory: ScoreEvent[][];
  opponents: OpponentsState;
  currentPlayers: CurrentPlayersState;
  viewers: number;
  lastEvent: LastEvent;
  extras: ExtrasBreakdown;
  fallOfWickets: FallOfWicketEntry[];
  partnership: PartnershipState;
  milestones: MilestoneEvent[];
  firedMilestoneKeys: string[];
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
    extras: { wide: 0, no_ball: 0, bye: 0, leg_bye: 0, penalty: 0 },
    fallOfWickets: [],
    partnership: { runsAtStart: 0, ballsSinceWicket: 0, batterIds: [null, null] },
    milestones: [],
    firedMilestoneKeys: [],
  };
}

function withOverAppended(scoreHistory: ScoreEvent[][], over: number, thisOver: ScoreEvent[]): ScoreEvent[][] {
  const next = [...scoreHistory];
  next[over] = thisOver;
  return next;
}

const EXTRA_KEY_BY_VALUE: Partial<Record<ScoreEvent['value'], keyof ExtrasBreakdown>> = {
  WIDE_BALL: 'wide',
  NO_BALL: 'no_ball',
  BYE: 'bye',
  LEG_BYE: 'leg_bye',
  PENALTY: 'penalty',
};

const NON_LEGAL_DELIVERY_VALUES = new Set<ScoreEvent['value']>(['WIDE_BALL', 'NO_BALL']);

function isLegalDelivery(value: ScoreEvent['value']): boolean {
  return !NON_LEGAL_DELIVERY_VALUES.has(value);
}

function withExtrasApplied(extras: ExtrasBreakdown, lastBall: ScoreEvent | undefined): ExtrasBreakdown {
  if (!lastBall) return extras;
  const key = EXTRA_KEY_BY_VALUE[lastBall.value];
  if (!key) return extras;
  return { ...extras, [key]: extras[key] + (lastBall.extras ?? 0) };
}

function withMilestonesChecked(
  milestones: MilestoneEvent[],
  firedKeys: string[],
  current: CurrentData,
  currentPlayers: CurrentPlayersState,
): { milestones: MilestoneEvent[]; firedMilestoneKeys: string[] } {
  const candidates: Array<{ player: CurrentPlayersState['striker']; kind: MilestoneEvent['kind']; threshold: number; metric: number }> = [];
  if (currentPlayers.striker) {
    candidates.push({ player: currentPlayers.striker, kind: '50', threshold: 50, metric: currentPlayers.striker.stats.runs_scored });
    candidates.push({ player: currentPlayers.striker, kind: '100', threshold: 100, metric: currentPlayers.striker.stats.runs_scored });
  }
  if (currentPlayers.non_striker) {
    candidates.push({ player: currentPlayers.non_striker, kind: '50', threshold: 50, metric: currentPlayers.non_striker.stats.runs_scored });
    candidates.push({ player: currentPlayers.non_striker, kind: '100', threshold: 100, metric: currentPlayers.non_striker.stats.runs_scored });
  }
  if (currentPlayers.bowler) {
    candidates.push({ player: currentPlayers.bowler, kind: '5WICKETS', threshold: 5, metric: currentPlayers.bowler.stats.wickets_taken });
  }

  let nextMilestones = milestones;
  let nextFiredKeys = firedKeys;
  for (const candidate of candidates) {
    if (!candidate.player || candidate.metric < candidate.threshold) continue;
    const key = `${candidate.player.id}:${candidate.kind}`;
    if (nextFiredKeys.includes(key)) continue;
    nextFiredKeys = [...nextFiredKeys, key];
    nextMilestones = [
      ...nextMilestones,
      { key, playerId: candidate.player.id, kind: candidate.kind, atOver: current.over, atBall: current.ball },
    ];
  }
  return { milestones: nextMilestones, firedMilestoneKeys: nextFiredKeys };
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
      const { milestones, firedMilestoneKeys } = withMilestonesChecked(
        state.milestones,
        state.firedMilestoneKeys,
        message.detail.current,
        message.detail.game.current_players,
      );

      const isWicket = message.event_type === 'WICKET';
      const fallOfWickets = isWicket
        ? [
            ...state.fallOfWickets,
            {
              wicketNumber: message.detail.current.wickets,
              scoreAtWicket: message.detail.current.runs,
              over: message.detail.current.over,
              ball: message.detail.current.ball,
              playerId: lastBall?.dismissed ?? null,
              dismissalType: lastBall?.value ?? 'BOWLED',
            },
          ]
        : state.fallOfWickets;

      const partnership = isWicket
        ? {
            runsAtStart: message.detail.current.runs,
            ballsSinceWicket: 0,
            batterIds: [
              message.detail.game.current_players.striker?.id ?? null,
              message.detail.game.current_players.non_striker?.id ?? null,
            ] as [string | null, string | null],
          }
        : {
            ...state.partnership,
            ballsSinceWicket: state.partnership.ballsSinceWicket + (lastBall && isLegalDelivery(lastBall.value) ? 1 : 0),
          };

      return {
        ...state,
        current: message.detail.current,
        scoreHistory: withOverAppended(state.scoreHistory, message.detail.current.over, message.detail.game.this_over),
        currentPlayers: message.detail.game.current_players,
        lastEvent: { kind: message.event_type, value: lastBall?.value ?? null },
        extras: withExtrasApplied(state.extras, lastBall),
        fallOfWickets,
        partnership,
        milestones,
        firedMilestoneKeys,
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
