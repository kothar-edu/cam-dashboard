import type { ScoreEvent } from '@/types/liveMatch';

function badgeLabel(event: ScoreEvent): string {
  if (typeof event.value === 'number') return String(event.value);
  const shortLabels: Record<string, string> = {
    WIDE_BALL: 'WD', NO_BALL: 'NB', BYE: 'B', LEG_BYE: 'LB', PENALTY: 'PN',
    BOWLED: 'W', CAUGHT: 'W', LBW: 'W', STUMPED: 'W', HANDLED: 'W', RUN_OUT: 'W', HIT_WICKET: 'W',
  };
  return shortLabels[event.value] ?? String(event.value).slice(0, 2);
}

function badgeColor(event: ScoreEvent): string {
  if (event.value === 4) return 'bg-green-700 text-white';
  if (event.value === 6) return 'bg-purple-700 text-white';
  if (typeof event.value !== 'number') {
    return ['WIDE_BALL', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY'].includes(event.value)
      ? 'bg-blue-600 text-white'
      : 'bg-red-600 text-white';
  }
  return 'bg-slate-300 text-slate-900';
}

type OverHistoryStripProps = {
  thisOver: ScoreEvent[];
};

export function OverHistoryStrip({ thisOver }: OverHistoryStripProps) {
  return (
    <div className="flex gap-1 px-4">
      {thisOver.map((event, index) => (
        <div
          key={index}
          data-testid="ball-badge"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 text-xs font-bold ${badgeColor(event)}`}
        >
          {badgeLabel(event)}
        </div>
      ))}
    </div>
  );
}
