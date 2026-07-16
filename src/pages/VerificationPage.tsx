import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mediaUrl, type TeamJoinApplication, type TenantRegistration } from '@/api/verification';
import { useTenant } from '@/contexts/TenantContext';
import {
  useReviewTeamJoinApplication,
  useReviewTenantRegistration,
  useTeamJoinApplications,
  useTenantRegistrations,
} from '@/hooks/useVerification';

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
}

function ReceiptPanel({
  title,
  receipt,
  onClose,
}: {
  title: string;
  receipt: string | null;
  onClose: () => void;
}) {
  const url = mediaUrl(receipt);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-[#12233D]">{title}</h3>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {url ? (
          <div className="space-y-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#E8A93B] underline"
            >
              Open receipt
            </a>
            {url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
              <img src={url} alt={title} className="max-h-48 rounded border object-contain" />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No receipt uploaded.</p>
        )}
      </div>
    </div>
  );
}

export default function VerificationPage() {
  const { activeTenant } = useTenant();
  const [tab, setTab] = useState<'registrations' | 'team-joins'>('registrations');
  const [regPage, setRegPage] = useState(0);
  const [joinPage, setJoinPage] = useState(0);
  const [rejectTarget, setRejectTarget] = useState<TenantRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [receiptTarget, setReceiptTarget] = useState<{
    title: string;
    receipt: string | null;
  } | null>(null);

  const registrations = useTenantRegistrations({
    limit: PAGE_SIZE,
    offset: regPage * PAGE_SIZE,
  });
  const teamJoins = useTeamJoinApplications({
    limit: PAGE_SIZE,
    offset: joinPage * PAGE_SIZE,
  });
  const reviewRegistration = useReviewTenantRegistration();
  const reviewTeamJoin = useReviewTeamJoinApplication();

  const registrationRows =
    registrations.data?.results.filter((row) => row.status === 'pending') ??
    registrations.data?.results ??
    [];

  const handleRejectRegistration = () => {
    if (!rejectTarget) return;
    reviewRegistration.mutate(
      { id: rejectTarget.id, action: 'reject', reason: rejectReason },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Verification</h1>
        <p className="text-sm text-muted-foreground">
          Review tenant registrations and team join requests
          {activeTenant ? ` · ${activeTenant.name}` : ''}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={tab === 'registrations' ? 'default' : 'outline'}
          onClick={() => setTab('registrations')}
        >
          Tenant registrations
        </Button>
        <Button
          type="button"
          variant={tab === 'team-joins' ? 'default' : 'outline'}
          onClick={() => setTab('team-joins')}
        >
          Team join requests
        </Button>
      </div>

      {tab === 'registrations' ? (
        registrations.isLoading && !registrations.data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : registrations.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load tenant registrations.
          </div>
        ) : (
          <DataTable
            columns={[
              { id: 'player', header: 'Player', cell: (row) => row.user_name },
              { id: 'email', header: 'Email', cell: (row) => row.user_email },
              { id: 'tenant', header: 'Organization', cell: (row) => row.tenant_name },
              { id: 'paid', header: 'Paid', cell: (row) => (row.is_paid ? 'Yes' : 'No') },
              {
                id: 'status',
                header: 'Status',
                cell: (row) => <StatusBadge status={row.status} />,
              },
              {
                id: 'receipt',
                header: 'Receipt',
                cell: (row) =>
                  row.receipt ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReceiptTarget({
                          title: `${row.user_name} — registration receipt`,
                          receipt: row.receipt,
                        })
                      }
                    >
                      View
                    </Button>
                  ) : (
                    '—'
                  ),
              },
              {
                id: 'actions',
                header: 'Actions',
                cell: (row) =>
                  row.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={reviewRegistration.isPending}
                        onClick={() =>
                          reviewRegistration.mutate({ id: row.id, action: 'approve' })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={reviewRegistration.isPending}
                        onClick={() => {
                          setRejectTarget(row);
                          setRejectReason('');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]}
            data={registrationRows}
            loading={registrations.isLoading}
            emptyMessage="No registration requests found."
            pagination={
              registrations.data
                ? { pageIndex: regPage, pageSize: PAGE_SIZE, totalCount: registrations.data.count }
                : undefined
            }
            onPaginationChange={({ pageIndex }) => setRegPage(pageIndex)}
          />
        )
      ) : !activeTenant ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a tenant from the header to review team join requests.
          </p>
        </div>
      ) : teamJoins.isLoading && !teamJoins.data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : teamJoins.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load team join requests.
        </div>
      ) : (
        <DataTable
          columns={[
            { id: 'player', header: 'Player', cell: (row: TeamJoinApplication) => row.user_name },
            { id: 'email', header: 'Email', cell: (row) => row.user_email },
            { id: 'team', header: 'Team', cell: (row) => row.team_name },
            { id: 'paid', header: 'Paid', cell: (row) => (row.is_paid ? 'Yes' : 'No') },
            {
              id: 'receipt',
              header: 'Receipt',
              cell: (row) =>
                row.receipt ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReceiptTarget({
                        title: `${row.user_name} — team join receipt`,
                        receipt: row.receipt,
                      })
                    }
                  >
                    View
                  </Button>
                ) : (
                  '—'
                ),
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={reviewTeamJoin.isPending}
                    onClick={() => reviewTeamJoin.mutate({ id: row.id, action: 'approve' })}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={reviewTeamJoin.isPending}
                    onClick={() => reviewTeamJoin.mutate({ id: row.id, action: 'reject' })}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
          data={teamJoins.data?.results ?? []}
          loading={teamJoins.isLoading}
          emptyMessage="No pending team join requests."
          pagination={
            teamJoins.data
              ? { pageIndex: joinPage, pageSize: PAGE_SIZE, totalCount: teamJoins.data.count }
              : undefined
          }
          onPaginationChange={({ pageIndex }) => setJoinPage(pageIndex)}
        />
      )}

      {rejectTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#12233D]">Reject registration</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Rejecting {rejectTarget.user_name}&apos;s request for {rejectTarget.tenant_name}.
            </p>
            <div className="mt-4 space-y-4">
              <Input
                label="Reason (optional)"
                value={rejectReason}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRejectReason(event.target.value)
                }
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={reviewRegistration.isPending}
                  onClick={handleRejectRegistration}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {receiptTarget ? (
        <ReceiptPanel
          title={receiptTarget.title}
          receipt={receiptTarget.receipt}
          onClose={() => setReceiptTarget(null)}
        />
      ) : null}
    </div>
  );
}
