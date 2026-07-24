import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures content against its container and returns a CSS scale factor
 * (never above 1) so overflowing content shrinks to fit instead of wrapping
 * or clipping. Remeasures whenever measureKey changes.
 */
export function useFitScale(measureKey: string | number, minScale = 0.55) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const containerWidth = container.clientWidth;
    const contentWidth = content.scrollWidth;
    if (containerWidth <= 0 || contentWidth <= 0) {
      setScale(1);
      return;
    }
    setScale(Math.max(minScale, Math.min(1, containerWidth / contentWidth)));
  }, [measureKey, minScale]);

  return { containerRef, contentRef, scale };
}
