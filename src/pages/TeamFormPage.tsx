import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileField } from '@/components/forms/FileField';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateTeam } from '@/hooks/useTeams';

export default function TeamFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateTeam();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logo, setLogo] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate(
      { name: name.trim(), code: code.trim().toUpperCase(), logo },
      { onSuccess: () => navigate('/dashboard/teams') }
    );
  };

  return (
    <TenantRequired message="Choose a tenant from the header to create a team.">
      <div className="space-y-6">
        <PageHeader
          title="Create team"
          description="Register a new team in the active organization."
          backTo="/dashboard/teams"
        />
        <form
          onSubmit={handleSubmit}
          className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
        >
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
            placeholder="e.g. RCB"
            required
          />
          <FileField label="Team logo (optional)" onChange={setLogo} />
          {createMutation.isError ? (
            <p className="text-sm text-red-600">
              Failed to create team. Check permissions and try again.
            </p>
          ) : null}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create team'}
          </Button>
        </form>
      </div>
    </TenantRequired>
  );
}
