import { useEffect, useState } from 'react';
import type { BroadcastSponsor } from '@/types/liveMatch';
import { useFitScale } from '@/hooks/useFitScale';

type SponsorShowcaseProps = {
  sponsors: BroadcastSponsor[];
};

const ROTATE_MS = 4500;

const LEVEL_CLASS: Record<BroadcastSponsor['level'], string> = {
  Title: 'bg-yellow-400 text-blue-950',
  Gold: 'bg-amber-300 text-amber-950',
  Silver: 'bg-slate-200 text-slate-800',
  Bronze: 'bg-orange-300 text-orange-950',
  General: 'bg-white text-[#12233D]',
};

export function SponsorShowcase({ sponsors }: SponsorShowcaseProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sponsors.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % sponsors.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [sponsors.length]);

  const sponsor = sponsors.length > 0 ? sponsors[index % sponsors.length] : null;
  const { containerRef, contentRef, scale } = useFitScale(sponsor?.id ?? '');

  if (!sponsor) return null;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div key={sponsor.id} className="flex max-w-full flex-col items-center gap-1 animate-in fade-in zoom-in-90 duration-500">
        {sponsor.imageUrl && (
          <img src={sponsor.imageUrl} alt={sponsor.name} className="h-9 max-w-[200px] object-contain" />
        )}
        <div ref={containerRef} className="max-w-[200px] overflow-hidden">
          <div
            ref={contentRef}
            className="flex w-max items-center gap-1.5 whitespace-nowrap"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          >
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${LEVEL_CLASS[sponsor.level]}`}>
              {sponsor.level}
            </span>
            <span className="text-sm font-semibold text-[#12233D]">{sponsor.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
