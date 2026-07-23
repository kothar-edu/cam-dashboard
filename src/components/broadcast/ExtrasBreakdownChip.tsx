import type { ExtrasBreakdown } from '@/types/liveMatch';

const CATEGORY_LABEL: Array<{ key: keyof ExtrasBreakdown; label: string }> = [
  { key: 'wide', label: 'wd' },
  { key: 'no_ball', label: 'nb' },
  { key: 'bye', label: 'b' },
  { key: 'leg_bye', label: 'lb' },
  { key: 'penalty', label: 'pn' },
];

type ExtrasBreakdownChipProps = {
  extras: ExtrasBreakdown;
};

export function ExtrasBreakdownChip({ extras }: ExtrasBreakdownChipProps) {
  const total = extras.wide + extras.no_ball + extras.bye + extras.leg_bye + extras.penalty;

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-[#12233D]">
      <span>Extras: {total}</span>
      <span className="text-gray-500">
        {CATEGORY_LABEL.filter(({ key }) => extras[key] > 0)
          .map(({ key, label }) => `${label} ${extras[key]}`)
          .join(', ')}
      </span>
    </div>
  );
}
