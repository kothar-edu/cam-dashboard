import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PostsPage from './PostsPage';

vi.mock('@/hooks/usePosts', () => ({
  usePosts: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          post_type: 'Event',
          title: 'Season Opener',
          slug: 'season-opener',
          description: 'Opening day',
          post_date: '2026-06-01T00:00:00Z',
          post_time: null,
          like_count: 12,
          comment_count: 3,
          cover_image: null,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useDeletePost: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('PostsPage', () => {
  it('renders post table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <PostsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Likes')).toBeInTheDocument();
    expect(screen.getByText('Season Opener')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
