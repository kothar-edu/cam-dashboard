import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Star } from 'lucide-react';
import type { Fixture } from '@/api/fixtures';
import { ComparisonBar } from '@/components/scorecards/ScoreBars';
import {
  formatInningsScoreWithOvers,
  formatMatchDate,
  getResultSummary,
  manOfTheMatchName,
  matchOutcomeLabel,
} from '@/lib/scorecard';
import { cn } from '@/lib/utils';

type ScorecardMatchCardProps = {
  fixture: Fixture;
};

function TeamLogo({ src, name }: { src?: string | null; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-sm"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white shadow-sm">
      {initials || '?'}
    </div>
  );
}

export function ScorecardMatchCard({ fixture }: ScorecardMatchCardProps) {
  const summary = getResultSummary(fixture);
  const scoreA = summary?.opponent_a;
  const scoreB = summary?.opponent_b;
  const outcome = matchOutcomeLabel(fixture);
  const motm = manOfTheMatchName(fixture.man_of_the_match);
  const winnerId = fixture.winner?.id;
  const isWinnerA = winnerId === fixture.opponent_a.id;
  const isWinnerB = winnerId === fixture.opponent_b.id;

  return (
    <Link
      to={`/dashboard/scorecards/${fixture.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-[#E8A93B]/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A93B]"
    >
      <div className="bg-gradient-to-br from-[#12233D] via-[#1a3358] to-[#0f1c30] px-4 pb-4 pt-3 text-white sm:px-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/70">
          <span className="rounded-full bg-white/10 px-2 py-0.5">
            {fixture.tournament?.name ?? 'Custom match'}
          </span>
          {fixture.round ? (
            <span className="rounded-full bg-[#E8A93B]/20 px-2 py-0.5 text-[#E8A93B]">
              {fixture.round}
            </span>
          ) : null}
          {fixture.dls ? (
            <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-sky-200">DLS</span>
          ) : null}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex min-w-0 flex-col items-start gap-2">
            <TeamLogo src={fixture.opponent_a.team_logo} name={fixture.opponent_a.team_name} />
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate text-sm font-semibold leading-tight',
                  isWinnerA ? 'text-[#E8A93B]' : 'text-white'
                )}
              >
                {fixture.opponent_a.team_name}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight sm:text-xl">
                {formatInningsScoreWithOvers(scoreA)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              vs
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-end gap-2 text-right">
            <TeamLogo src={fixture.opponent_b.team_logo} name={fixture.opponent_b.team_name} />
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate text-sm font-semibold leading-tight',
                  isWinnerB ? 'text-[#E8A93B]' : 'text-white'
                )}
              >
                {fixture.opponent_b.team_name}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight sm:text-xl">
                {formatInningsScoreWithOvers(scoreB)}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#E8A93B]">
          <Trophy className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{outcome}</span>
        </p>
      </div>

      <div className="space-y-3 px-4 py-3.5 sm:px-5">
        {scoreA && scoreB ? (
          <ComparisonBar
            labelA={fixture.opponent_a.team_name}
            labelB={fixture.opponent_b.team_name}
            valueA={scoreA.runs_scored}
            valueB={scoreB.runs_scored}
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Final score breakdown is not available for this match.
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#12233D]/70" />
            {formatMatchDate(fixture.time)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#12233D]/70" />
            {fixture.ground ?? 'Venue TBC'}
          </span>
          {motm ? (
            <span className="inline-flex items-center gap-1 text-[#12233D]">
              <Star className="h-3.5 w-3.5 fill-[#E8A93B] text-[#E8A93B]" />
              MOTM: {motm}
            </span>
          ) : null}
        </div>

        <p className="text-right text-[11px] font-medium text-[#12233D]/60 transition group-hover:text-[#E8A93B]">
          View full scorecard →
        </p>
      </div>
    </Link>
  );
}
