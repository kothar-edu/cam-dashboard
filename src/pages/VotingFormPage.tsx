import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { usePlayers } from '@/hooks/usePlayers';
import { useTournaments } from '@/hooks/useTournaments';
import {
  useCreateNomineeVotingPlayer,
  useNomineeVotingPlayer,
  useUpdateNomineeVotingPlayer,
} from '@/hooks/useVoting';
import { getApiErrorMessage, parseApiFieldErrors, type FieldErrors } from '@/lib/api-errors';

export default function VotingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const nominationQuery = useNomineeVotingPlayer(id);
  const tournamentsQuery = useTournaments();
  const playersQuery = usePlayers();
  const createMutation = useCreateNomineeVotingPlayer();
  const updateMutation = useUpdateNomineeVotingPlayer();

  const [tournamentId, setTournamentId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!nominationQuery.data) {
      return;
    }
    setTournamentId(String(nominationQuery.data.tournament.id));
    setSelectedPlayers(nominationQuery.data.player.map((player) => String(player.id)));
    setIsVotingOpen(nominationQuery.data.is_voting_open);
  }, [nominationQuery.data]);

  const tournamentOptions = useMemo(() => {
    const options = (tournamentsQuery.data?.results ?? []).map((tournament) => ({
      value: String(tournament.id),
      label: tournament.name,
    }));

    const nominationTournament = nominationQuery.data?.tournament;
    if (
      nominationTournament &&
      !options.some((option) => option.value === String(nominationTournament.id))
    ) {
      options.unshift({
        value: String(nominationTournament.id),
        label: nominationTournament.name,
      });
    }

    return options;
  }, [nominationQuery.data?.tournament, tournamentsQuery.data?.results]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId) ? current.filter((pid) => pid !== playerId) : [...current, playerId]
    );
  };

  const handleMutationError = (error: unknown, fallback: string) => {
    const errors = parseApiFieldErrors(error);
    setFieldErrors(errors);
    toast.error(getApiErrorMessage(error, fallback));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    if (!tournamentId) {
      setFieldErrors({ tournament: 'Tournament is required.' });
      toast.error('Please select a tournament.');
      return;
    }

    if (!selectedPlayers.length) {
      toast.error('Select at least one nominated player.');
      return;
    }

    const payload = {
      tournament: tournamentId,
      player: selectedPlayers,
      is_voting_open: isVotingOpen,
    };

    if (isEdit && id) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => {
            toast.success('Voting nomination updated.');
            navigate('/dashboard/voting');
          },
          onError: (error) => handleMutationError(error, 'Failed to update voting nomination.'),
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Voting nomination created.');
        navigate('/dashboard/voting');
      },
      onError: (error) => handleMutationError(error, 'Failed to create voting nomination.'),
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const isLoadingEdit = isEdit && nominationQuery.isLoading;
  const loadFailed = isEdit && nominationQuery.isError;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={isEdit ? 'Edit voting nomination' : 'Create voting nomination'} backTo="/dashboard/voting" />
        {isLoadingEdit ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : loadFailed ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load this voting nomination.{' '}
            <Link to="/dashboard/voting" className="font-medium underline">
              Return to voting polls
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
            <SearchableSelect
              label="Tournament"
              value={tournamentId}
              onChange={(value) => {
                setTournamentId(value);
                setFieldErrors((current) => {
                  if (!current.tournament) return current;
                  const next = { ...current };
                  delete next.tournament;
                  return next;
                });
              }}
              options={tournamentOptions}
              placeholder="Select tournament"
              searchable
              disabled={isEdit}
              required
              error={fieldErrors.tournament}
            />
            {isEdit && nominationQuery.data ? (
              <p className="text-xs text-muted-foreground">
                Tournament cannot be changed after a nomination is created.
              </p>
            ) : null}
            <label className="flex items-center justify-between gap-4 rounded-md border p-4">
              <div>
                <p className="text-sm font-medium text-[#12233D]">Poll voting open</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, this poll appears on the mobile Vote screen (if organization voting is also open).
                </p>
              </div>
              <input
                type="checkbox"
                checked={isVotingOpen}
                onChange={(event) => setIsVotingOpen(event.target.checked)}
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#12233D]">Nominated players</p>
              {fieldErrors.player ? (
                <p className="text-sm text-red-600">{fieldErrors.player}</p>
              ) : null}
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                {(playersQuery.data?.results ?? []).map((player) => (
                  <label key={player.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(String(player.id))}
                      onChange={() => togglePlayer(String(player.id))}
                    />
                    {player.full_name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending || !selectedPlayers.length}>
                {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create nomination'}
              </Button>
              <Button type="button" variant="outline" disabled={pending} onClick={() => navigate('/dashboard/voting')}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
