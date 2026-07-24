import { useEffect, useState } from 'react';

export function useCanvasScale(canvasWidth: number, canvasHeight: number): number {
  const [scale, setScale] = useState(() =>
    typeof window === 'undefined' ? 1 : Math.min(window.innerWidth / canvasWidth, window.innerHeight / canvasHeight),
  );

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(window.innerWidth / canvasWidth, window.innerHeight / canvasHeight));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasWidth, canvasHeight]);

  return scale;
}
