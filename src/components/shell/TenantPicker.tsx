import { useTenant } from '@/contexts/TenantContext';

export function TenantPicker() {
  const { tenants, activeTenantId, setActiveTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Organization</span>
      <select
        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        value={activeTenantId ?? ''}
        onChange={(event) => setActiveTenantId(event.target.value)}
      >
        <option value="" disabled>
          Select organization
        </option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.schema_name}>
            {tenant.name}
          </option>
        ))}
      </select>
    </label>
  );
}
