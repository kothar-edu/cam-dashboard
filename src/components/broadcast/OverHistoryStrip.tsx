import type { ScoreEvent } from '@/types/liveMatch';
import { ballKind, extrasBreakdown, shortCode, wicketCode } from '@/lib/ballLabel';

function badgeColor(kind: ReturnType<typeof ballKind>): string {
  if (kind === 'boundary4') return 'bg-green-700 text-white';
  if (kind === 'boundary6') return 'bg-purple-700 text-white';
  if (kind === 'extra') return 'bg-blue-600 text-white';
  if (kind === 'wicket') return 'bg-red-600 text-white';
  return 'bg-slate-300 text-slate-900';
}

type OverHistoryStripProps = {
  thisOver: ScoreEvent[];
};

export function OverHistoryStrip({ thisOver }: OverHistoryStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 px-4">
      {thisOver.map((event, index) => {
        const kind = ballKind(event);
        const detail = kind === 'wicket' ? wicketCode(event) : extrasBreakdown(event);
        const code = shortCode(event);
        const isDot = event.value === 0;
        return (
          <div
            key={index}
            data-testid="ball-badge"
            className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded border border-white/10 text-[10px] font-bold leading-tight ${badgeColor(kind)}`}
          >
            {isDot ? (
              <span
                data-testid="dot-ball"
                className="block h-3 w-3 rounded-full bg-slate-900"
                aria-label="0"
              />
            ) : (
              <span>{code}</span>
            )}
            {detail ? <span className="text-[8px] font-semibold opacity-90">{detail}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
