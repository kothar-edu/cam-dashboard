import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ScoreEvent } from '@/types/liveMatch';
import { SectionCard } from './SectionCard';

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n % 10] && n % 100 < 11 ? suffixes[n % 10] : 'th'}`;
}

function ballLabel(event: ScoreEvent): string {
  if (typeof event.value === 'number') return String(event.value);
  return String(event.value).replace(/_/g, ' ');
}

function badgeTone(event: ScoreEvent): string {
  if (event.value === 4) return 'border-green-200 bg-green-50 text-green-700';
  if (event.value === 6) return 'border-purple-200 bg-purple-50 text-purple-700';
  if (typeof event.value !== 'number') {
    return ['WIDE_BALL', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY'].includes(event.value)
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-gray-200 bg-gray-50 text-[#12233D]';
}

function OverRow({ index, overBalls }: { index: number; overBalls: ScoreEvent[] }) {
  return (
    <div data-testid="over-row" className="flex flex-wrap items-center gap-1.5">
      <span className="w-8 shrink-0 text-xs font-semibold text-gray-400">{ordinal(index + 1)}</span>
      {overBalls.map((event, ballIndex) => (
        <span
          key={ballIndex}
          className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border px-1 text-[10px] font-bold uppercase ${badgeTone(event)}`}
        >
          {ballLabel(event)}
        </span>
      ))}
    </div>
  );
}

type BallHistoryStripProps = {
  scoreHistory: ScoreEvent[][];
};

export function BallHistoryStrip({ scoreHistory }: BallHistoryStripProps) {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastOverIndex = scoreHistory.reduce((last, over, index) => (over ? index : last), -1);

  useEffect(() => {
    if (!expanded) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scoreHistory, expanded]);

  return (
    <SectionCard
      title="Over History"
      action={
        lastOverIndex >= 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-[#12233D] hover:underline"
          >
            {expanded ? 'Show current over' : 'Show all overs'}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        ) : undefined
      }
    >
      {lastOverIndex < 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">No balls bowled yet.</p>
      ) : expanded ? (
        <div ref={scrollRef} className="flex max-h-40 flex-col gap-2 overflow-y-auto">
          {scoreHistory.map((overBalls, index) =>
            overBalls ? <OverRow key={index} index={index} overBalls={overBalls} /> : null,
          )}
        </div>
      ) : (
        <OverRow index={lastOverIndex} overBalls={scoreHistory[lastOverIndex]} />
      )}
    </SectionCard>
  );
}
