import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantPaymentSettings, useUpdateTenantPaymentSettings } from '@/hooks/usePaymentSettings';

export default function PaymentSettingsPage() {
  const { activeTenant } = useTenant();
  const { data, isLoading, isError } = useTenantPaymentSettings();
  const updateMutation = useUpdateTenantPaymentSettings();

  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [verificationFeeAmount, setVerificationFeeAmount] = useState('');
  const [requirePaymentVerification, setRequirePaymentVerification] = useState(true);
  const [requireIdVerification, setRequireIdVerification] = useState(false);
  const [studentFeeEnabled, setStudentFeeEnabled] = useState(false);
  const [studentFeeAmount, setStudentFeeAmount] = useState('');

  useEffect(() => {
    if (data) {
      setBankAccountName(data.bank_account_name ?? '');
      setBankAccountNumber(data.bank_account_number ?? '');
      setBankName(data.bank_name ?? '');
      setBankBranch(data.bank_branch ?? '');
      setVerificationFeeAmount(data.verification_fee_amount ?? '');
      setRequirePaymentVerification(data.require_payment_verification);
      setRequireIdVerification(data.require_id_verification);
      setStudentFeeEnabled(data.student_fee_enabled);
      setStudentFeeAmount(data.student_fee_amount ?? '');
    }
  }, [data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(
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
        onSuccess: () => toast.success('Payment settings saved.'),
        onError: () => toast.error('Failed to save payment settings.'),
      }
    );
  };

  return (
    <TenantRequired message="Choose a tenant from the header to manage payment settings.">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Payment settings</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant?.name} · bank details and verification fee configuration
          </p>
        </div>

        {isLoading && !data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load payment settings.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6">
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
            <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Branch" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
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
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save payment settings'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
