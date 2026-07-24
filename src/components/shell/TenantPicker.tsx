import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { useTenant } from '@/contexts/TenantContext';

export function TenantPicker() {
  const { tenants, activeTenantId, setActiveTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
      <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
        Organization
      </span>
      <SearchableSelect
        value={activeTenantId ?? ''}
        onChange={setActiveTenantId}
        options={tenants.map((tenant) => ({
          value: tenant.schema_name,
          label: tenant.name,
        }))}
        placeholder="Organization"
        searchable
        className="min-w-0 flex-1 space-y-0 sm:w-56 sm:flex-initial"
        triggerClassName="h-9 w-full"
      />
    </div>
  );
}
