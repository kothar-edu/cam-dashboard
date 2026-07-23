export type BatScore = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BatAdvantage = 'NO_BALL' | 'WIDE_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';
export type WicketType =
  | 'HANDLED'
  | 'RUN_OUT'
  | 'BOWLED'
  | 'LBW'
  | 'STUMPED'
  | 'CAUGHT'
  | 'HIT_WICKET'
  | 'RETIRED_HURT'
  | 'RETIRED_OUT'
  | 'WIDE_RUN_OUT'
  | 'WIDE_STUMPED'
  | 'NO_BALL_RUN_OUT';
export type AllScoreValue = BatScore | BatAdvantage | WicketType;

export type PlayerRole = 'bowler' | 'striker' | 'non_striker' | 'wicket_keeper';

export type ScoreEvent = {
  striker: string;
  bowler: string;
  value: AllScoreValue;
  extras: number;
  runs: number;
  dismissed: string | null;
  fielder: string | null;
  is_bat_involved: boolean;
  commentary: string;
  bye_type?: 'BYE' | 'LEG_BYE' | null;
};

export type PlayerStats = {
  runs_scored: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  is_out: boolean;
  crr: number;
  srr: number;
  runs_conceded: number;
  overs_bowled: number;
  wickets_taken: number;
  wickets_lost: number;
  maidens: number;
  err: number;
};

export type LiveMatchPlayer = {
  id: string;
  full_name: string;
  picture: string | null;
  reserve: boolean;
  retired_hurt?: boolean;
  can_return?: boolean;
  stats: PlayerStats;
};

export type CurrentPlayersState = {
  bowler: LiveMatchPlayer | null;
  wicket_keeper: LiveMatchPlayer | null;
  striker: LiveMatchPlayer | null;
  non_striker: LiveMatchPlayer | null;
};

export type OpponentSummary = {
  id: string;
  name: string;
  code: string;
  logo: string | null;
};

export type LiveOpponent = OpponentSummary & {
  players: LiveMatchPlayer[];
  stats: PlayerStats;
};

export type OpponentsState = {
  batting?: LiveOpponent | null;
  bowling?: LiveOpponent | null;
  team_a?: OpponentSummary | null;
  team_b?: OpponentSummary | null;
};

export type CurrentData = {
  over: number;
  ball: number;
  inning: number;
  runs: number;
  wickets: number;
  retired_hurt?: number;
  target: number;
  crr: number;
  balls_remaining: number;
  required_runs: number;
  rrr: number;
  status: string;
  projected: number;
};

export type LiveBroadcastDetail = {
  current: CurrentData;
  game: {
    this_over: ScoreEvent[];
    last_over?: ScoreEvent[];
    current_players: CurrentPlayersState;
  };
  viewers: number;
  score_history: ScoreEvent[][];
  opponents: OpponentsState;
  value: string;
};

export type IncomingLiveScoreMessage =
  | { event_type: 'ERROR'; detail: { message: string; code: string } }
  | {
      // Real backend behavior (apps/livescore/utils/game_play.py's
      // update_viewers, extra_summary=False): LIVE is a periodic
      // viewer-count ping whose `game` is `{}` on the wire - none of its
      // fields (including current_players) are guaranteed present, unlike
      // every other event type below.
      event_type: 'LIVE';
      detail: Pick<LiveBroadcastDetail, 'viewers' | 'current'> & { game: Partial<LiveBroadcastDetail['game']> };
    }
  | { event_type: 'SCORE' | 'WICKET'; detail: Pick<LiveBroadcastDetail, 'current' | 'game'> }
  | {
      event_type: 'SUMMARY';
      detail: Pick<LiveBroadcastDetail, 'current' | 'game' | 'score_history' | 'opponents'>;
    }
  | {
      event_type: 'EVENT';
      detail: Pick<LiveBroadcastDetail, 'value' | 'current' | 'game' | 'score_history' | 'opponents'>;
    }
  | {
      event_type: 'UPDATE_PLAYER';
      detail: { playerRole: PlayerRole; playerIn: LiveMatchPlayer | null; playerOut: LiveMatchPlayer | null };
    };

export type OutgoingLiveScoreMessage =
  | {
      event_type: 'SCORE';
      detail: {
        value: BatScore | BatAdvantage;
        extras?: number;
        is_bat_involved?: boolean;
        bye_type?: 'BYE' | 'LEG_BYE';
      };
    }
  | {
      event_type: 'WICKET';
      detail: {
        value: WicketType;
        dismissed?: string;
        successful_runs?: number;
        fielder?: string | null;
        extras?: number;
      };
    }
  | { event_type: 'UPDATE_PLAYER'; detail: { type: PlayerRole; id: string } }
  | { event_type: 'COMMENTARY'; detail: { message: string } }
  | { event_type: 'EVENT'; detail: { value: string; [key: string]: unknown } }
  | { event_type: 'UPDATE_RETIRED_HURT'; detail: { player_id: string; can_return: boolean } };

export type LiveMatchInfo = {
  ground: string | null;
  tournamentName: string | null;
  powerplayOvers: number;
  livestreamOverlay: {
    sponsorText: string | null;
    topLeftImage: string | null;
    topRightImage: string | null;
  };
};
