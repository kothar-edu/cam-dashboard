import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useTenant } from '@/contexts/TenantContext';
import { useGameConfig, useUpdateGameConfig } from '@/hooks/useGameConfig';

export default function GameSettingsPage() {
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(
      {
        is_registration_open: isRegistrationOpen,
        is_voting_open: isVotingOpen,
      },
      {
        onSuccess: () => toast.success('Game settings saved.'),
        onError: () => toast.error('Failed to save game settings.'),
      }
    );
  };

  return (
    <TenantRequired message="Choose a tenant from the header to manage game settings.">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Game settings</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant?.name} · registration and voting feature toggles
          </p>
        </div>

        {isLoading && !data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load game configuration.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6">
            <label className="flex items-center justify-between gap-4 rounded-md border p-4">
              <div>
                <p className="text-sm font-medium text-[#12233D]">Registration open</p>
                <p className="text-xs text-muted-foreground">
                  Show registration banner and allow new player sign-ups.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isRegistrationOpen}
                onChange={(e) => setIsRegistrationOpen(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border p-4">
              <div>
                <p className="text-sm font-medium text-[#12233D]">Voting open</p>
                <p className="text-xs text-muted-foreground">
                  Show the voting banner in the mobile app and allow ballots only when both this switch and an
                  individual poll are open.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isVotingOpen}
                onChange={(e) => setIsVotingOpen(e.target.checked)}
              />
            </label>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save game settings'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
