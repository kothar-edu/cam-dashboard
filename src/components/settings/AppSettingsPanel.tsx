import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useGameConfig, useUpdateGameConfig } from '@/hooks/useGameConfig';

export function AppSettingsPanel() {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PanelIntro
        title="App settings"
        description={`${activeTenant.name} · organization-wide feature toggles for the mobile app`}
      />
      <ToggleRow
        title="Registration open"
        description="Show registration banner and allow new player sign-ups."
        checked={isRegistrationOpen}
        onChange={setIsRegistrationOpen}
      />
      <ToggleRow
        title="Voting open"
        description="Master switch for the voting banner. Individual polls must also be open to accept ballots."
        checked={isVotingOpen}
        onChange={setIsVotingOpen}
      />
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Saving…' : 'Save app settings'}
      </Button>
    </form>
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
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-[#E8A93B]/40">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#12233D]">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
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
