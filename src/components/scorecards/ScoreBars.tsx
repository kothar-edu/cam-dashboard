import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART } from '@/components/charts/chartTheme';
import { cn } from '@/lib/utils';

const tooltipStyle = {
  borderRadius: 8,
  borderColor: CHART.grid,
  fontSize: 12,
};

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
  colorA = CHART.navy,
  colorB = CHART.gold,
  className,
}: ComparisonBarProps) {
  const data = [
    { id: 'a', name: labelA, value: valueA, fill: colorA },
    { id: 'b', name: labelB, value: valueB, fill: colorB },
  ];

  return (
    <div className={cn('h-24 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 44, left: 4, bottom: 4 }}
          barCategoryGap="30%"
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fill: CHART.navy, fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [formatValue(Number(value ?? 0)), 'Runs']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) => formatValue(Number(value ?? 0))}
              style={{ fill: CHART.navy, fontSize: 12, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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

function makeCategoryTick(data: Array<{ name: string; sublabel?: string }>) {
  return function CategoryTick({ x, y, payload }: any) {
    const item = data.find((d) => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={12} textAnchor="middle" fontSize={10} fill={CHART.muted}>
          {payload.value}
        </text>
        {item?.sublabel ? (
          <text x={0} y={0} dy={24} textAnchor="middle" fontSize={9} fill={CHART.muted}>
            {item.sublabel}
          </text>
        ) : null}
      </g>
    );
  };
}

/** Compact vertical bar chart for top performers. */
export function VerticalBarChart({
  items,
  color = CHART.navy,
  emptyLabel = 'No data yet',
  unit = '',
  className,
}: VerticalBarChartProps) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const data = items.map((item) => ({
    id: item.id,
    name: item.label,
    sublabel: item.sublabel,
    value: item.value,
  }));

  return (
    <div className={cn('h-52 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 8, bottom: 24 }}>
          <XAxis
            dataKey="name"
            tick={makeCategoryTick(data) as any}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis hide domain={[0, (max: number) => max * 1.15]} />
          <Tooltip
            cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [`${Number(value ?? 0)}${unit}`, 'Value']}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="value"
              position="top"
              formatter={(value) => `${Number(value ?? 0)}${unit}`}
              style={{ fill: CHART.navy, fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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

/** Grouped horizontal bars comparing two metrics per category. */
export function DualMetricBars({
  items,
  primaryColor = CHART.navy,
  secondaryColor = CHART.gold,
  emptyLabel = 'No data yet',
  className,
}: DualMetricBarsProps) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const data = items.map((item) => ({
    id: item.id,
    name: item.label,
    primary: item.primary,
    secondary: item.secondary,
    primaryLabel: item.primaryLabel ?? String(item.primary),
    secondaryLabel: item.secondaryLabel ?? String(item.secondary),
  }));
  const yAxisWidth = Math.min(140, Math.max(72, ...data.map((d) => d.name.length * 6)));
  const height = Math.max(140, data.length * 60);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 64, left: 4, bottom: 4 }}
          barGap={4}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={yAxisWidth}
            tick={{ fill: CHART.navy, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }} contentStyle={tooltipStyle} />
          <Bar
            dataKey="primary"
            fill={primaryColor}
            radius={[0, 4, 4, 0]}
            maxBarSize={14}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="primaryLabel"
              position="right"
              style={{ fill: primaryColor, fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
          <Bar
            dataKey="secondary"
            fill={secondaryColor}
            radius={[0, 4, 4, 0]}
            maxBarSize={14}
            opacity={0.85}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="secondaryLabel"
              position="right"
              style={{ fill: CHART.goldDark, fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type DivergingBarChartProps = {
  items: Array<{ id: string; label: string; value: number }>;
  formatValue?: (value: number) => string;
  positiveColor?: string;
  negativeColor?: string;
  emptyLabel?: string;
  className?: string;
};

function makeDivergingLabel(
  formatValue: (value: number) => string,
  positiveColor: string,
  negativeColor: string
) {
  return function DivergingLabel(props: any) {
    const { x, y, width, height, value } = props;
    const isPositive = value >= 0;
    const tx = isPositive ? x + width + 6 : x - 6;
    return (
      <text
        x={tx}
        y={y + height / 2}
        dy={4}
        fontSize={11}
        fontWeight={700}
        textAnchor={isPositive ? 'start' : 'end'}
        fill={isPositive ? positiveColor : negativeColor}
      >
        {formatValue(value)}
      </text>
    );
  };
}

/** Horizontal bars that diverge from zero — for signed metrics like NRR. */
export function DivergingBarChart({
  items,
  formatValue = (value) => value.toFixed(2),
  positiveColor = '#059669',
  negativeColor = '#e11d48',
  emptyLabel = 'No data yet',
  className,
}: DivergingBarChartProps) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const data = items.map((item) => ({ id: item.id, name: item.label, value: item.value }));
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.1) * 1.35;
  const height = Math.max(140, data.length * 44);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
          <XAxis type="number" domain={[-maxAbs, maxAbs]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fill: CHART.navy, fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke={CHART.grid} />
          <Tooltip
            cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [formatValue(Number(value ?? 0)), 'NRR']}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={16} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.value >= 0 ? positiveColor : negativeColor} />
            ))}
            <LabelList
              dataKey="value"
              content={makeDivergingLabel(formatValue, positiveColor, negativeColor) as any}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type RankedBarItem = {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  valueLabel?: string;
};

type RankedBarChartProps = {
  items: RankedBarItem[];
  color?: string;
  emptyLabel?: string;
  className?: string;
};

function makeRankTick(data: Array<{ name: string; sublabel?: string }>) {
  return function RankTick({ x, y, payload, index }: any) {
    const item = data[index] ?? data.find((d) => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-4} y={-4} textAnchor="end" fontSize={11} fontWeight={600} fill={CHART.navy}>
          <tspan fill={CHART.muted}>{index + 1}. </tspan>
          <tspan>{payload.value}</tspan>
        </text>
        {item?.sublabel ? (
          <text x={-4} y={9} textAnchor="end" fontSize={9} fill={CHART.muted}>
            {item.sublabel}
          </text>
        ) : null}
      </g>
    );
  };
}

/** Horizontal leaderboard bars — rank, name, sublabel and a formatted value. */
export function RankedBarChart({
  items,
  color = CHART.navy,
  emptyLabel = 'No data yet',
  className,
}: RankedBarChartProps) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const data = items.map((item) => ({
    id: item.id,
    name: item.label,
    sublabel: item.sublabel,
    value: item.value,
    valueLabel: item.valueLabel ?? String(item.value),
  }));
  const height = Math.max(120, data.length * 40);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tick={makeRankTick(data) as any}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }} contentStyle={tooltipStyle} />
          <Bar
            dataKey="value"
            fill={color}
            radius={[0, 6, 6, 0]}
            maxBarSize={14}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="valueLabel"
              position="right"
              style={{ fill: CHART.navy, fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
