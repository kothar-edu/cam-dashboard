import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostFormPage from './PostFormPage';

const POST_DATA = {
  id: 'post-1',
  title: 'Season kickoff',
  description: 'Body text',
  post_type: 'Blog',
  status: 'Published',
  post_date: '2026-07-17',
  post_time: '12:00:00',
  is_public: false,
  cover_image: null,
  images: [{ id: 1, image: 'https://example.com/media/images/cover.png', is_cover: true }],
};

vi.mock('@/hooks/usePosts', () => ({
  usePost: () => ({
    data: POST_DATA,
    isLoading: false,
  }),
  useCreatePost: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdatePost: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    activeTenant: { id: 1, name: 'CAM Youth', schema_name: 'cam_youth_association', is_active: true },
    activeTenantId: 'cam_youth_association',
  }),
}));

describe('PostFormPage edit', () => {
  it('shows the stored is_public value, not the default', async () => {
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/dashboard/posts/post-1']}>
          <Routes>
            <Route path="/dashboard/posts/:id" element={<PostFormPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: 'Edit post' })).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', { name: 'Public post (visible to guests and non-members)' })
      ).not.toBeChecked();
    });
    expect(container.querySelector('img')).toHaveAttribute('src', POST_DATA.images[0].image);
  });
});
