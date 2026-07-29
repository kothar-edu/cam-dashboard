import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, ExternalLink, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { SettingsEmptyState } from '@/components/settings/AppSettingsPanel';
import BoundaryLabelsPage from '@/pages/BoundaryLabelsPage';
import { useTenant } from '@/contexts/TenantContext';
import { useDeleteSponsor, useSponsors } from '@/hooks/useSponsors';
import type { Sponsor } from '@/api/sponsors';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type SponsorsTab = 'sponsors' | 'boundary-labels';

const TAB_ALIASES: Record<string, SponsorsTab> = {
  sponsors: 'sponsors',
  'boundary-labels': 'boundary-labels',
  boundary: 'boundary-labels',
  labels: 'boundary-labels',
};

const TIER_STYLES: Record<string, string> = {
  Title: 'bg-[#E8A93B]/20 text-[#8a5b00]',
  Gold: 'bg-amber-100 text-amber-800',
  Silver: 'bg-slate-200 text-slate-700',
  Bronze: 'bg-orange-100 text-orange-800',
  General: 'bg-[#12233D]/8 text-[#12233D]',
};

export default function SponsorsPage() {
  const { activeTenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') ?? 'sponsors';
  const activeTab = TAB_ALIASES[rawTab] ?? 'sponsors';

  const setTab = (tab: SponsorsTab) => {
    if (tab === 'sponsors') {
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ tab }, { replace: true });
  };

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load sponsors.
        </p>
      </div>
    );
  }

  const newSponsorLink = (
    <Link
      to="/dashboard/sponsors/new"
      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#12233D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1a3358]"
    >
      <Plus className="h-4 w-4" />
      New sponsor
    </Link>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sponsors"
        description={
          activeTab === 'boundary-labels'
            ? `${activeTenant.name} · boundary labels for live scoring`
            : `${activeTenant.name} · league sponsors`
        }
        action={activeTab === 'sponsors' ? newSponsorLink : undefined}
      />

      <div
        role="tablist"
        aria-label="Sponsors sections"
        className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
      >
        <TabButton
          active={activeTab === 'sponsors'}
          onClick={() => setTab('sponsors')}
          icon={<Award className="h-3.5 w-3.5" />}
        >
          Sponsors
        </TabButton>
        <TabButton
          active={activeTab === 'boundary-labels'}
          onClick={() => setTab('boundary-labels')}
          icon={<Tag className="h-3.5 w-3.5" />}
        >
          Boundary labels
        </TabButton>
      </div>

      {activeTab === 'boundary-labels' ? (
        <BoundaryLabelsPage embedded />
      ) : (
        <SponsorsList newSponsorLink={newSponsorLink} />
      )}
    </div>
  );
}

function SponsorsList({ newSponsorLink }: { newSponsorLink: ReactNode }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<Sponsor | null>(null);
  const { data, isLoading, isError } = useSponsors({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  });
  const deleteSponsor = useDeleteSponsor();

  const sponsors = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sponsor of sponsors) {
      counts[sponsor.sponsor_type] = (counts[sponsor.sponsor_type] ?? 0) + 1;
    }
    return counts;
  }, [sponsors]);

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
        Unable to load sponsors. Check your API connection and tenant access.
      </div>
    );
  }

  if (sponsors.length === 0 && pageIndex === 0) {
    return (
      <SettingsEmptyState
        title="No sponsors yet"
        description="Add sponsor logos and tiers to feature partners in the mobile app."
        action={newSponsorLink}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryChip
          icon={<Award className="h-3.5 w-3.5" />}
          label="Sponsors"
          value={String(totalCount)}
        />
        {(['Title', 'Gold', 'Silver'] as const).map((tier) => (
          <SummaryChip
            key={tier}
            icon={<span className="text-[10px] font-bold">{tier[0]}</span>}
            label={tier}
            value={String(tierCounts[tier] ?? 0)}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sponsors.map((sponsor) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            onDelete={() => {
              setTargetRow(sponsor);
              setConfirmOpen(true);
            }}
          />
        ))}
      </div>

      {totalCount > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-muted-foreground">
            Page {pageIndex + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <PaginationButton
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              Previous
            </PaginationButton>
            <PaginationButton
              disabled={pageIndex + 1 >= totalPages}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
            </PaginationButton>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this sponsor?"
        description="This will permanently remove the sponsor. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteSponsor.isPending}
        onConfirm={() => {
          if (!targetRow) return;
          deleteSponsor.mutate(targetRow.id, { onSuccess: () => setConfirmOpen(false) });
        }}
      />
    </div>
  );
}

function SummaryChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-[#E8A93B]">{icon}</span>
        {label}
      </div>
      <p className="text-xl font-bold tabular-nums text-[#12233D]">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-[#12233D] text-white shadow-sm' : 'text-muted-foreground hover:text-[#12233D]'
      )}
    >
      <span className={active ? 'text-[#E8A93B]' : undefined}>{icon}</span>
      {children}
    </button>
  );
}

function SponsorCard({ sponsor, onDelete }: { sponsor: Sponsor; onDelete: () => void }) {
  const tierClass = TIER_STYLES[sponsor.sponsor_type] ?? TIER_STYLES.General;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition hover:border-[#E8A93B]/50 hover:shadow-md">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-5">
        {sponsor.image ? (
          <img
            src={sponsor.image}
            alt={sponsor.name}
            className="max-h-20 max-w-full object-contain"
          />
        ) : (
          <Award className="h-10 w-10 text-slate-300" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-sm font-semibold leading-snug text-[#12233D]">
            {sponsor.name}
          </h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              tierClass
            )}
          >
            {sponsor.sponsor_type}
          </span>
        </div>
        {sponsor.supported_url ? (
          <a
            href={sponsor.supported_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 truncate text-xs text-[#12233D]/70 hover:text-[#12233D]"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{sponsor.supported_url.replace(/^https?:\/\//, '')}</span>
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">No website</p>
        )}
        <div className="mt-auto flex gap-1.5 border-t border-slate-100 pt-3">
          <Link
            to={`/dashboard/sponsors/${sponsor.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-[#12233D] transition hover:border-[#E8A93B]/50 hover:bg-[#E8A93B]/5"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#12233D]',
        disabled ? 'opacity-40' : 'hover:border-[#E8A93B]/50 hover:bg-[#E8A93B]/5'
      )}
    >
      {children}
    </button>
  );
}
