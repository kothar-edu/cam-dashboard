import { useEffect, useState } from 'react';

export type CanvasScale = {
  scaleX: number;
  scaleY: number;
};

function computeScale(canvasWidth: number, canvasHeight: number): CanvasScale {
  if (typeof window === 'undefined') return { scaleX: 1, scaleY: 1 };
  return { scaleX: window.innerWidth / canvasWidth, scaleY: window.innerHeight / canvasHeight };
}

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
