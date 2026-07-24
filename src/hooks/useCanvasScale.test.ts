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
  it('returns 1:1 scale when the viewport matches the canvas exactly (OBS Browser Source)', () => {
    setViewport(1920, 1080);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toEqual({ scaleX: 1, scaleY: 1 });
  });

  it('computes independent x/y scale factors so the canvas fills the viewport with no letterboxing', () => {
    setViewport(960, 540);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toEqual({ scaleX: 0.5, scaleY: 0.5 });
  });

  it('stretches non-uniformly when the viewport aspect ratio differs from the canvas', () => {
    setViewport(1920, 800);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current.scaleX).toBe(1);
    expect(result.current.scaleY).toBeCloseTo(800 / 1080);
  });

  it('recomputes on window resize', () => {
    setViewport(1920, 1080);
    const { result } = renderHook(() => useCanvasScale(1920, 1080));
    expect(result.current).toEqual({ scaleX: 1, scaleY: 1 });

    act(() => {
      setViewport(960, 1080);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toEqual({ scaleX: 0.5, scaleY: 1 });
  });
});
