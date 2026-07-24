import { useEffect, useState } from 'react';

export type CanvasScale = {
  scaleX: number;
  scaleY: number;
};

function computeScale(canvasWidth: number, canvasHeight: number): CanvasScale {
  if (typeof window === 'undefined') return { scaleX: 1, scaleY: 1 };
  return { scaleX: window.innerWidth / canvasWidth, scaleY: window.innerHeight / canvasHeight };
}

/**
 * Stretches the fixed-pixel broadcast canvas to fill the viewport exactly on
 * both axes. An OBS Browser Source configured at the canvas's native
 * 1920x1080 gets scaleX === scaleY === 1 (no distortion). A preview window
 * with a different aspect ratio gets mild non-uniform stretch instead of
 * letterbox bars, since this page is meant to fill the frame it's shown in.
 */
export function useCanvasScale(canvasWidth: number, canvasHeight: number): CanvasScale {
  const [scale, setScale] = useState(() => computeScale(canvasWidth, canvasHeight));

  useEffect(() => {
    function updateScale() {
      setScale(computeScale(canvasWidth, canvasHeight));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasWidth, canvasHeight]);

  return scale;
}
