import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTable } from './DataTable';

type TestRow = { id: string; name: string };

describe('DataTable', () => {
  it('renders column headers and rows', () => {
    render(
      <DataTable<TestRow>
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        data={[{ id: '1', name: 'Team A' }]}
        loading={false}
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(
      <DataTable<TestRow>
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        data={[]}
        loading={true}
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getAllByTestId('data-table-loading').length).toBeGreaterThan(0);
  });

  it('shows empty state when no data', () => {
    render(
      <DataTable<TestRow>
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        data={[]}
        loading={false}
      />
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
