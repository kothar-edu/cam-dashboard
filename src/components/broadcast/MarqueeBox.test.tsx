import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarqueeBox } from './MarqueeBox';

function stubWidths(
  container: HTMLElement,
  { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number }
) {
  const containerEl = container.querySelector('[data-testid="marquee-container"]') as HTMLElement;
  const measureEl = container.querySelector('[data-testid="marquee-measure"]') as HTMLElement;
  Object.defineProperty(containerEl, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(measureEl, 'scrollWidth', { configurable: true, value: scrollWidth });
}

describe('MarqueeBox', () => {
  it('renders content once, statically, when it fits the container', () => {
    render(
      <MarqueeBox measureKey="short">
        <span>Short text</span>
      </MarqueeBox>
    );
    expect(screen.getAllByText('Short text')).toHaveLength(2); // 1 hidden measurement copy + 1 visible copy
    expect(screen.queryByTestId('marquee-track')).not.toBeInTheDocument();
  });

  it('switches to a seamless looping duplicate once content overflows the container', () => {
    const { container, rerender } = render(
      <MarqueeBox measureKey="v1">
        <span>Very long text that will not fit</span>
      </MarqueeBox>
    );
    stubWidths(container, { clientWidth: 100, scrollWidth: 500 });
    rerender(
      <MarqueeBox measureKey="v2">
        <span>Very long text that will not fit</span>
      </MarqueeBox>
    );

    expect(screen.getAllByText('Very long text that will not fit')).toHaveLength(3); // measure + 2 loop copies
    const track = screen.getByTestId('marquee-track');
    expect(track).toBeInTheDocument();
    expect(parseFloat(track.style.animationDuration)).toBeCloseTo((500 + 56) / 55, 2);
  });

  it('remeasures when measureKey changes back to content that fits', () => {
    const { container, rerender } = render(
      <MarqueeBox measureKey="v1">
        <span>Text</span>
      </MarqueeBox>
    );
    stubWidths(container, { clientWidth: 100, scrollWidth: 500 });
    rerender(
      <MarqueeBox measureKey="v2">
        <span>Text</span>
      </MarqueeBox>
    );
    expect(screen.getByTestId('marquee-track')).toBeInTheDocument();

    stubWidths(container, { clientWidth: 500, scrollWidth: 100 });
    rerender(
      <MarqueeBox measureKey="v3">
        <span>Text</span>
      </MarqueeBox>
    );
    expect(screen.queryByTestId('marquee-track')).not.toBeInTheDocument();
  });
});
