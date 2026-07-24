import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import {
  useAssignTenantAdmin,
  useCreateTenant,
  useRevokeTenantAdmin,
  useTenantMemberships,
} from '@/hooks/useTenantAdmin';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { UserEmailLookupField } from '@/components/forms/UserEmailLookupField';

export default function TenantsPage() {
  const { canManageTenants } = useAuth();
  const { tenants, loading: tenantsLoading } = useTenant();
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>(undefined);
  const [newTenantName, setNewTenantName] = useState('');
  const [newSchemaName, setNewSchemaName] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [resolvedAdminLabel, setResolvedAdminLabel] = useState('');

  const memberships = useTenantMemberships(selectedTenantId);
  const createTenantMutation = useCreateTenant();
  const assignAdminMutation = useAssignTenantAdmin();
  const revokeAdminMutation = useRevokeTenantAdmin();

  if (!canManageTenants) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Only global administrators can manage tenants and tenant admin assignments.
      </div>
    );
  }

  const handleCreateTenant = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTenantName.trim() || !newSchemaName.trim()) return;
    createTenantMutation.mutate(
      { name: newTenantName.trim(), schema_name: newSchemaName.trim() },
      {
        onSuccess: () => {
          setNewTenantName('');
          setNewSchemaName('');
        },
      }
    );
  };

  const handleAssignAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTenantId || !adminUserId.trim()) return;
    assignAdminMutation.mutate(
      { user: adminUserId.trim(), tenant: selectedTenantId },
      {
        onSuccess: () => {
          setAdminUserId('');
          setResolvedAdminLabel('');
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Tenants</h1>
        <p className="text-sm text-muted-foreground">
          Create organizations and assign tenant administrators
        </p>
      </div>

      <form
        onSubmit={handleCreateTenant}
        className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
      >
        <h2 className="text-lg font-semibold text-[#12233D]">Create tenant</h2>
        <Input
          label="Organization name"
          value={newTenantName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNewTenantName(event.target.value)
          }
          required
        />
        <Input
          label="Schema name"
          value={newSchemaName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNewSchemaName(event.target.value)
          }
          placeholder="e.g. cam_youth_association"
          required
        />
        {createTenantMutation.isError ? (
          <p className="text-sm text-red-600">Failed to create tenant.</p>
        ) : null}
        {createTenantMutation.isSuccess ? (
          <p className="text-sm text-green-700">Tenant created.</p>
        ) : null}
        <Button type="submit" disabled={createTenantMutation.isPending}>
          {createTenantMutation.isPending ? 'Creating…' : 'Create tenant'}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#12233D]">Tenant admin assignments</h2>

        <SearchableSelect
          id="tenant-select"
          label="Organization"
          value={selectedTenantId?.toString() ?? ''}
          onChange={(value) =>
            setSelectedTenantId(value ? Number(value) : undefined)
          }
          options={tenants.map((tenant) => ({
            value: String(tenant.id),
            label: tenant.name,
          }))}
          placeholder="Select tenant"
          searchable
          className="max-w-md"
        />

        {tenantsLoading ? (
          <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
        ) : selectedTenantId ? (
          <>
            <form
              onSubmit={handleAssignAdmin}
              className="max-w-2xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
            >
              <UserEmailLookupField
                onResolved={(user) => {
                  setAdminUserId(user.id);
                  setResolvedAdminLabel(`${user.full_name} (${user.email})`);
                }}
                onClear={() => {
                  setAdminUserId('');
                  setResolvedAdminLabel('');
                }}
              />
              {resolvedAdminLabel ? (
                <p className="text-sm text-green-700">Selected: {resolvedAdminLabel}</p>
              ) : null}
              <Button type="submit" disabled={assignAdminMutation.isPending || !adminUserId}>
                Assign tenant admin
              </Button>
            </form>

            {memberships.isLoading && !memberships.data ? (
              <div className="flex min-h-[20vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
              </div>
            ) : memberships.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load tenant memberships.
              </div>
            ) : (
              <DataTable
                columns={[
                  { id: 'email', header: 'Admin email', cell: (row) => row.user_email },
                  { id: 'role', header: 'Role', cell: (row) => row.role },
                  {
                    id: 'created',
                    header: 'Assigned',
                    cell: (row) => new Date(row.created).toLocaleDateString(),
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    cell: (row) => (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={revokeAdminMutation.isPending}
                        onClick={() =>
                          revokeAdminMutation.mutate({
                            membershipId: row.id,
                            tenantId: selectedTenantId,
                          })
                        }
                      >
                        Revoke
                      </Button>
                    ),
                  },
                ]}
                data={memberships.data?.results ?? []}
                loading={memberships.isLoading}
                emptyMessage="No tenant admins assigned yet."
              />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a tenant to manage admins.</p>
        )}
      </div>
    </div>
  );
}
