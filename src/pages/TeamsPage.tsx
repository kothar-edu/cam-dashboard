import { DataTable } from '@/components/data-table/DataTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTenant } from '@/contexts/TenantContext';
import { useTeams } from '@/hooks/useTeams';

export default function TeamsPage() {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useTeams();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load teams.
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
        Unable to load teams. Check your API connection and tenant access.
      </div>
    );
  }

  const teams = data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Teams</h1>
        <p className="text-sm text-muted-foreground">{activeTenant.name} · registered teams</p>
      </div>

      <DataTable
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'code', header: 'Abbreviation', cell: (row) => row.code },
          { id: 'players', header: 'Players', cell: (row) => row.total_players },
        ]}
        data={teams}
        loading={isLoading}
        emptyMessage="No teams found."
      />
    </div>
  );
}
