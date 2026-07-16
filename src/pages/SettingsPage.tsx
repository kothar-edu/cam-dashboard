import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChangePassword } from '@/hooks/useSettings';
import { useCreateAdminUser } from '@/hooks/useCreateAdmin';
import { useCountries } from '@/hooks/useCountries';
import { useRoles } from '@/hooks/useRoles';

type SettingsTab = 'password' | 'create-admin';

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('password');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and admin users</p>
      </div>

      <div className="flex gap-2 border-b">
        <TabButton active={tab === 'password'} onClick={() => setTab('password')}>
          Change password
        </TabButton>
        <TabButton active={tab === 'create-admin'} onClick={() => setTab('create-admin')}>
          Create admin
        </TabButton>
      </div>

      {tab === 'password' ? <ChangePasswordForm /> : <CreateAdminForm />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm font-medium ${
        active ? 'border-[#E8A93B] text-[#12233D]' : 'border-transparent text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ChangePasswordForm() {
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
      { old_password: oldPassword, new_password: newPassword, re_new_password: confirmPassword },
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold text-[#12233D]">Change password</h2>
      <Input label="Current password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
      <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
      {changePasswordMutation.isError ? <p className="text-sm text-red-600">Failed to change password.</p> : null}
      {changePasswordMutation.isSuccess ? <p className="text-sm text-green-700">Password updated successfully.</p> : null}
      <Button type="submit" disabled={changePasswordMutation.isPending}>
        {changePasswordMutation.isPending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

function CreateAdminForm() {
  const countriesQuery = useCountries();
  const rolesQuery = useRoles();
  const createMutation = useCreateAdminUser();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('m');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
  const [otherCountry, setOtherCountry] = useState('');
  const [visaType, setVisaType] = useState('citizen');
  const [role, setRole] = useState('');
  const [picture, setPicture] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [paySlip, setPaySlip] = useState<File | null>(null);
  const [studyDocument, setStudyDocument] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate(
      {
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        gender,
        dob,
        nationality: Number(nationality),
        other_country: otherCountry || undefined,
        visa_type: visaType,
        role: role ? Number(role) : undefined,
        picture,
        id_card: idCard,
        pay_slip: paySlip,
        study_document: studyDocument,
      },
      {
        onSuccess: () => {
          setEmail('');
          setFullName('');
          setPhone('');
          setDob('');
          setOtherCountry('');
          setPicture(null);
          setIdCard(null);
          setPaySlip(null);
          setStudyDocument(null);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold text-[#12233D]">Create admin user</h2>
      <p className="text-sm text-muted-foreground">
        Creates a verified user with profile fields required by the backend registration API.
      </p>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
      <SelectField label="Gender" value={gender} onChange={setGender} options={[
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
        { value: 'o', label: 'Other' },
      ]} />
      <SelectField
        label="Nationality"
        value={nationality}
        onChange={setNationality}
        options={(countriesQuery.data ?? []).map((country) => ({ value: String(country.id), label: country.name }))}
        required
      />
      <Input label="Other country (if applicable)" value={otherCountry} onChange={(e) => setOtherCountry(e.target.value)} />
      <SelectField
        label="Visa type"
        value={visaType}
        onChange={setVisaType}
        options={[
          { value: 'citizen', label: 'Citizen' },
          { value: 'permanent', label: 'Permanent' },
          { value: 'student', label: 'Student' },
          { value: 'temporary', label: 'Temporary' },
        ]}
      />
      <SelectField
        label="Role"
        value={role}
        onChange={setRole}
        options={(rolesQuery.data ?? []).map((item) => ({ value: String(item.id), label: item.name }))}
      />
      <FileField label="Profile picture (optional)" onChange={setPicture} />
      <FileField label="ID card (optional)" onChange={setIdCard} />
      <FileField label="Payslip (optional)" onChange={setPaySlip} />
      <FileField label="Study document (optional)" onChange={setStudyDocument} />
      {createMutation.isError ? <p className="text-sm text-red-600">Failed to create admin user.</p> : null}
      {createMutation.isSuccess ? <p className="text-sm text-green-700">Admin user created. They will receive a welcome email.</p> : null}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating…' : 'Create admin user'}
      </Button>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileField({ label, onChange }: { label: string; onChange: (file: File | null) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      <input
        type="file"
        accept="image/*,.pdf"
        className="block w-full text-sm text-muted-foreground"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
