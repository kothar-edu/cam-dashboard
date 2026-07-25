import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { PageHeader } from '@/components/forms/PageHeader';
import { useGameConfig, useUpdateGameConfig } from '@/hooks/useGameConfig';

export default function BoundaryLabelsPage() {
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate({
      four_boundary_label: fourLabel,
      six_boundary_label: sixLabel,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boundary Labels"
        description={`${activeTenant.name} · custom four and six commentary text for live scoring`}
      />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6 rounded-lg border bg-white p-6">
        <div className="space-y-2">
          <label htmlFor="four-boundary-label" className="text-sm font-medium text-[#12233D]">
            Four boundary label
          </label>
          <Input
            id="four-boundary-label"
            value={fourLabel}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFourLabel(event.target.value)
            }
            placeholder="e.g. That's a boundary!"
          />
          <p className="text-xs text-muted-foreground">
            Shown when a batter hits four runs. Leave blank to show &quot;4&quot;.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="six-boundary-label" className="text-sm font-medium text-[#12233D]">
            Six boundary label
          </label>
          <Input
            id="six-boundary-label"
            value={sixLabel}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSixLabel(event.target.value)
            }
            placeholder="e.g. Maximum!"
          />
          <p className="text-xs text-muted-foreground">
            Shown when a batter hits six runs. Leave blank to show &quot;6&quot;.
          </p>
        </div>

        {updateMutation.isError ? (
          <p className="text-sm text-red-600">Failed to save boundary labels. Try again.</p>
        ) : null}

        {updateMutation.isSuccess ? (
          <p className="text-sm text-green-700">Boundary labels saved.</p>
        ) : null}

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save labels'}
        </Button>
      </form>
    </div>
  );
}
