import type { CurrentData } from '@/types/liveMatch';
import { selectPowerplayStatus } from '@/lib/powerplay';

type PowerplayBadgeProps = {
  current: CurrentData;
  powerplayOvers: number;
};

export function PowerplayBadge({ current, powerplayOvers }: PowerplayBadgeProps) {
  const status = selectPowerplayStatus(current, powerplayOvers);
  if (!status.active) return null;

  return (
    <div className="flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-blue-950">
      <span>POWERPLAY</span>
      <span>{status.oversRemaining} overs left</span>
    </div>
  );
}
