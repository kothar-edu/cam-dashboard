import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUsers } from '@/hooks/useUsers';

const PAGE_SIZE = 20;

function VerifiedCell({ verified }: { verified: boolean }) {
  return (
    <span className={verified ? 'text-green-700' : 'text-red-600'}>
      {verified ? 'Yes' : 'No'}
    </span>
  );
}

export default function UsersPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const { data, isLoading, isError } = useUsers({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load users. Admin access is required.
      </div>
    );
  }

  const users = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Users</h1>
        <p className="text-sm text-muted-foreground">Global user directory (not tenant-scoped)</p>
      </div>

      <DataTable
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.full_name },
          { id: 'email', header: 'Email', cell: (row) => row.email },
          {
            id: 'roles',
            header: 'Roles',
            cell: (row) => (row.roles.length ? row.roles.join(', ') : '—'),
          },
          {
            id: 'emailVerified',
            header: 'Email verified',
            cell: (row) => <VerifiedCell verified={row.is_email_verified} />,
          },
          {
            id: 'paymentVerified',
            header: 'Payment verified',
            cell: (row) => <VerifiedCell verified={row.is_payment_verified} />,
          },
          {
            id: 'paymentStatus',
            header: 'Payment status',
            cell: (row) => row.payment_status ?? '—',
          },
          {
            id: 'subscription',
            header: 'Subscription ends',
            cell: (row) => row.subscription_end_date ?? '—',
          },
        ]}
        data={users}
        loading={isLoading}
        emptyMessage="No users found."
        pagination={
          data ? { pageIndex, pageSize: PAGE_SIZE, totalCount: data.count } : undefined
        }
        onPaginationChange={({ pageIndex: nextPage }) => setPageIndex(nextPage)}
      />
    </div>
  );
}
