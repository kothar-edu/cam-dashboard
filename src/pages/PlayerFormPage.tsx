import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { UserEmailLookupField } from '@/components/forms/UserEmailLookupField';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreatePlayer, usePlayer, useUpdatePlayer } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';

export default function PlayerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const playerQuery = usePlayer(id);
  const teamsQuery = useTeams();
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();

  const [userId, setUserId] = useState('');
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('');
  const [jerseyNo, setJerseyNo] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    if (playerQuery.data) {
      const user = playerQuery.data.user;
      setUserId(user?.id ?? '');
      setUserLabel(user ? `${user.full_name} (${user.email})` : null);
      const team = playerQuery.data.current_team;
      setTeamId(typeof team === 'object' && team ? team.id : (team ?? ''));
      setJerseyNo(playerQuery.data.jersey_no?.toString() ?? '');
      setDob(playerQuery.data.dob ?? '');
    }
  }, [playerQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      user: userId.trim(),
      current_team: teamId,
      dob: dob || undefined,
      jersey_no: jerseyNo ? Number(jerseyNo) : undefined,
    };
    if (isEdit && id) {
      updateMutation.mutate({ id, payload }, { onSuccess: () => navigate('/dashboard/players') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/players') });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={isEdit ? 'Edit player' : 'Create player'} backTo="/dashboard/players" />
        {isEdit && playerQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6"
          >
            {isEdit ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">User</p>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#12233D]">
                  {userLabel || userId || '—'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <UserEmailLookupField
                  label="User email"
                  placeholder="Search registered user by email…"
                  onResolved={(user) => {
                    setUserId(user.id);
                    setUserLabel(`${user.full_name} (${user.email})`);
                  }}
                  onClear={() => {
                    setUserId('');
                    setUserLabel(null);
                  }}
                />
                {userLabel ? (
                  <p className="text-sm text-emerald-700">Selected: {userLabel}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Look up a registered user by email before creating the player profile.
                  </p>
                )}
                <input type="hidden" value={userId} required readOnly />
              </div>
            )}
            <SearchableSelect
              id="team-select"
              label="Team"
              value={teamId}
              onChange={setTeamId}
              options={(teamsQuery.data?.results ?? []).map((team) => ({
                value: team.id,
                label: team.name,
              }))}
              placeholder="Select team"
              searchable
              required
            />
            <Input
              label="Jersey number"
              type="number"
              value={jerseyNo}
              onChange={(e) => setJerseyNo(e.target.value)}
            />
            <Input
              label="Date of birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <Button type="submit" disabled={pending || (!isEdit && !userId)}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create player'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
