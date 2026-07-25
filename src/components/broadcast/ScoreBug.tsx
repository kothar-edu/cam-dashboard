import type { CurrentData, LiveOpponent, MatchOutcome, OpponentFinalScore, OpponentSummary } from '@/types/liveMatch';

type ScoreBugProps = {
  current: CurrentData;
  battingTeam: LiveOpponent | null | undefined;
  bowlingTeam: LiveOpponent | null | undefined;
  /** Team identity for the end-of-match card - the live-score path above
   * ignores these and keeps using battingTeam/bowlingTeam as before. */
  teamA?: OpponentSummary | null;
  teamB?: OpponentSummary | null;
  outcome?: MatchOutcome | null;
};

function formatScoreLine(score: OpponentFinalScore | null): string {
  if (!score) return '—';
  return `${score.runsScored}-${score.wicketsLost} (${score.oversBowled})`;
}

function describeOutcome(outcome: MatchOutcome): string {
  if (outcome.forfeit) {
    return outcome.winner
      ? `${outcome.forfeitedBy ?? 'Opponent'} forfeited — ${outcome.winner.team} win`
      : `${outcome.forfeitedBy ?? 'A team'} forfeited the match`;
  }
  if (outcome.abandoned) return 'Match abandoned';
  if (outcome.tied) return 'Match tied';
  if (outcome.winner) return `${outcome.winner.team} won${outcome.dls ? ' (DLS)' : ''}`;
  return 'Match ended';
}

function MatchEndedCard({
  teamA,
  teamB,
  outcome,
}: {
  teamA: OpponentSummary | null | undefined;
  teamB: OpponentSummary | null | undefined;
  outcome: MatchOutcome;
}) {
  return (
    <div className="flex w-[640px] flex-col items-center gap-2 rounded-3xl bg-blue-950 px-8 py-4 text-white shadow-lg">
      <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">Match Ended</span>
      {outcome.score && (
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold uppercase">{teamA?.code ?? teamA?.name ?? '—'}</span>
            <span className="text-2xl font-bold">{formatScoreLine(outcome.score.opponentA)}</span>
          </div>
          <span className="text-xl font-bold text-blue-300">vs</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold uppercase">{teamB?.code ?? teamB?.name ?? '—'}</span>
            <span className="text-2xl font-bold">{formatScoreLine(outcome.score.opponentB)}</span>
          </div>
        </div>
      )}
      <span className="text-xl font-bold text-yellow-300">{describeOutcome(outcome)}</span>
    </div>
  );
}

export function ScoreBug({ current, battingTeam, bowlingTeam, teamA, teamB, outcome }: ScoreBugProps) {
  if (current.status === 'END_OF_MATCH') {
    if (outcome) {
      return <MatchEndedCard teamA={teamA} teamB={teamB} outcome={outcome} />;
    }
    return (
      <div className="flex h-24 w-[420px] items-center justify-center rounded-full bg-blue-950 text-4xl font-bold text-yellow-400">
        Match Ended
      </div>
    );
  }

  return (
    <div className="flex h-24 w-[420px] flex-col rounded-full bg-gradient-to-br from-blue-800 to-blue-950 leading-none text-white">
      <div className="flex h-1/2 items-center justify-center gap-4 px-6 pt-2 text-xl font-bold uppercase">
        <span>{battingTeam?.code ?? bowlingTeam?.code ?? '—'}</span>
        <span className="text-4xl">
          {current.runs}-{current.wickets}
        </span>
        <span>
          {current.over}.{current.ball}
        </span>
      </div>
      <div className="flex h-1/2 items-center justify-between px-6 text-base font-bold">
        <span className="text-blue-200/80">CRR: {current.crr}</span>
        <span>Balls Left: {current.balls_remaining}</span>
        <span>{current.target ? `Target: ${current.target}` : `Inning ${current.inning}`}</span>
      </div>
    </div>
  );
}
