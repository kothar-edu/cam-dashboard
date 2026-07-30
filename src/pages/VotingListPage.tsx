import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VotingPollCard } from '@/components/voting/VotingPollCard';
import {
  useNomineeVotingPlayers,
  useUpdateNomineeVotingPlayer,
  useVotingPolls,
} from '@/hooks/useVoting';
import { getApiErrorMessage } from '@/lib/api-errors';
import { findPollForNomination, summarizePolls } from '@/lib/voting';
import type { NomineeVotingPlayer } from '@/api/voting';
import { Vote, Users, Lock, Unlock } from 'lucide-react';

export default function VotingListPage() {
  const nominationsQuery = useNomineeVotingPlayers();
  const pollsQuery = useVotingPolls();
  const updateMutation = useUpdateNomineeVotingPlayer();
  const isLoading = nominationsQuery.isLoading || pollsQuery.isLoading;
  const isError = nominationsQuery.isError || pollsQuery.isError;

  const [confirmClose, setConfirmClose] = useState<NomineeVotingPlayer | null>(null);
  const [search, setSearch] = useState('');

  const filteredNominations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nominationsQuery.data?.results ?? [];
    return (nominationsQuery.data?.results ?? []).filter((row) => {
      const tournament = row.tournament?.name?.toLowerCase() ?? '';
      const nominees = (row.player ?? [])
        .map((p) => `${p.full_name ?? ''} ${p.team_name ?? ''}`.toLowerCase())
        .join(' ');
      return tournament.includes(q) || nominees.includes(q);
    });
  }, [nominationsQuery.data?.results, search]);

  const nominations = nominationsQuery.data?.results ?? [];
  const polls = pollsQuery.data?.results ?? [];
  const summary = summarizePolls(nominations, polls);

  const applyToggle = (row: NomineeVotingPlayer, nextOpen: boolean) => {
    updateMutation.mutate(
      {
        id: row.id,
        payload: { is_voting_open: nextOpen },
      },
      {
        onSuccess: () => {
          toast.success(nextOpen ? 'Voting opened for this poll.' : 'Voting closed for this poll.');
          setConfirmClose(null);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, 'Failed to update voting status.'));
        },
      }
    );
  };

  const requestToggle = (row: NomineeVotingPlayer) => {
    if (row.is_voting_open) {
      setConfirmClose(row);
      return;
    }
    applyToggle(row, true);
  };

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title="Voting polls"
          description="Tournament nominee polls with live standings. Organization-wide Voting open in Settings → App settings is the master switch."
          action={
            <Link
              to="/dashboard/voting/new"
              className="inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
            >
              Create nomination
            </Link>
          }
        />

        {isLoading && !nominationsQuery.data ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load voting polls.
          </div>
        ) : nominations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#12233D]">No voting nominations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a nomination list for a tournament to start collecting votes.
            </p>
            <Link
              to="/dashboard/voting/new"
              className="mt-4 inline-flex items-center rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white"
            >
              Create nomination
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryChip
                icon={<Vote className="h-3.5 w-3.5" />}
                label="Polls"
                value={String(summary.pollCount)}
              />
              <SummaryChip
                icon={<Unlock className="h-3.5 w-3.5" />}
                label="Open"
                value={String(summary.openCount)}
              />
              <SummaryChip
                icon={<Lock className="h-3.5 w-3.5" />}
                label="Closed"
                value={String(summary.closedCount)}
              />
              <SummaryChip
                icon={<Users className="h-3.5 w-3.5" />}
                label="Votes cast"
                value={String(summary.ballotCount)}
              />
            </div>

            <DebouncedSearchField
              value={search}
              onChange={setSearch}
              placeholder="Search polls by tournament or nominee…"
              aria-label="Search voting polls"
            />

            {filteredNominations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-muted-foreground">
                No polls match your search.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredNominations.map((nomination) => (
                  <VotingPollCard
                    key={nomination.id}
                    nomination={nomination}
                    poll={findPollForNomination(nomination, polls)}
                    onToggleVoting={() => requestToggle(nomination)}
                    togglePending={updateMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <ConfirmDialog
          open={Boolean(confirmClose)}
          onOpenChange={(open) => {
            if (!open) setConfirmClose(null);
          }}
          title="Close voting for this poll?"
          description={
            confirmClose
              ? `Voters will no longer be able to cast ballots for ${confirmClose.tournament.name} until you open it again.`
              : ''
          }
          confirmLabel="Close voting"
          isLoading={updateMutation.isPending}
          onConfirm={() => {
            if (confirmClose) applyToggle(confirmClose, false);
          }}
        />
      </div>
    </TenantRequired>
  );
}

function SummaryChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-[#E8A93B]">{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-bold tabular-nums text-[#12233D]">{value}</p>
    </div>
  );
}
