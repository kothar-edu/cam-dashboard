import { useEffect, type RefObject } from 'react';

/**
 * Calls `onOutside` when a pointerdown lands outside `ref`'s element, e.g.
 * to close a popover. Only listens while `active` is true, so closed
 * popovers don't pay for a global listener.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [active, onOutside, ref]);
}
