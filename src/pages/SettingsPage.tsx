import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChangePassword } from '@/hooks/useSettings';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const changePasswordMutation = useChangePassword();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }

    changePasswordMutation.mutate(
      {
        old_password: oldPassword,
        new_password: newPassword,
        re_new_password: confirmPassword,
      },
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account security</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-lg border bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-[#12233D]">Change password</h2>

        <Input
          label="Current password"
          type="password"
          value={oldPassword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setOldPassword(event.target.value)
          }
          required
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNewPassword(event.target.value)
          }
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(event.target.value)
          }
          required
        />

        {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
        {changePasswordMutation.isError ? (
          <p className="text-sm text-red-600">Failed to change password. Check your current password.</p>
        ) : null}
        {changePasswordMutation.isSuccess ? (
          <p className="text-sm text-green-700">Password updated successfully.</p>
        ) : null}

        <Button type="submit" disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
