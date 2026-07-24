import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BroadcastOverlayPage from './BroadcastOverlayPage';
import * as useLiveMatchModule from '@/hooks/useLiveMatch';
import * as useLiveMatchInfoModule from '@/hooks/useLiveMatchInfo';
import { createInitialLiveMatchState } from '@/lib/liveMatchReducer';

vi.mock('@/hooks/useLiveMatch');
vi.mock('@/hooks/useLiveMatchInfo');

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/broadcast/match-1']}>
        <Routes>
          <Route path="/broadcast/:matchId" element={<BroadcastOverlayPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('BroadcastOverlayPage', () => {
  beforeEach(() => {
    vi.mocked(useLiveMatchModule.useLiveMatch).mockReturnValue({
      state: createInitialLiveMatchState(),
      connectionStatus: 'open',
      sendEvent: vi.fn(),
    });
    vi.mocked(useLiveMatchInfoModule.useLiveMatchInfo).mockReturnValue({
      data: {
        ground: 'Main Ground',
        tournamentName: 'Cup',
        powerplayOvers: 6,
        livestreamOverlay: { sponsorText: null, topLeftImage: null, topRightImage: null },
        boundaryLabels: { four: null, six: null },
      },
      isLoading: false,
    } as any);
  });

  it('renders the score bug inside a fixed 1920x1080 canvas', () => {
    const { container } = renderPage();
    const canvas = container.querySelector('[data-testid="broadcast-canvas"]');
    expect(canvas).toHaveClass('w-[1920px]');
    expect(canvas).toHaveClass('h-[1080px]');
  });

  it('renders nothing (transparent) while match info is still loading', () => {
    vi.mocked(useLiveMatchInfoModule.useLiveMatchInfo).mockReturnValue({ data: undefined, isLoading: true } as any);
    const { container } = renderPage();
    expect(container.querySelector('[data-testid="broadcast-canvas"]')).toBeNull();
  });
});
