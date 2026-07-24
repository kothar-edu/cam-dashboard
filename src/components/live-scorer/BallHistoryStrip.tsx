import type { ScoreEvent } from '@/types/liveMatch';

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n % 10] && n % 100 < 11 ? suffixes[n % 10] : 'th'}`;
}

function ballLabel(event: ScoreEvent): string {
  if (typeof event.value === 'number') return String(event.value);
  return String(event.value).replace(/_/g, ' ');
}

type BallHistoryStripProps = {
  scoreHistory: ScoreEvent[][];
};

export function BallHistoryStrip({ scoreHistory }: BallHistoryStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain rounded-md border border-gray-200 bg-white p-2">
      {scoreHistory.map((overBalls, index) => (
        <div key={index} data-testid="over-row" className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-gray-500">{ordinal(index + 1)}</span>
          {overBalls.map((event, ballIndex) => (
            <span
              key={ballIndex}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-[10px] font-bold text-[#12233D]"
            >
              {ballLabel(event)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
