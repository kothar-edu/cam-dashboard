import { useLayoutEffect, useRef, useState } from 'react';

type MarqueeBoxProps = {
  children: React.ReactNode;
  /** Changes whenever the underlying content changes, forcing a remeasure. */
  measureKey: string | number;
  speedPxPerSec?: number;
  gapPx?: number;
};

const DEFAULT_SPEED_PX_PER_SEC = 55;
const DEFAULT_GAP_PX = 56;

/** Renders children statically, or as a seamless looping marquee if they overflow the container. */
export function MarqueeBox({ children, measureKey, speedPxPerSec = DEFAULT_SPEED_PX_PER_SEC, gapPx = DEFAULT_GAP_PX }: MarqueeBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [marquee, setMarquee] = useState({ active: false, durationSeconds: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const contentWidth = measure.scrollWidth;
    const active = contentWidth > container.clientWidth + 1;
    setMarquee({ active, durationSeconds: active ? (contentWidth + gapPx) / speedPxPerSec : 0 });
  }, [measureKey, speedPxPerSec, gapPx]);

  return (
    <div ref={containerRef} data-testid="marquee-container" className="relative w-full min-w-0 overflow-hidden">
      <div
        ref={measureRef}
        data-testid="marquee-measure"
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-center"
      >
        {children}
      </div>
      {marquee.active ? (
        <div
          data-testid="marquee-track"
          className="flex w-max animate-marquee items-center"
          style={{ animationDuration: `${marquee.durationSeconds}s` }}
        >
          <div className="flex shrink-0 items-center" style={{ paddingRight: gapPx }}>
            {children}
          </div>
          <div aria-hidden className="flex shrink-0 items-center" style={{ paddingRight: gapPx }}>
            {children}
          </div>
        </div>
      ) : (
        <div className="flex w-max items-center">{children}</div>
      )}
    </div>
  );
}
