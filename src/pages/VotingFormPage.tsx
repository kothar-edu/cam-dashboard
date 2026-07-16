import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { usePlayers } from '@/hooks/usePlayers';
import { useTournaments } from '@/hooks/useTournaments';
import {
  useCreateNomineeVotingPlayer,
  useNomineeVotingPlayer,
  useUpdateNomineeVotingPlayer,
} from '@/hooks/useVoting';

export default function VotingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const nominationId = id ? Number(id) : undefined;
  const nominationQuery = useNomineeVotingPlayer(nominationId);
  const tournamentsQuery = useTournaments();
  const playersQuery = usePlayers();
  const createMutation = useCreateNomineeVotingPlayer();
  const updateMutation = useUpdateNomineeVotingPlayer();

  const [tournamentId, setTournamentId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (nominationQuery.data) {
      setTournamentId(nominationQuery.data.tournament.id);
      setSelectedPlayers(nominationQuery.data.player.map((player) => player.id));
    }
  }, [nominationQuery.data]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId) ? current.filter((pid) => pid !== playerId) : [...current, playerId]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { tournament: tournamentId, player: selectedPlayers };
    if (isEdit && nominationId) {
      updateMutation.mutate({ id: nominationId, payload }, { onSuccess: () => navigate('/dashboard/voting') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/voting') });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={isEdit ? 'Edit voting nomination' : 'Create voting nomination'} backTo="/dashboard/voting" />
        {isEdit && nominationQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12233D]">Tournament</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                required
                disabled={isEdit}
              >
                <option value="">Select tournament</option>
                {(tournamentsQuery.data?.results ?? []).map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#12233D]">Nominated players</p>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                {(playersQuery.data?.results ?? []).map((player) => (
                  <label key={player.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                    />
                    {player.full_name}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={pending || !selectedPlayers.length}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create nomination'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
