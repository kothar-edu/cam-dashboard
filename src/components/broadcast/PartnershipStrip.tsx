import type { CurrentData, LiveMatchPlayer, PartnershipState } from '@/types/liveMatch';

type PartnershipStripProps = {
  partnership: PartnershipState;
  current: CurrentData;
  striker: LiveMatchPlayer | null;
  nonStriker: LiveMatchPlayer | null;
};

export function PartnershipStrip({ partnership, current, striker, nonStriker }: PartnershipStripProps) {
  if (!striker && !nonStriker) return null;
  const partnershipRuns = current.runs - partnership.runsAtStart;

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-[#12233D]">
      <span>Partnership: {partnershipRuns} ({partnership.ballsSinceWicket})</span>
      <span className="text-gray-500">
        {striker?.full_name ?? '—'} &amp; {nonStriker?.full_name ?? '—'}
      </span>
    </div>
  );
}
