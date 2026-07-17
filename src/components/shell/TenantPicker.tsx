import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { useTenant } from '@/contexts/TenantContext';

export function TenantPicker() {
  const { tenants, activeTenantId, setActiveTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Organization</span>
      <SearchableSelect
        value={activeTenantId ?? ''}
        onChange={setActiveTenantId}
        options={tenants.map((tenant) => ({
          value: tenant.schema_name,
          label: tenant.name,
        }))}
        placeholder="Select organization"
        searchable
        className="w-56 space-y-0"
        triggerClassName="h-9"
      />
    </div>
  );
}
