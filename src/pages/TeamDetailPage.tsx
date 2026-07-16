import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useTeam, useUpdateTeam } from '@/hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamQuery = useTeam(id);
  const updateMutation = useUpdateTeam();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (teamQuery.data) {
      setName(teamQuery.data.name);
      setCode(teamQuery.data.code);
      setLogoUrl(teamQuery.data.logo ?? '');
    }
  }, [teamQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        payload: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          logo: logoUrl || null,
        },
      },
      { onSuccess: () => navigate('/dashboard/teams') }
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Team not found.</div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
            <p className="text-sm text-muted-foreground">
              {teamQuery.data.total_players} registered player{teamQuery.data.total_players === 1 ? '' : 's'}
            </p>
            <Input label="Team name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Abbreviation"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={5}
              required
            />
            <Input label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            {updateMutation.isError ? (
              <p className="text-sm text-red-600">Failed to update team. Check permissions and try again.</p>
            ) : null}
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
