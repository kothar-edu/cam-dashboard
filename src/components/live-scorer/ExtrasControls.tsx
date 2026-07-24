import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BatAdvantage } from '@/types/liveMatch';

const EXTRA_RUN_OPTIONS = [0, 1, 2, 3, 4] as const;
const NO_BALL_SOURCES = ['BAT', 'BYE', 'LEG_BYE'] as const;
type NoBallSource = (typeof NO_BALL_SOURCES)[number];
const NO_BALL_SOURCE_LABEL: Record<NoBallSource, string> = { BAT: 'Bat', BYE: 'Byes', LEG_BYE: 'Leg Byes' };

const EXTRA_TYPES: Array<{ value: BatAdvantage; label: string }> = [
  { value: 'WIDE_BALL', label: 'Wide' },
  { value: 'NO_BALL', label: 'No Ball' },
  { value: 'BYE', label: 'Bye' },
  { value: 'LEG_BYE', label: 'Leg Bye' },
  { value: 'PENALTY', label: 'Penalty' },
];

type ExtrasControlsProps = {
  broadcastScore: (
    value: BatAdvantage,
    extras?: number,
    is_bat_involved?: boolean,
    bye_type?: 'BYE' | 'LEG_BYE',
  ) => void;
  disabled: boolean;
};

export function ExtrasControls({ broadcastScore, disabled }: ExtrasControlsProps) {
  const [expanded, setExpanded] = useState<BatAdvantage | null>(null);
  const [noBallSource, setNoBallSource] = useState<NoBallSource>('BAT');

  const submit = (value: BatAdvantage, extraRuns: number) => {
    if (value === 'NO_BALL') {
      broadcastScore(value, extraRuns, noBallSource === 'BAT', noBallSource === 'BAT' ? undefined : noBallSource);
    } else {
      broadcastScore(value, extraRuns);
    }
    setExpanded(null);
    setNoBallSource('BAT');
  };

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
      {EXTRA_TYPES.map(({ value, label }) => (
        <div key={value} className="relative">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={disabled}
            onClick={() => setExpanded(expanded === value ? null : value)}
          >
            {label}
          </Button>
          {expanded === value && (
            <div className="absolute left-0 z-20 mt-1 w-[min(14rem,calc(100vw-2rem))] rounded-md border border-gray-300 bg-white p-2 shadow-lg">
              {value === 'NO_BALL' && (
                <div className="mb-2 flex gap-1">
                  {NO_BALL_SOURCES.map((source) => (
                    <button
                      key={source}
                      type="button"
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        noBallSource === source ? 'bg-[#12233D] text-white' : 'bg-gray-100 text-[#12233D]'
                      }`}
                      onClick={() => setNoBallSource(source)}
                    >
                      {NO_BALL_SOURCE_LABEL[source]}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-5 gap-1">
                {EXTRA_RUN_OPTIONS.map((extraRuns) => (
                  <button
                    key={extraRuns}
                    type="button"
                    className="h-7 w-7 rounded bg-[#12233D] text-xs font-bold text-white"
                    onClick={() => submit(value, extraRuns)}
                  >
                    {extraRuns}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
