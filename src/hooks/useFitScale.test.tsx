import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useFitScale } from './useFitScale';

function TestBox({ measureKey, minScale, onScale }: { measureKey: string; minScale?: number; onScale: (scale: number) => void }) {
  const { containerRef, contentRef, scale } = useFitScale(measureKey, minScale);
  onScale(scale);
  return (
    <div ref={containerRef} data-testid="container">
      <div ref={contentRef} data-testid="content">
        content
      </div>
    </div>
  );
}

function stubWidths(container: HTMLElement, { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number }) {
  const containerEl = container.querySelector('[data-testid="container"]') as HTMLElement;
  const contentEl = container.querySelector('[data-testid="content"]') as HTMLElement;
  Object.defineProperty(containerEl, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(contentEl, 'scrollWidth', { configurable: true, value: scrollWidth });
}

describe('useFitScale', () => {
  it('stays at 1 when content already fits the container', () => {
    let latest = 0;
    render(<TestBox measureKey="v1" onScale={(s) => (latest = s)} />);
    expect(latest).toBe(1);
  });

  it('shrinks proportionally when content overflows the container', () => {
    let latest = 0;
    const { container, rerender } = render(<TestBox measureKey="v1" onScale={(s) => (latest = s)} />);
    stubWidths(container, { clientWidth: 140, scrollWidth: 200 });
    rerender(<TestBox measureKey="v2" onScale={(s) => (latest = s)} />);
    expect(latest).toBe(0.7);
  });

  it('never shrinks below minScale', () => {
    let latest = 0;
    const { container, rerender } = render(<TestBox measureKey="v1" minScale={0.6} onScale={(s) => (latest = s)} />);
    stubWidths(container, { clientWidth: 50, scrollWidth: 500 });
    rerender(<TestBox measureKey="v2" minScale={0.6} onScale={(s) => (latest = s)} />);
    expect(latest).toBe(0.6);
  });
});
