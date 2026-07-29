import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { PageHeader } from '@/components/forms/PageHeader';
import { useGameConfig, useUpdateGameConfig } from '@/hooks/useGameConfig';

type BoundaryLabelsPageProps = {
  embedded?: boolean;
};

export default function BoundaryLabelsPage({ embedded = false }: BoundaryLabelsPageProps) {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useGameConfig();
  const updateMutation = useUpdateGameConfig();
  const [fourLabel, setFourLabel] = useState('');
  const [sixLabel, setSixLabel] = useState('');

  useEffect(() => {
    if (data) {
      setFourLabel(data.four_boundary_label ?? '');
      setSixLabel(data.six_boundary_label ?? '');
    }
  }, [data]);

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to edit boundary labels.
        </p>
      </div>
    );
  }

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
        Unable to load game configuration. Check your API connection and tenant access.
      </div>
    );
  }

  const fourDisplay = fourLabel.trim() || '4';
  const sixDisplay = sixLabel.trim() || '6';
  const dirty =
    data != null &&
    (fourLabel !== (data.four_boundary_label ?? '') ||
      sixLabel !== (data.six_boundary_label ?? ''));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(
      {
        four_boundary_label: fourLabel,
        six_boundary_label: sixLabel,
      },
      {
        onSuccess: () => toast.success('Boundary labels saved.'),
        onError: () => toast.error('Failed to save boundary labels.'),
      }
    );
  };

  return (
    <div className="space-y-5 bg-white p-2">
      {embedded ? (
        <p className="text-sm text-muted-foreground">
          Custom four and six commentary text for live scoring in {activeTenant.name}.
        </p>
      ) : (
        <PageHeader
          title="Boundary Labels"
          description={`${activeTenant.name} · custom four and six commentary text for live scoring`}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 col-span-3">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <label htmlFor="four-boundary-label" className="text-sm font-semibold text-[#12233D]">
              Four boundary label
            </label>
            <Input
              id="four-boundary-label"
              value={fourLabel}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setFourLabel(event.target.value)}
              placeholder="e.g. That's a boundary!"
            />
            <p className="text-xs text-muted-foreground">
              Shown when a batter hits four runs. Leave blank to show &quot;4&quot;.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <label htmlFor="six-boundary-label" className="text-sm font-semibold text-[#12233D]">
              Six boundary label
            </label>
            <Input
              id="six-boundary-label"
              value={sixLabel}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSixLabel(event.target.value)}
              placeholder="e.g. Maximum!"
            />
            <p className="text-xs text-muted-foreground">
              Shown when a batter hits six runs. Leave blank to show &quot;6&quot;.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={updateMutation.isPending || !dirty}>
              {updateMutation.isPending ? 'Saving…' : 'Save labels'}
            </Button>
            {dirty ? (
              <p className="text-xs text-muted-foreground">You have unsaved changes.</p>
            ) : null}
          </div>
        </form>

        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-[#12233D] text-white shadow-sm col-span-2">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#E8A93B]">
              Live preview
            </p>
            <p className="mt-0.5 text-xs text-white/60">How chips appear in commentary</p>
          </div>
          <div className="space-y-4 p-4">
            <PreviewRow label="Four" value={fourDisplay} accent="four" />
            <PreviewRow label="Six" value={sixDisplay} accent="six" />
            {/*<div className="rounded-lg bg-white/5 px-3 py-2.5">*/}
            {/*  <p className="text-[11px] text-white/50">Sample ball strip</p>*/}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {/*    <MiniChip>.</MiniChip>*/}
              {/*    <MiniChip>1</MiniChip>*/}
              <MiniChip accent="four">{fourDisplay}</MiniChip>
              {/*    <MiniChip>W</MiniChip>*/}
              <MiniChip accent="six">{sixDisplay}</MiniChip>
            </div>
            {/*</div>*/}
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'four' | 'six';
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-white/60">{label}</span>
      <span
        className={
          accent === 'six'
            ? 'max-w-[12rem] truncate rounded-full bg-[#E8A93B] px-3 py-1 text-xs font-bold text-[#12233D]'
            : 'max-w-[12rem] truncate rounded-full bg-sky-400 px-3 py-1 text-xs font-bold text-[#12233D]'
        }
      >
        {value}
      </span>
    </div>
  );
}

function MiniChip({ children, accent }: { children: string; accent?: 'four' | 'six' }) {
  if (accent === 'four') {
    return (
      <span className="max-w-[6rem] truncate rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-bold text-[#12233D]">
        {children}
      </span>
    );
  }
  if (accent === 'six') {
    return (
      <span className="max-w-[6rem] truncate rounded-full bg-[#E8A93B] px-2 py-0.5 text-[10px] font-bold text-[#12233D]">
        {children}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
      {children}
    </span>
  );
}
