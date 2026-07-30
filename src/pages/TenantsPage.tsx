import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  UserMinus,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DebouncedSearchField } from '@/components/forms/DebouncedSearchField';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PageHeader } from '@/components/forms/PageHeader';
import { SettingsEmptyState, SettingsSummaryChip } from '@/components/settings/AppSettingsPanel';
import {
  useAccessibleTenantsPaged,
  useAssignTenantAdmin,
  useCreateTenant,
  useRevokeTenantAdmin,
  useTenantMemberships,
} from '@/hooks/useTenantAdmin';
import { UserEmailLookupField } from '@/components/forms/UserEmailLookupField';
import { getApiErrorMessage } from '@/lib/api-errors';
import { cn } from '@/lib/utils';
import type { Tenant } from '@/api/tenants';
import type { TenantMembership } from '@/api/tenantAdmin';

type TenantsPageProps = {
  embedded?: boolean;
};

const PAGE_SIZE = 3;

export default function TenantsPage({ embedded = false }: TenantsPageProps) {
  const { canManageTenants } = useAuth();
  const { activeTenant } = useTenant();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [resolvedAdminLabel, setResolvedAdminLabel] = useState('');
  const [revokeTarget, setRevokeTarget] = useState<TenantMembership | null>(null);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  const tenantsQuery = useAccessibleTenantsPaged({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const tenants = tenantsQuery.data?.results ?? [];
  const totalCount = tenantsQuery.data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const selectedTenantId = selectedTenant?.id;
  const memberships = useTenantMemberships(selectedTenantId);
  const createTenantMutation = useCreateTenant();
  const assignAdminMutation = useAssignTenantAdmin();
  const revokeAdminMutation = useRevokeTenantAdmin();

  useEffect(() => {
    if (selectedTenant) return;
    if (activeTenant) {
      setSelectedTenant(activeTenant);
      return;
    }
    if (tenants[0]) setSelectedTenant(tenants[0]);
  }, [activeTenant, selectedTenant, tenants]);

  // Every tenant this endpoint returns is already is_active=True (base
  // queryset filter), so "active" always equals the total match count.
  const activeCount = totalCount;
  const adminCount = memberships.data?.count ?? memberships.data?.results?.length ?? 0;

  if (!canManageTenants) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Only global administrators can manage tenants and tenant admin assignments.
      </div>
    );
  }

  const handleCreateTenant = (event: FormEvent) => {
    event.preventDefault();
    if (!newTenantName.trim()) return;
    createTenantMutation.mutate(
      { name: newTenantName.trim() },
      {
        onSuccess: (tenant) => {
          setNewTenantName('');
          setShowCreate(false);
          setSelectedTenant(tenant);
          setSearch('');
          setPageIndex(0);
          toast.success(`Organization created · schema ${tenant.schema_name}`);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, 'Failed to create organization.'));
        },
      }
    );
  };

  const handleAssignAdmin = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTenantId || !adminUserId.trim()) return;
    assignAdminMutation.mutate(
      { user: adminUserId.trim(), tenant: selectedTenantId },
      {
        onSuccess: () => {
          setAdminUserId('');
          setResolvedAdminLabel('');
          toast.success('Tenant admin assigned.');
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, 'Failed to assign tenant admin.'));
        },
      }
    );
  };

  const createButton = (
    <Button type="button" onClick={() => setShowCreate((open) => !open)}>
      <Plus className="mr-1.5 h-4 w-4" />
      {showCreate ? 'Hide form' : 'New organization'}
    </Button>
  );

  return (
    <div className="space-y-5">
      {embedded ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Create organizations and assign tenant administrators for the platform.
          </p>
          {createButton}
        </div>
      ) : (
        <PageHeader
          title="Tenants"
          description="Create organizations and assign tenant administrators"
          action={createButton}
        />
      )}

      {showCreate ? (
        <form
          onSubmit={handleCreateTenant}
          className="space-y-4 rounded-xl border border-[#E8A93B]/30 bg-[#E8A93B]/5 p-4 sm:p-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-[#12233D]">Create organization</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter the display name. The technical schema id is generated automatically on the
              server.
            </p>
          </div>
          <Input
            label="Organization name"
            value={newTenantName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setNewTenantName(event.target.value)
            }
            placeholder="e.g. CAM Youth Association"
            required
          />
          <Button type="submit" disabled={createTenantMutation.isPending || !newTenantName.trim()}>
            {createTenantMutation.isPending ? 'Creating…' : 'Create organization'}
          </Button>
        </form>
      ) : null}

      {tenantsQuery.isLoading && !tenantsQuery.data && !debouncedSearch ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        </div>
      ) : totalCount === 0 && !debouncedSearch ? (
        <SettingsEmptyState
          title="No organizations yet"
          description="Create the first tenant schema so leagues can run independently."
          action={
            <Button type="button" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New organization
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SettingsSummaryChip
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Organizations"
              value={String(totalCount)}
            />
            <SettingsSummaryChip
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Active"
              value={String(activeCount)}
            />
            <SettingsSummaryChip
              icon={<Shield className="h-3.5 w-3.5" />}
              label="Admins (selected)"
              value={selectedTenantId ? String(adminCount) : '—'}
            />
          </div>

          <DebouncedSearchField
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPageIndex(0);
            }}
            placeholder="Search organizations by name or schema…"
            aria-label="Search organizations"
          />

          {tenants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-muted-foreground">
              No organizations match your search.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  selected={tenant.id === selectedTenantId}
                  isCurrent={tenant.id === activeTenant?.id}
                  onSelect={() => setSelectedTenant(tenant)}
                />
              ))}
            </div>
          )}

          {totalCount > 0 ? (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {pageIndex + 1} of {pageCount} ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={pageIndex === 0}
                  className="rounded-md border p-1.5 disabled:opacity-40"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={pageIndex >= pageCount - 1}
                  className="rounded-md border p-1.5 disabled:opacity-40"
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {selectedTenant ? (
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-[#12233D]">{selectedTenant.name}</h3>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {selectedTenant.schema_name}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    selectedTenant.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {selectedTenant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <form
                onSubmit={handleAssignAdmin}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#12233D]">
                  <Users className="h-4 w-4 text-[#E8A93B]" />
                  Assign tenant admin
                </div>
                <p className="text-xs text-muted-foreground">
                  Lookup a registered user by email. Unregistered users cannot be invited here.
                </p>
                <UserEmailLookupField
                  label="Admin email"
                  placeholder="admin@example.com"
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
                  <p className="text-sm text-emerald-700">Selected: {resolvedAdminLabel}</p>
                ) : null}
                <Button type="submit" disabled={assignAdminMutation.isPending || !adminUserId}>
                  {assignAdminMutation.isPending ? 'Assigning…' : 'Assign tenant admin'}
                </Button>
              </form>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#12233D]">Current admins</h4>
                {memberships.isLoading && !memberships.data ? (
                  <div className="flex min-h-[12vh] items-center justify-center">
                    <LoadingSpinner className="h-7 w-7 text-[#12233D]" />
                  </div>
                ) : memberships.isError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Unable to load tenant memberships.
                  </div>
                ) : (memberships.data?.results ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-muted-foreground">
                    No tenant admins assigned yet.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {(memberships.data?.results ?? []).map((membership) => (
                      <li
                        key={membership.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#12233D]">
                            {membership.user_email}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {membership.role.replace(/_/g, ' ')} · assigned{' '}
                            {new Date(membership.created).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:border-red-200 hover:bg-red-50"
                          disabled={revokeAdminMutation.isPending}
                          onClick={() => setRevokeTarget(membership)}
                        >
                          <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                          Revoke
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title="Revoke tenant admin?"
        description={
          revokeTarget
            ? `${revokeTarget.user_email} will lose admin access to ${selectedTenant?.name ?? 'this organization'}.`
            : ''
        }
        confirmLabel="Revoke access"
        isLoading={revokeAdminMutation.isPending}
        onConfirm={() => {
          if (!revokeTarget || !selectedTenantId) return;
          revokeAdminMutation.mutate(
            {
              membershipId: revokeTarget.id,
              tenantId: selectedTenantId,
            },
            {
              onSuccess: () => {
                setRevokeTarget(null);
                toast.success('Tenant admin access revoked.');
              },
              onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Failed to revoke access.'));
              },
            }
          );
        }}
      />
    </div>
  );
}

function TenantCard({
  tenant,
  selected,
  isCurrent,
  onSelect,
}: {
  tenant: Tenant;
  selected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-xl border p-4 text-left transition',
        selected
          ? 'border-[#E8A93B]/60 bg-[#12233D] text-white shadow-sm'
          : 'border-slate-200 bg-white text-[#12233D] hover:border-[#E8A93B]/40'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Building2 className={cn('h-5 w-5', selected ? 'text-[#E8A93B]' : 'text-[#E8A93B]')} />
        <div className="flex flex-wrap justify-end gap-1.5">
          {isCurrent ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                selected ? 'bg-[#E8A93B]/20 text-[#E8A93B]' : 'bg-[#E8A93B]/15 text-[#8a5b00]'
              )}
            >
              Current
            </span>
          ) : null}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              tenant.is_active
                ? selected
                  ? 'bg-emerald-400/20 text-emerald-200'
                  : 'bg-emerald-100 text-emerald-800'
                : selected
                  ? 'bg-white/10 text-white/70'
                  : 'bg-slate-100 text-slate-600'
            )}
          >
            {tenant.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold leading-snug">{tenant.name}</p>
      <p
        className={cn(
          'mt-1 truncate font-mono text-[11px]',
          selected ? 'text-white/60' : 'text-muted-foreground'
        )}
      >
        {tenant.schema_name}
      </p>
    </button>
  );
}
