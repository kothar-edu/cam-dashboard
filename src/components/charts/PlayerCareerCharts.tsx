import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART } from '@/components/charts/chartTheme';

type Props = {
  batting: { runs: number; fours: number; sixes: number };
  bowling: { wickets: number; maidens: number; hattricks: number };
};

export function PlayerCareerCharts({ batting, bowling }: Props) {
  const battingData = [
    { label: 'Runs', value: batting.runs, fill: CHART.gold },
    { label: 'Fours', value: batting.fours, fill: CHART.navy },
    { label: 'Sixes', value: batting.sixes, fill: CHART.goldDark },
  ];
  const bowlingData = [
    { label: 'Wickets', value: bowling.wickets, fill: CHART.navy },
    { label: 'Maidens', value: bowling.maidens, fill: CHART.gold },
    { label: 'Hattricks', value: bowling.hattricks, fill: CHART.goldDark },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Batting" data={battingData} />
      <ChartCard title="Bowling" data={bowlingData} />
    </div>
  );
}

function ChartCard({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number; fill: string }>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#12233D]">{title}</h3>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: CHART.muted, fontSize: 12 }} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: CHART.muted, fontSize: 12 }} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(18, 35, 61, 0.04)' }}
              contentStyle={{
                borderRadius: 8,
                borderColor: CHART.grid,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
