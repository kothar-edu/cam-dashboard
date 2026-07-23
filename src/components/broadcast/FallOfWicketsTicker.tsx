import type { FallOfWicketEntry } from '@/lib/liveMatchReducer';

type FallOfWicketsTickerProps = {
  entries: FallOfWicketEntry[];
  playerNameById: Record<string, string>;
};

export function FallOfWicketsTicker({ entries, playerNameById }: FallOfWicketsTickerProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto rounded-md bg-white/90 px-3 py-1 text-xs font-bold text-[#12233D]">
      <span className="shrink-0 text-gray-500">FOW:</span>
      {entries.map((entry) => (
        <span key={entry.wicketNumber} className="shrink-0">
          {entry.wicketNumber}-{entry.scoreAtWicket} ({entry.playerId ? (playerNameById[entry.playerId] ?? 'Unknown') : 'Unknown'}, {entry.over}.{entry.ball})
        </span>
      ))}
    </div>
  );
}
