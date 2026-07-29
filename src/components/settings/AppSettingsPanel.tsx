import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useGameConfig, useUpdateGameConfig } from '@/hooks/useGameConfig';
import { cn } from '@/lib/utils';

export function AppSettingsPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#12233D]">App settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Feature toggles for the mobile app.
        </p>
      </div>
      <FeatureTogglesPanel />
    </div>
  );
}

function FeatureTogglesPanel() {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useGameConfig();
  const updateMutation = useUpdateGameConfig();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setIsRegistrationOpen(data.is_registration_open);
      setIsVotingOpen(data.is_voting_open);
    }
  }, [data]);

  if (!activeTenant) {
    return <TenantNeededMessage topic="app settings" />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(
      {
        is_registration_open: isRegistrationOpen,
        is_voting_open: isVotingOpen,
      },
      {
        onSuccess: () => toast.success('App settings saved.'),
        onError: () => toast.error('Failed to save app settings.'),
      }
    );
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load app configuration.
      </div>
    );
  }

  const dirty =
    data != null &&
    (isRegistrationOpen !== data.is_registration_open || isVotingOpen !== data.is_voting_open);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatusChip
          label="Registration"
          open={isRegistrationOpen}
          openText="Registration open banner shown"
          closedText="Registration open banner hidden"
        />
        <StatusChip
          label="Voting banner"
          open={isVotingOpen}
          openText="Master switch on"
          closedText="Master switch off"
        />
      </div>

      <div className="space-y-3">
        <ToggleRow
          title="Registration open"
          description="Show the registration banner and allow new player sign-ups in the app."
          checked={isRegistrationOpen}
          onChange={setIsRegistrationOpen}
        />
        <ToggleRow
          title="Voting open"
          description="Organization-wide voting banner. Individual polls must also be open to accept ballots."
          checked={isVotingOpen}
          onChange={setIsVotingOpen}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <Button type="submit" disabled={updateMutation.isPending || !dirty}>
          {updateMutation.isPending ? 'Saving…' : 'Save app settings'}
        </Button>
        {dirty ? (
          <p className="text-xs text-muted-foreground">You have unsaved changes.</p>
        ) : (
          <p className="text-xs text-muted-foreground">All changes saved.</p>
        )}
      </div>
    </form>
  );
}

function StatusChip({
  label,
  open,
  openText,
  closedText,
}: {
  label: string;
  open: boolean;
  openText: string;
  closedText: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 shadow-sm',
        open ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#12233D]">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            open ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
        {open ? openText : closedText}
      </p>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#E8A93B]/40">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#12233D]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-[#12233D]' : 'bg-slate-200'
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
            checked && 'translate-x-5 bg-[#E8A93B]'
          )}
        />
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
    </label>
  );
}

export function PanelIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold text-[#12233D]">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function TenantNeededMessage({ topic }: { topic: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm font-medium text-[#12233D]">Select an organization</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a tenant from the header to manage {topic}.
      </p>
    </div>
  );
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">{children}</div>
  );
}

export function SettingsSummaryChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="text-[#E8A93B]">{icon}</span>
        {label}
      </div>
      <p className="text-xl font-bold tabular-nums text-[#12233D]">{value}</p>
    </div>
  );
}

export function SettingsEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
      <p className="text-sm font-semibold text-[#12233D]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
