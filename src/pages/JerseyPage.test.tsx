import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JerseyPage from './JerseyPage';

vi.mock('@/hooks/useJersey', () => ({
  useJerseyWindows: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 3,
          tournament: { id: 'tr1', name: 'CAM Cup' },
          from_date_time: '2026-09-01T00:00:00Z',
          to_date_time: '2026-10-01T00:00:00Z',
          description: '',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useJerseyOrders: () => ({
    data: {
      count: 1,
      results: [
        {
          id: 9,
          jersey_request: {
            id: 3,
            tournament: { id: 'tr1', name: 'CAM Cup' },
          },
          player: { id: 'u1', full_name: 'Anish Shrestha' },
          jersey_number: 7,
          status: 'Pending',
          status_message: null,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useOpenJerseyWindow: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateJerseyWindow: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteJerseyWindow: () => ({ mutate: vi.fn(), isPending: false }),
  useReviewJerseyOrder: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useTournaments', () => ({
  useTournaments: () => ({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  }),
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <JerseyPage />
    </QueryClientProvider>
  );
}

describe('JerseyPage', () => {
  it('lists windows and the selected window orders', () => {
    renderPage();

    expect(screen.getByText('CAM Cup')).toBeTruthy();
    expect(screen.getByText('Anish Shrestha')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('offers opening, editing, and reviewing', () => {
    renderPage();

    expect(screen.getByText('Open window')).toBeTruthy();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Approve')).toBeTruthy();
    expect(screen.getByText('Reject')).toBeTruthy();
  });
});
