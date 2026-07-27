import { useEffect, useState } from 'react';
import type { AllScoreValue } from '@/types/liveMatch';
import type { MilestoneEvent } from '@/lib/liveMatchReducer';

const CELEBRATE_VALUES = new Set<AllScoreValue>([
  4,
  6,
  'BOWLED',
  'LBW',
  'STUMPED',
  'CAUGHT',
  'RUN_OUT',
  'HANDLED',
  'WIDE_STUMPED',
]);
const FLASH_DURATION_MS = 5000;

const VALUE_LABEL: Partial<Record<AllScoreValue, string>> = {
  4: 'FOUR',
  6: 'SIX',
};

function labelFor(value: AllScoreValue, boundaryLabels?: BoundaryLabels): string {
  if (value === 4) return boundaryLabels?.four || VALUE_LABEL[4]!;
  if (value === 6) return boundaryLabels?.six || VALUE_LABEL[6]!;
  return VALUE_LABEL[value] ?? 'WICKET';
}

function styleFor(kind: 'SCORE' | 'WICKET' | null): string {
  return kind === 'WICKET' ? 'bg-red-700/55' : 'bg-green-800/55';
}

type LastEvent = { kind: 'SCORE' | 'WICKET' | null; value: AllScoreValue | null };
type BoundaryLabels = { four: string | null; six: string | null };

type CelebrationFlashProps = {
  lastEvent: LastEvent;
  boundaryLabels?: BoundaryLabels;
};

export function CelebrationFlash({ lastEvent, boundaryLabels }: CelebrationFlashProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastEvent.kind || lastEvent.value == null || !CELEBRATE_VALUES.has(lastEvent.value)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lastEvent.kind, lastEvent.value]);

  if (!visible || !lastEvent.kind || lastEvent.value == null) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center text-8xl font-bold text-yellow-400 ${styleFor(lastEvent.kind)}`}
    >
      <span className="animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
        {labelFor(lastEvent.value, boundaryLabels)}
      </span>
    </div>
  );
}

const MILESTONE_LABEL: Record<MilestoneEvent['kind'], string> = {
  '50': '50 UP',
  '100': 'CENTURY',
  '5WICKETS': 'FIVE-WICKET HAUL',
};

type MilestoneFlashProps = {
  milestone: MilestoneEvent;
  playerName: string;
};

export function MilestoneFlash({ milestone, playerName }: MilestoneFlashProps) {
  return (
    <div className="absolute inset-x-0 top-1/3 flex flex-col items-center justify-center gap-2 text-yellow-400">
      <span className="animate-pulse text-6xl font-bold">{MILESTONE_LABEL[milestone.kind]}</span>
      <span className="text-3xl font-bold text-white">{playerName}</span>
    </div>
  );
}
