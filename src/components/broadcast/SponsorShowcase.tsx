import { useEffect, useState } from 'react';
import type { BroadcastSponsor } from '@/types/liveMatch';
import { cn } from '@/lib/utils';

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
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % sponsors.length),
      ROTATE_MS
    );
    return () => clearInterval(timer);
  }, [sponsors.length]);

  const sponsor = sponsors.length > 0 ? sponsors[index % sponsors.length] : null;
  if (!sponsor) return null;

  return (
    <div className="flex h-full w-full min-w-0 items-center justify-end">
      <div
        key={sponsor.id}
        className="flex w-full min-w-0 max-w-full flex-col items-end gap-1 animate-in fade-in duration-500"
      >
        <span
          className={cn(
            'w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            LEVEL_CLASS[sponsor.level]
          )}
        >
          {sponsor.level} Sponsor
        </span>
        {sponsor.imageUrl ? (
          <img
            src={sponsor.imageUrl}
            alt={sponsor.name}
            className="h-auto max-h-[5.5rem] w-auto max-w-full object-contain object-right"
          />
        ) : (
          <p
            className="max-w-full truncate text-right text-2xl font-extrabold leading-tight text-[#12233D]"
            title={sponsor.name}
          >
            {sponsor.name}
          </p>
        )}
      </div>
    </div>
  );
}
