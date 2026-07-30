import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/forms/PageHeader';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mediaUrl, type TeamJoinApplication, type TenantRegistration } from '@/api/verification';
import { useTenant } from '@/contexts/TenantContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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

function StudentFeeBadge() {
  return (
    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
      Student fee
    </span>
  );
}

function ReceiptPanel({
  open,
  title,
  receipt,
  onClose,
}: {
  open: boolean;
  title: string;
  receipt: string | null;
  onClose: () => void;
}) {
  const url = mediaUrl(receipt);
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
    >
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
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]['value'];

function StatusFilterTabs({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div className="flex w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
      {STATUS_TABS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-[#12233D] text-white'
              : 'text-[#12233D] hover:bg-slate-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function VerificationPage() {
  const { activeTenant } = useTenant();
  const [tab, setTab] = useState<'registrations' | 'team-joins'>('registrations');
  const [regStatus, setRegStatus] = useState<StatusFilter>('pending');
  const [joinStatus, setJoinStatus] = useState<StatusFilter>('pending');
  const [regPage, setRegPage] = useState(0);
  const [joinPage, setJoinPage] = useState(0);
  const [regSearch, setRegSearch] = useState('');
  const [joinSearch, setJoinSearch] = useState('');
  const debouncedRegSearch = useDebouncedValue(regSearch.trim());
  const debouncedJoinSearch = useDebouncedValue(joinSearch.trim());
  const [rejectTarget, setRejectTarget] = useState<TenantRegistration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveRegTarget, setApproveRegTarget] = useState<TenantRegistration | null>(null);
  const [approveJoinTarget, setApproveJoinTarget] = useState<TeamJoinApplication | null>(null);
  const [rejectJoinTarget, setRejectJoinTarget] = useState<TeamJoinApplication | null>(null);
  const [rejectJoinReason, setRejectJoinReason] = useState('');
  const [receiptTarget, setReceiptTarget] = useState<{
    title: string;
    receipt: string | null;
  } | null>(null);

  const registrations = useTenantRegistrations({
    limit: PAGE_SIZE,
    offset: regPage * PAGE_SIZE,
    ...(regStatus === 'all' ? {} : { status: regStatus }),
    ...(debouncedRegSearch ? { search: debouncedRegSearch } : {}),
  });
  const teamJoins = useTeamJoinApplications({
    limit: PAGE_SIZE,
    offset: joinPage * PAGE_SIZE,
    ...(joinStatus === 'all' ? {} : { status: joinStatus }),
    ...(debouncedJoinSearch ? { search: debouncedJoinSearch } : {}),
  });
  const reviewRegistration = useReviewTenantRegistration();
  const reviewTeamJoin = useReviewTeamJoinApplication();

  const registrationRows = registrations.data?.results ?? [];

  const handleRegStatusChange = (status: StatusFilter) => {
    setRegStatus(status);
    setRegPage(0);
  };

  const handleJoinStatusChange = (status: StatusFilter) => {
    setJoinStatus(status);
    setJoinPage(0);
  };

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

  const handleRejectTeamJoin = () => {
    if (!rejectJoinTarget) return;
    reviewTeamJoin.mutate(
      { id: rejectJoinTarget.id, action: 'reject', reason: rejectJoinReason },
      {
        onSuccess: () => {
          setRejectJoinTarget(null);
          setRejectJoinReason('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification"
        description={`Review tenant registrations and team join requests${
          activeTenant ? ` · ${activeTenant.name}` : ''
        }`}
      />

      <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('registrations')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'registrations' ? 'bg-[#12233D] text-white' : 'text-[#12233D] hover:bg-slate-50'
          }`}
        >
          Tenant registrations
        </button>
        <button
          type="button"
          onClick={() => setTab('team-joins')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'team-joins' ? 'bg-[#12233D] text-white' : 'text-[#12233D] hover:bg-slate-50'
          }`}
        >
          Team join requests
        </button>
      </div>

      {tab === 'registrations' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusFilterTabs value={regStatus} onChange={handleRegStatusChange} />
          <DebouncedSearchField
            value={regSearch}
            onChange={(value) => {
              setRegSearch(value);
              setRegPage(0);
            }}
            placeholder="Search by name or email…"
            aria-label="Search tenant registrations"
            className="w-full sm:max-w-sm"
          />
        </div>
      ) : activeTenant ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusFilterTabs value={joinStatus} onChange={handleJoinStatusChange} />
          <DebouncedSearchField
            value={joinSearch}
            onChange={(value) => {
              setJoinSearch(value);
              setJoinPage(0);
            }}
            placeholder="Search by name, email, or team…"
            aria-label="Search team join requests"
            className="w-full sm:max-w-sm"
          />
        </div>
      ) : null}

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
              {
                id: 'player',
                header: 'Player',
                cell: (row) =>
                  row.user_id ? (
                    <Link
                      to={`/dashboard/users/${row.user_id}`}
                      className="font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
                    >
                      {row.user_name}
                    </Link>
                  ) : (
                    row.user_name
                  ),
              },
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
                id: 'idDocument',
                header: 'ID document',
                cell: (row) =>
                  row.id_document ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReceiptTarget({
                          title: `${row.user_name} — ID document`,
                          receipt: row.id_document,
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
                id: 'studentFee',
                header: 'Student fee',
                cell: (row) => (row.is_student_fee ? <StudentFeeBadge /> : '—'),
              },
              {
                id: 'studyDocument',
                header: 'Study document',
                cell: (row) =>
                  row.study_document ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReceiptTarget({
                          title: `${row.user_name} — study document`,
                          receipt: row.study_document,
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
                        onClick={() => setApproveRegTarget(row)}
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
            emptyMessage={
              regStatus === 'all'
                ? 'No registration requests found.'
                : `No ${regStatus} registration requests found.`
            }
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
            {
              id: 'player',
              header: 'Player',
              cell: (row: TeamJoinApplication) =>
                row.user_id ? (
                  <Link
                    to={`/dashboard/users/${row.user_id}`}
                    className="font-medium text-[#12233D] underline-offset-2 hover:text-[#E8A93B] hover:underline"
                  >
                    {row.user_name}
                  </Link>
                ) : (
                  row.user_name
                ),
            },
            { id: 'email', header: 'Email', cell: (row) => row.user_email },
            {
              id: 'team',
              header: 'Team',
              cell: (row) =>
                row.team ? (
                  <Link
                    to={`/dashboard/teams/${row.team}/roster`}
                    className="text-[#12233D] underline-offset-2 hover:underline"
                  >
                    {row.team_name}
                  </Link>
                ) : (
                  row.team_name
                ),
            },
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
              id: 'idDocument',
              header: 'ID document',
              cell: (row) =>
                row.resolved_id_document_url ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReceiptTarget({
                        title: `${row.user_name} — ID document`,
                        receipt: row.resolved_id_document_url,
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
              id: 'studentFee',
              header: 'Student fee',
              cell: (row) => (row.is_student_fee ? <StudentFeeBadge /> : '—'),
            },
            {
              id: 'studyDocument',
              header: 'Study document',
              cell: (row) =>
                row.study_document ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReceiptTarget({
                        title: `${row.user_name} — study document`,
                        receipt: row.study_document,
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
                      disabled={reviewTeamJoin.isPending}
                      onClick={() => setApproveJoinTarget(row)}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={reviewTeamJoin.isPending}
                      onClick={() => {
                        setRejectJoinTarget(row);
                        setRejectJoinReason('');
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
          data={teamJoins.data?.results ?? []}
          loading={teamJoins.isLoading}
          emptyMessage={
            joinStatus === 'all'
              ? 'No team join requests found.'
              : `No ${joinStatus} team join requests found.`
          }
          pagination={
            teamJoins.data
              ? { pageIndex: joinPage, pageSize: PAGE_SIZE, totalCount: teamJoins.data.count }
              : undefined
          }
          onPaginationChange={({ pageIndex }) => setJoinPage(pageIndex)}
        />
      )}

      <Modal
        open={rejectTarget !== null}
        onOpenChange={(next) => {
          if (!next) setRejectTarget(null);
        }}
        title="Reject registration"
      >
        <p className="mt-2 text-sm text-muted-foreground">
          Rejecting {rejectTarget?.user_name}&apos;s request for {rejectTarget?.tenant_name}.
        </p>
        <div className="mt-4 space-y-4">
          <Input
            label="Reason (optional)"
            value={rejectReason}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRejectReason(event.target.value)
            }
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={reviewRegistration.isPending}
              onClick={handleRejectRegistration}
              className="w-full sm:w-auto"
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      <ReceiptPanel
        open={receiptTarget !== null}
        title={receiptTarget?.title ?? ''}
        receipt={receiptTarget?.receipt ?? null}
        onClose={() => setReceiptTarget(null)}
      />

      <ConfirmDialog
        open={approveRegTarget !== null}
        onOpenChange={(open) => {
          if (!open) setApproveRegTarget(null);
        }}
        title="Approve tenant registration?"
        description={
          approveRegTarget
            ? `Approve ${approveRegTarget.user_name} (${approveRegTarget.user_email}) to join ${approveRegTarget.tenant_name}. Paid: ${approveRegTarget.is_paid ? 'Yes' : 'No'}.`
            : ''
        }
        confirmLabel="Approve"
        isLoading={reviewRegistration.isPending}
        onConfirm={() => {
          if (!approveRegTarget) return;
          reviewRegistration.mutate(
            { id: approveRegTarget.id, action: 'approve' },
            { onSuccess: () => setApproveRegTarget(null) }
          );
        }}
      />

      <Modal
        open={rejectJoinTarget !== null}
        onOpenChange={(next) => {
          if (!next) setRejectJoinTarget(null);
        }}
        title="Reject team join request"
      >
        <p className="mt-2 text-sm text-muted-foreground">
          Rejecting {rejectJoinTarget?.user_name}&apos;s request to join{' '}
          {rejectJoinTarget?.team_name}.
        </p>
        <div className="mt-4 space-y-4">
          <Input
            label="Reason (optional)"
            value={rejectJoinReason}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRejectJoinReason(event.target.value)
            }
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectJoinTarget(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={reviewTeamJoin.isPending}
              onClick={handleRejectTeamJoin}
              className="w-full sm:w-auto"
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={approveJoinTarget !== null}
        onOpenChange={(open) => {
          if (!open) setApproveJoinTarget(null);
        }}
        title="Approve team join request?"
        description={
          approveJoinTarget
            ? `Approve ${approveJoinTarget.user_name} (${approveJoinTarget.user_email}) joining ${approveJoinTarget.team_name}. Paid: ${approveJoinTarget.is_paid ? 'Yes' : 'No'}.`
            : ''
        }
        confirmLabel="Approve"
        isLoading={reviewTeamJoin.isPending}
        onConfirm={() => {
          if (!approveJoinTarget) return;
          reviewTeamJoin.mutate(
            { id: approveJoinTarget.id, action: 'approve' },
            { onSuccess: () => setApproveJoinTarget(null) }
          );
        }}
      />
    </div>
  );
}
