import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateTournament, useTournament, useUpdateTournament } from '@/hooks/useTournaments';
import { useTeams } from '@/hooks/useTeams';

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export default function TournamentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const tournamentQuery = useTournament(id);
  const teamsQuery = useTeams();
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();

  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [teamSize, setTeamSize] = useState('11');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    if (tournamentQuery.data) {
      setName(tournamentQuery.data.name);
      setStart(toLocalInput(tournamentQuery.data.start));
      setEnd(toLocalInput(tournamentQuery.data.end ?? tournamentQuery.data.start));
      setTeamSize(String(tournamentQuery.data.team_size ?? 11));
      setSelectedTeams(tournamentQuery.data.opponents?.map((o) => o.team_id) ?? []);
    }
  }, [tournamentQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: name.trim(),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      team_size: Number(teamSize),
      teams: selectedTeams,
    };
    if (isEdit && id) {
      updateMutation.mutate({ id, payload }, { onSuccess: () => navigate('/dashboard/tournaments') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/tournaments') });
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId]
    );
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const failed = createMutation.isError || updateMutation.isError;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title={isEdit ? 'Edit tournament' : 'Create tournament'}
          backTo="/dashboard/tournaments"
        />
        {isEdit && tournamentQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Start"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
            <Input
              label="End"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
            <Input
              label="Squad size"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              required
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#12233D]">Teams (select at least 2)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(teamsQuery.data?.results ?? []).map((team) => (
                  <label key={team.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                    />
                    {team.name}
                  </label>
                ))}
              </div>
            </div>
            {failed ? <p className="text-sm text-red-600">Failed to save tournament.</p> : null}
            <Button type="submit" disabled={pending || selectedTeams.length < 2}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create tournament'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
