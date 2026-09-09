import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/forms/PageHeader';
import { PICKER_LIST_PARAMS } from '@/api/pagination';
import { useTournaments } from '@/hooks/useTournaments';
import {
  useDeleteJerseyWindow,
  useJerseyOrders,
  useJerseyWindows,
  useOpenJerseyWindow,
  useReviewJerseyOrder,
  useUpdateJerseyWindow,
} from '@/hooks/useJersey';
import type { JerseyOrder, JerseyWindow } from '@/api/jersey';
import { getApiErrorMessage } from '@/lib/api-errors';
import { cn } from '@/lib/utils';

function WindowStatus({ window }: { window: JerseyWindow }) {
  const open = new Date(window.to_date_time).getTime() >= Date.now();
  return (
    <span className={open ? 'text-green-700' : 'text-gray-500'}>
      {open ? 'Open' : 'Closed'}
    </span>
  );
}

function OrderStatus({ status }: { status: JerseyOrder['status'] }) {
  return (
    <span
      className={cn(
        status === 'Approved' && 'text-green-700',
        status === 'Rejected' && 'text-red-600',
        status === 'Pending' && 'text-amber-700'
      )}
    >
      {status}
    </span>
  );
}

type WindowFormState = {
  tournament: string;
  fromDateTime: string;
  toDateTime: string;
  description: string;
};

const emptyForm: WindowFormState = {
  tournament: '',
  fromDateTime: '',
  toDateTime: '',
  description: '',
};

function toInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function JerseyPage() {
  const [selectedWindowId, setSelectedWindowId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWindow, setEditingWindow] = useState<JerseyWindow | null>(null);
  const [form, setForm] = useState<WindowFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<JerseyWindow | null>(null);
  const [reviewMessage, setReviewMessage] = useState<Record<number, string>>({});

  const windowsQuery = useJerseyWindows();
  const windows = windowsQuery.data?.results ?? [];
  const selectedWindow = windows.find((w) => w.id === selectedWindowId) ?? windows[0] ?? null;

  const ordersQuery = useJerseyOrders(
    selectedWindow ? { tournament: selectedWindow.tournament.id } : undefined
  );
  const orders = (ordersQuery.data?.results ?? []).filter(
    (o) => selectedWindow && o.jersey_request.id === selectedWindow.id
  );

  const tournamentsQuery = useTournaments(PICKER_LIST_PARAMS);
  const tournaments = tournamentsQuery.data?.results ?? [];

  const openMutation = useOpenJerseyWindow();
  const updateMutation = useUpdateJerseyWindow();
  const deleteMutation = useDeleteJerseyWindow();
  const reviewMutation = useReviewJerseyOrder();

  function openCreate() {
    setEditingWindow(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(window: JerseyWindow) {
    setEditingWindow(window);
    setForm({
      tournament: window.tournament.id,
      fromDateTime: toInputValue(window.from_date_time),
      toDateTime: toInputValue(window.to_date_time),
      description: window.description ?? '',
    });
    setShowForm(true);
  }

  function submitForm(event: FormEvent) {
    event.preventDefault();
    if (!form.tournament || !form.fromDateTime || !form.toDateTime) {
      toast.error('Pick a tournament and the opening and closing times.');
      return;
    }
    if (new Date(form.toDateTime).getTime() <= new Date(form.fromDateTime).getTime()) {
      toast.error('The window must close after it opens.');
      return;
    }
    const payload = {
      tournament: form.tournament,
      from_date_time: new Date(form.fromDateTime).toISOString(),
      to_date_time: new Date(form.toDateTime).toISOString(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };
    if (editingWindow) {
      updateMutation.mutate(
        { windowId: editingWindow.id, payload },
        {
          onSuccess: () => {
            setShowForm(false);
            toast.success('Ordering window updated.');
          },
          onError: (error) => toast.error(getApiErrorMessage(error, 'Request failed.')),
        }
      );
    } else {
      openMutation.mutate(payload, {
        onSuccess: () => {
          setShowForm(false);
          toast.success('Ordering window opened.');
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Request failed.')),
      });
    }
  }

  function review(orderId: number, status: 'Approved' | 'Rejected') {
    const message = (reviewMessage[orderId] ?? '').trim();
    reviewMutation.mutate(
      {
        player_jersey_request: orderId,
        status,
        ...(message ? { message } : {}),
      },
      {
        onSuccess: () => toast.success(`Order ${status.toLowerCase()}.`),
        onError: (error) => toast.error(getApiErrorMessage(error, 'Request failed.')),
      }
    );
  }

  if (windowsQuery.isError && !windowsQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load order windows. Admin access is required.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jersey orders"
        description="Open ordering windows per tournament, then approve or reject the numbers players request."
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Open window
          </Button>
        }
      />

      {windowsQuery.isLoading && !windowsQuery.data ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : (
        <DataTable
          columns={[
            {
              id: 'tournament',
              header: 'Tournament',
              cell: (row) => row.tournament.name,
            },
            {
              id: 'opens',
              header: 'Opens',
              cell: (row) => new Date(row.from_date_time).toLocaleString(),
            },
            {
              id: 'closes',
              header: 'Closes',
              cell: (row) => new Date(row.to_date_time).toLocaleString(),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (row) => <WindowStatus window={row} />,
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedWindowId(row.id)}>
                    Orders
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={windows}
          emptyMessage="No ordering windows yet."
        />
      )}

      {showForm ? (
        <form
          onSubmit={submitForm}
          className="max-w-xl space-y-4 rounded-lg border p-4"
        >
          <h2 className="text-sm font-semibold">
            {editingWindow ? 'Edit ordering window' : 'Open ordering window'}
          </h2>
          <label className="block text-sm">
            Tournament
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={form.tournament}
              onChange={(e) => setForm({ ...form, tournament: e.target.value })}
            >
              <option value="">Select a tournament…</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Opens
            <Input
              type="datetime-local"
              value={form.fromDateTime}
              onChange={(e) => setForm({ ...form, fromDateTime: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Closes
            <Input
              type="datetime-local"
              value={form.toDateTime}
              onChange={(e) => setForm({ ...form, toDateTime: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Note (optional)
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={openMutation.isPending || updateMutation.isPending}
            >
              {editingWindow ? 'Save window' : 'Open window'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {selectedWindow ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">
            Orders — {selectedWindow.tournament.name}
          </h2>
          {ordersQuery.isLoading && !ordersQuery.data ? (
            <div className="flex min-h-[10vh] items-center justify-center">
              <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  id: 'player',
                  header: 'Player',
                  cell: (row) => row.player.full_name,
                },
                {
                  id: 'number',
                  header: 'Number',
                  cell: (row) => row.jersey_number,
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: (row) => <OrderStatus status={row.status} />,
                },
                {
                  id: 'message',
                  header: 'Message',
                  cell: (row) => (
                    <Input
                      aria-label={`Message for order ${row.id}`}
                      placeholder="Optional note…"
                      value={reviewMessage[row.id] ?? ''}
                      onChange={(e) =>
                        setReviewMessage({ ...reviewMessage, [row.id]: e.target.value })
                      }
                    />
                  ),
                },
                {
                  id: 'review',
                  header: 'Review',
                  cell: (row) =>
                    row.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => review(row.id, 'Approved')}
                          disabled={reviewMutation.isPending}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => review(row.id, 'Rejected')}
                          disabled={reviewMutation.isPending}
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {row.status_message || '—'}
                      </span>
                    ),
                },
              ]}
              data={orders}
              emptyMessage="No orders in this window yet."
            />
          )}
        </section>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this ordering window?"
        description={
          deleteTarget
            ? `Orders in ${deleteTarget.tournament.name} go with it. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete window"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              toast.success('Ordering window deleted.');
            },
            onError: (error) => toast.error(getApiErrorMessage(error, 'Request failed.')),
          });
        }}
      />
    </div>
  );
}
