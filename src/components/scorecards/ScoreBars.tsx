import { cn } from '@/lib/utils';

type ComparisonBarProps = {
  labelA: string;
  labelB: string;
  valueA: number;
  valueB: number;
  formatValue?: (value: number) => string;
  colorA?: string;
  colorB?: string;
  className?: string;
};

/** Side-by-side horizontal comparison (e.g. team runs). */
export function ComparisonBar({
  labelA,
  labelB,
  valueA,
  valueB,
  formatValue = String,
  colorA = '#12233D',
  colorB = '#E8A93B',
  className,
}: ComparisonBarProps) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = Math.round((valueA / max) * 100);
  const pctB = Math.round((valueB / max) * 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 truncate text-right text-xs font-medium text-[#12233D] sm:w-32">
          {labelA}
        </span>
        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pctA}%`, backgroundColor: colorA }}
          />
        </div>
        <span className="w-12 shrink-0 text-xs font-semibold tabular-nums text-[#12233D]">
          {formatValue(valueA)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 truncate text-right text-xs font-medium text-[#12233D] sm:w-32">
          {labelB}
        </span>
        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pctB}%`, backgroundColor: colorB }}
          />
        </div>
        <span className="w-12 shrink-0 text-xs font-semibold tabular-nums text-[#12233D]">
          {formatValue(valueB)}
        </span>
      </div>
    </div>
  );
}

export type VerticalBarItem = {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
};

type VerticalBarChartProps = {
  items: VerticalBarItem[];
  color?: string;
  emptyLabel?: string;
  unit?: string;
  className?: string;
};

/** Compact vertical bar chart for top performers. */
export function VerticalBarChart({
  items,
  color = '#12233D',
  emptyLabel = 'No data yet',
  unit = '',
  className,
}: VerticalBarChartProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={cn('flex h-44 items-end gap-2 sm:gap-3', className)}>
      {items.map((item) => {
        const heightPct = Math.max(8, Math.round((item.value / max) * 100));
        return (
          <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold tabular-nums text-[#12233D]">
              {item.value}
              {unit}
            </span>
            <div className="flex h-28 w-full items-end justify-center">
              <div
                className="w-full max-w-[2.25rem] rounded-t-md transition-all duration-500"
                style={{ height: `${heightPct}%`, backgroundColor: color }}
                title={`${item.label}: ${item.value}${unit}`}
              />
            </div>
            <span
              className="w-full truncate text-center text-[10px] font-medium leading-tight text-muted-foreground"
              title={item.label}
            >
              {item.label}
            </span>
            {item.sublabel ? (
              <span className="text-[10px] tabular-nums text-muted-foreground">{item.sublabel}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type DualMetricBarsProps = {
  items: Array<{
    id: string;
    label: string;
    primary: number;
    secondary: number;
    primaryLabel?: string;
    secondaryLabel?: string;
  }>;
  primaryColor?: string;
  secondaryColor?: string;
  emptyLabel?: string;
  className?: string;
};

/** Horizontal dual-metric bars (e.g. wickets + economy proxy). */
export function DualMetricBars({
  items,
  primaryColor = '#12233D',
  secondaryColor = '#E8A93B',
  emptyLabel = 'No data yet',
  className,
}: DualMetricBarsProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  const maxPrimary = Math.max(...items.map((i) => i.primary), 1);
  const maxSecondary = Math.max(...items.map((i) => i.secondary), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={item.id} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs font-medium text-[#12233D]">{item.label}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {item.primaryLabel ?? item.primary}
              {item.secondaryLabel ? ` · ${item.secondaryLabel}` : ''}
            </span>
          </div>
          <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((item.primary / maxPrimary) * 100)}%`,
                backgroundColor: primaryColor,
              }}
            />
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((item.secondary / maxSecondary) * 50)}%`,
                backgroundColor: secondaryColor,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
