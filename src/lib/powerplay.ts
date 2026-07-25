import type { CurrentData } from '@/types/liveMatch';

export function selectPowerplayStatus(
  current: CurrentData,
  powerplayOvers: number
): { active: boolean; oversRemaining: number } {
  const active = current.over < powerplayOvers;
  return { active, oversRemaining: active ? powerplayOvers - current.over : 0 };
}
