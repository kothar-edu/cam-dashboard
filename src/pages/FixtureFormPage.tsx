import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateFixture, useFixture, useUpdateFixture } from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import { useCreateTournamentFixture, useTournament, useTournaments } from '@/hooks/useTournaments';

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export default function FixtureFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fixtureQuery = useFixture(id);
  const teamsQuery = useTeams();
  const tournamentsQuery = useTournaments();
  const createMutation = useCreateFixture();
  const updateMutation = useUpdateFixture();
  const createTournamentFixtureMutation = useCreateTournamentFixture();

  const [name, setName] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [time, setTime] = useState('');
  const [ground, setGround] = useState('');
  const [round, setRound] = useState('');

  const tournamentDetailQuery = useTournament(tournamentId || undefined);
  const opponents = tournamentDetailQuery.data?.opponents ?? [];

  useEffect(() => {
    setTeamA('');
    setTeamB('');
  }, [tournamentId]);

  useEffect(() => {
    if (fixtureQuery.data) {
      setName(fixtureQuery.data.tournament?.name ?? '');
      setTeamA(fixtureQuery.data.opponent_a.id);
      setTeamB(fixtureQuery.data.opponent_b.id);
      setTime(toLocalInput(fixtureQuery.data.time));
      setGround(fixtureQuery.data.ground ?? '');
      setRound(fixtureQuery.data.round ?? '');
    }
  }, [fixtureQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isEdit && id) {
      updateMutation.mutate(
        {
          id,
          payload: {
            time: new Date(time).toISOString(),
            ground,
            round,
          },
        },
        { onSuccess: () => navigate('/dashboard/fixtures') }
      );
      return;
    }
    if (tournamentId) {
      createTournamentFixtureMutation.mutate(
        {
          tournamentId,
          payload: {
            opponent_a: teamA,
            opponent_b: teamB,
            round: round.trim() || undefined,
            time: new Date(time).toISOString(),
            ground: ground.trim(),
          },
        },
        { onSuccess: () => navigate('/dashboard/fixtures') }
      );
      return;
    }
    createMutation.mutate(
      {
        name: name.trim(),
        team_a: teamA,
        team_b: teamB,
        time: new Date(time).toISOString(),
        ground: ground.trim(),
      },
      { onSuccess: () => navigate('/dashboard/fixtures') }
    );
  };

  const pending =
    createMutation.isPending || updateMutation.isPending || createTournamentFixtureMutation.isPending;
  const teams = teamsQuery.data?.results ?? [];
  const tournaments = tournamentsQuery.data?.results ?? [];

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title={isEdit ? 'Edit fixture' : 'Create fixture'}
          backTo="/dashboard/fixtures"
          action={
            !isEdit ? (
              <Link
                to="/dashboard/fixtures/new/bulk"
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#12233D]"
              >
                Bulk upload
              </Link>
            ) : undefined
          }
        />
        {isEdit && fixtureQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
            {!isEdit ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#12233D]">Tournament (optional)</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={tournamentId}
                  onChange={(e) => setTournamentId(e.target.value)}
                >
                  <option value="">None — standalone/custom match</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a tournament to create this match within it (uses the tournament's registered
                  teams). Leave unselected for a standalone/friendly match.
                </p>
              </div>
            ) : null}
            {!isEdit && !tournamentId ? (
              <Input label="Series name" value={name} onChange={(e) => setName(e.target.value)} required />
            ) : null}
            {!isEdit && tournamentId ? (
              tournamentDetailQuery.isLoading ? (
                <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
              ) : (
                <>
                  <OpponentSelect label="Team A" opponents={opponents} value={teamA} onChange={setTeamA} />
                  <OpponentSelect label="Team B" opponents={opponents} value={teamB} onChange={setTeamB} />
                </>
              )
            ) : null}
            {!isEdit && !tournamentId ? (
              <>
                <TeamSelect label="Team A" teams={teams} value={teamA} onChange={setTeamA} />
                <TeamSelect label="Team B" teams={teams} value={teamB} onChange={setTeamB} />
              </>
            ) : null}
            <Input
              label="Scheduled time"
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Input label="Ground" value={ground} onChange={(e) => setGround(e.target.value)} required={!isEdit} />
            {isEdit || tournamentId ? (
              <Input label="Round" value={round} onChange={(e) => setRound(e.target.value)} />
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create fixture'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}

function TeamSelect({
  label,
  teams,
  value,
  onChange,
}: {
  label: string;
  teams: Array<{ id: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="">Select team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function OpponentSelect({
  label,
  opponents,
  value,
  onChange,
}: {
  label: string;
  opponents: Array<{ id: string; team_id: string; team_name: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="">Select team</option>
        {opponents.map((opponent) => (
          <option key={opponent.id} value={opponent.id}>
            {opponent.team_name}
          </option>
        ))}
      </select>
    </div>
  );
}
