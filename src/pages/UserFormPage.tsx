import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { useUser } from '@/hooks/useUser';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { useRoles } from '@/hooks/useRoles';

const GENDER_OPTIONS = [
  { value: 'unspecified', label: 'Prefer not to say' },
  { value: 'm', label: 'Male' },
  { value: 'f', label: 'Female' },
  { value: 'o', label: 'Other' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

// Admin/Superuser grant staff-equivalent access - the backend already
// rejects assigning them through this endpoint unless you're a global
// admin, so they're left out of this list entirely rather than shown
// and silently rejected.
const ASSIGNABLE_ROLES = ['Audience', 'Player', 'Team Maintainer'];

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userQuery = useUser(id);
  const rolesQuery = useRoles();
  const updateMutation = useUpdateUser();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [paymentStatus, setPaymentStatus] = useState('unverified');
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);

  useEffect(() => {
    if (userQuery.data) {
      setFullName(userQuery.data.full_name ?? '');
      setPhone(userQuery.data.phone ?? '');
      setGender(userQuery.data.gender || 'unspecified');
      setPaymentStatus(userQuery.data.payment_status ?? 'unverified');
      setIsPaymentVerified(userQuery.data.is_payment_verified ?? false);
      setSubscriptionEndDate(userQuery.data.subscription_end_date ?? '');
      setSelectedRoleNames(userQuery.data.roles ?? []);
    }
  }, [userQuery.data]);

  const assignableRoles = (rolesQuery.data ?? []).filter((role) =>
    ASSIGNABLE_ROLES.includes(role.name)
  );

  const toggleRole = (name: string) => {
    setSelectedRoleNames((current) =>
      current.includes(name) ? current.filter((r) => r !== name) : [...current, name]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    const groupIds = assignableRoles
      .filter((role) => selectedRoleNames.includes(role.name))
      .map((role) => role.id);

    updateMutation.mutate(
      {
        userId: id,
        payload: {
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          gender: gender === 'unspecified' ? '' : gender,
          payment_status: paymentStatus,
          is_payment_verified: isPaymentVerified,
          subscription_end_date: subscriptionEndDate || null,
          groups: groupIds,
        },
      },
      { onSuccess: () => navigate('/dashboard/users') }
    );
  };

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load this user. You may not have access to their tenant.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit user" description={userQuery.data.email} backTo="/dashboard/users" />
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
      >
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <SearchableSelect
          label="Gender"
          value={gender}
          onChange={setGender}
          options={GENDER_OPTIONS}
          searchable={false}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#12233D]">Roles</label>
          <div className="flex flex-wrap gap-4">
            {assignableRoles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-[#12233D]">
                <input
                  type="checkbox"
                  checked={selectedRoleNames.includes(role.name)}
                  onChange={() => toggleRole(role.name)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <SearchableSelect
          label="Payment status"
          value={paymentStatus}
          onChange={setPaymentStatus}
          options={PAYMENT_STATUS_OPTIONS}
          searchable={false}
        />
        <label className="flex items-center gap-2 text-sm text-[#12233D]">
          <input
            type="checkbox"
            checked={isPaymentVerified}
            onChange={(e) => setIsPaymentVerified(e.target.checked)}
          />
          Payment verified
        </label>
        <Input
          label="Subscription ends"
          type="date"
          value={subscriptionEndDate}
          onChange={(e) => setSubscriptionEndDate(e.target.value)}
        />

        {updateMutation.isError ? (
          <p className="text-sm text-red-600">
            Failed to save changes. You may not have permission to edit this user, or an assigned
            role isn't allowed here.
          </p>
        ) : null}
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}
