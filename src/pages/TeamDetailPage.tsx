import { UserEmailLookupField } from '@/components/forms/UserEmailLookupField';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileField } from '@/components/forms/FileField';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useTeamPaymentSettings, useUpdateTeamPaymentSettings } from '@/hooks/usePaymentSettings';
import { useTeam, useUpdateTeam } from '@/hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamQuery = useTeam(id);
  const updateMutation = useUpdateTeam();
  const paymentQuery = useTeamPaymentSettings(id);
  const paymentMutation = useUpdateTeamPaymentSettings(id ?? '');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [verificationFeeAmount, setVerificationFeeAmount] = useState('');
  const [requirePaymentVerification, setRequirePaymentVerification] = useState(false);
  const [requireIdVerification, setRequireIdVerification] = useState(false);
  const [studentFeeEnabled, setStudentFeeEnabled] = useState(false);
  const [studentFeeAmount, setStudentFeeAmount] = useState('');
  const [maintainerId, setMaintainerId] = useState<string | null>(null);
  const [maintainerLabel, setMaintainerLabel] = useState<string | null>(null);

  useEffect(() => {
    if (teamQuery.data) {
      setName(teamQuery.data.name);
      setCode(teamQuery.data.code);
      const maintainer = teamQuery.data.maintainer;
      setMaintainerId(maintainer?.id ?? null);
      setMaintainerLabel(maintainer ? `${maintainer.full_name} (${maintainer.email})` : null);
    }
  }, [teamQuery.data]);

  useEffect(() => {
    if (paymentQuery.data) {
      setBankAccountName(paymentQuery.data.bank_account_name ?? '');
      setBankAccountNumber(paymentQuery.data.bank_account_number ?? '');
      setBankName(paymentQuery.data.bank_name ?? '');
      setBankBranch(paymentQuery.data.bank_branch ?? '');
      setVerificationFeeAmount(paymentQuery.data.verification_fee_amount ?? '');
      setRequirePaymentVerification(paymentQuery.data.require_payment_verification);
      setRequireIdVerification(paymentQuery.data.require_id_verification);
      setStudentFeeEnabled(paymentQuery.data.student_fee_enabled);
      setStudentFeeAmount(paymentQuery.data.student_fee_amount ?? '');
    }
  }, [paymentQuery.data]);

  const handleMaintainerSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        payload: { maintainer: maintainerId },
      },
      {
        onSuccess: () => toast.success('Team maintainer updated.'),
        onError: () =>
          toast.error('Failed to update maintainer. User must be an approved org member.'),
      }
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        payload: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          logo,
        },
      },
      { onSuccess: () => navigate('/dashboard/teams') }
    );
  };

  const handlePaymentSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    paymentMutation.mutate(
      {
        bank_account_name: bankAccountName,
        bank_account_number: bankAccountNumber,
        bank_name: bankName,
        bank_branch: bankBranch,
        verification_fee_amount: verificationFeeAmount.trim() ? verificationFeeAmount : null,
        require_payment_verification: requirePaymentVerification,
        require_id_verification: requireIdVerification,
        student_fee_enabled: studentFeeEnabled,
        student_fee_amount: studentFeeAmount.trim() ? studentFeeAmount : null,
      },
      {
        onSuccess: () => toast.success('Team payment settings saved.'),
        onError: () => toast.error('Failed to save team payment settings.'),
      }
    );
  };

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Edit team" backTo="/dashboard/teams" />
        {teamQuery.isLoading && !teamQuery.data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : teamQuery.isError || !teamQuery.data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Team not found.
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
            >
              <p className="text-sm text-muted-foreground">
                {teamQuery.data.total_players} registered player
                {teamQuery.data.total_players === 1 ? '' : 's'}
              </p>
              <Input
                label="Team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Abbreviation"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={5}
                required
              />
              <FileField label="Team logo" currentUrl={teamQuery.data.logo} onChange={setLogo} />
              {updateMutation.isError ? (
                <p className="text-sm text-red-600">
                  Failed to update team. Check permissions and try again.
                </p>
              ) : null}
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>

            <form
              onSubmit={handleMaintainerSubmit}
              className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
            >
              <h2 className="text-lg font-semibold text-[#12233D]">Team maintainer</h2>
              <p className="text-sm text-muted-foreground">
                Assign a registered organization member as maintainer. They can manage roster join
                requests and edit team name/logo.
              </p>
              {maintainerLabel ? (
                <p className="text-sm text-[#12233D]">
                  Current maintainer: <span className="font-medium">{maintainerLabel}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No maintainer assigned yet.</p>
              )}
              <UserEmailLookupField
                label="Admin email"
                placeholder="admin@example.com"
                onResolved={(user) => {
                  setMaintainerId(user.id);
                  setMaintainerLabel(`${user.full_name} (${user.email})`);
                }}
                onClear={() => {
                  setMaintainerId(null);
                  setMaintainerLabel(null);
                }}
              />
              <Button type="submit" disabled={updateMutation.isPending || !maintainerId}>
                {updateMutation.isPending ? 'Saving…' : 'Reassign maintainer'}
              </Button>
            </form>

            <form
              onSubmit={handlePaymentSubmit}
              className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
            >
              <h2 className="text-lg font-semibold text-[#12233D]">Payment settings</h2>
              <p className="text-sm text-muted-foreground">
                Team-level bank details and verification rules override tenant defaults when set.
              </p>
              {paymentQuery.isLoading && !paymentQuery.data ? (
                <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
              ) : (
                <>
                  <Input
                    label="Account name"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                  />
                  <Input
                    label="Account number"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                  />
                  <Input
                    label="Bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  <Input
                    label="Branch"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                  <Input
                    label="Verification fee (leave blank for free)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={verificationFeeAmount}
                    onChange={(e) => setVerificationFeeAmount(e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-sm text-[#12233D]">
                    <input
                      type="checkbox"
                      checked={requirePaymentVerification}
                      onChange={(e) => setRequirePaymentVerification(e.target.checked)}
                    />
                    Require payment verification
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#12233D]">
                    <input
                      type="checkbox"
                      checked={requireIdVerification}
                      onChange={(e) => setRequireIdVerification(e.target.checked)}
                    />
                    Require ID verification
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-[#12233D]">
                      <input
                        type="checkbox"
                        checked={studentFeeEnabled}
                        onChange={(e) => setStudentFeeEnabled(e.target.checked)}
                      />
                      Enable student fee
                    </label>
                    <Input
                      label="Student fee amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={studentFeeAmount}
                      onChange={(e) => setStudentFeeAmount(e.target.value)}
                      disabled={!studentFeeEnabled}
                    />
                  </div>
                  <Button type="submit" disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? 'Saving…' : 'Save payment settings'}
                  </Button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </TenantRequired>
  );
}
