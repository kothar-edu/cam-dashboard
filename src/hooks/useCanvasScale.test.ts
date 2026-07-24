import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasScale } from './useCanvasScale';

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

afterEach(() => {
  setViewport(1024, 768);
});

describe('useCanvasScale', () => {
  it('scales down to fit a viewport smaller than the canvas', () => {
    setViewport(960, 540);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toBe(0.5);
  });

  it('picks the smaller of the two axis ratios so the canvas never overflows', () => {
    setViewport(1920, 400);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toBeCloseTo(400 / 1080);
  });

  it('recomputes on window resize', () => {
    setViewport(1920, 1080);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toBe(1);

    act(() => {
      setViewport(960, 1080);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(0.5);
  });
});
