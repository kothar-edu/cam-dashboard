import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { FileField } from '@/components/forms/FileField';
import { PanelIntro } from '@/components/settings/AppSettingsPanel';
import { useChangePassword } from '@/hooks/useSettings';
import { useCreateAdminUser } from '@/hooks/useCreateAdmin';
import { useCountries } from '@/hooks/useCountries';
import { useRoles } from '@/hooks/useRoles';

export function ChangePasswordPanel() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const changePasswordMutation = useChangePassword();

  const handleSubmit = (event: FormEvent) => {
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <PanelIntro title="Account" description="Update the password for your dashboard login." />
      <Input
        label="Current password"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
      />
      <Input
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <Input
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
      {changePasswordMutation.isError ? (
        <p className="text-sm text-red-600">Failed to change password.</p>
      ) : null}
      {changePasswordMutation.isSuccess ? (
        <p className="text-sm text-green-700">Password updated successfully.</p>
      ) : null}
      <Button type="submit" disabled={changePasswordMutation.isPending}>
        {changePasswordMutation.isPending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

export function CreateAdminPanel() {
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

  const handleSubmit = (event: FormEvent) => {
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <PanelIntro
        title="Create admin"
        description="Creates a verified user with profile fields required by the backend registration API."
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input
        label="Date of birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />
      <SearchableSelect
        label="Gender"
        value={gender}
        onChange={setGender}
        options={[
          { value: 'm', label: 'Male' },
          { value: 'f', label: 'Female' },
          { value: 'o', label: 'Other' },
        ]}
        searchable={false}
      />
      <SearchableSelect
        label="Nationality"
        value={nationality}
        onChange={setNationality}
        options={(countriesQuery.data ?? []).map((country) => ({
          value: String(country.id),
          label: country.name,
        }))}
        placeholder="Select"
        searchable
        required
      />
      <Input
        label="Other country (if applicable)"
        value={otherCountry}
        onChange={(e) => setOtherCountry(e.target.value)}
      />
      <SearchableSelect
        label="Visa type"
        value={visaType}
        onChange={setVisaType}
        options={[
          { value: 'citizen', label: 'Citizen' },
          { value: 'permanent', label: 'Permanent' },
          { value: 'student', label: 'Student' },
          { value: 'temporary', label: 'Temporary' },
        ]}
        searchable={false}
      />
      <SearchableSelect
        label="Role"
        value={role}
        onChange={setRole}
        options={(rolesQuery.data ?? []).map((item) => ({
          value: String(item.id),
          label: item.name,
        }))}
        placeholder="Select"
        searchable
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FileField label="Profile picture (optional)" accept="image/*,.pdf" onChange={setPicture} />
        <FileField label="ID card (optional)" accept="image/*,.pdf" onChange={setIdCard} />
        <FileField label="Payslip (optional)" accept="image/*,.pdf" onChange={setPaySlip} />
        <FileField
          label="Study document (optional)"
          accept="image/*,.pdf"
          onChange={setStudyDocument}
        />
      </div>
      {createMutation.isError ? (
        <p className="text-sm text-red-600">Failed to create admin user.</p>
      ) : null}
      {createMutation.isSuccess ? (
        <p className="text-sm text-green-700">
          Admin user created. They will receive a welcome email.
        </p>
      ) : null}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating…' : 'Create admin user'}
      </Button>
    </form>
  );
}
