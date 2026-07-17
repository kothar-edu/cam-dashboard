import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SponsorsPage from './SponsorsPage';

vi.mock('@/hooks/useSponsors', () => ({
  useSponsors: () => ({
    data: {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Acme Corp',
          image: null,
          supported_url: 'https://acme.example',
          extra_info: 'Title sponsor',
          sponsor_type: 'Title',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useDeleteSponsor: () => ({
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

describe('SponsorsPage', () => {
  it('renders sponsor table headers and row data', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <SponsorsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('https://acme.example')).toBeInTheDocument();
  });
});
