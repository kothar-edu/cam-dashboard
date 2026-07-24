import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import {
  LivestreamOverlayFields,
  type LivestreamOverlayFormValues,
} from '@/components/forms/LivestreamOverlayFields';
import { useCreateTournament, useTournament, useUpdateTournament, useAddTeamsToTournament } from '@/hooks/useTournaments';
import { useTeams } from '@/hooks/useTeams';
import { updateTournamentLivestreamOverlay } from '@/api/tournaments';

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
  const addTeamsMutation = useAddTeamsToTournament();

  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [teamSize, setTeamSize] = useState('11');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [overlayValues, setOverlayValues] = useState<LivestreamOverlayFormValues>({
    sponsorText: '',
    topLeftFile: null,
    topRightFile: null,
    clearTopLeft: false,
    clearTopRight: false,
  });

  useEffect(() => {
    if (tournamentQuery.data) {
      setName(tournamentQuery.data.name);
      setStart(toLocalInput(tournamentQuery.data.start));
      setEnd(toLocalInput(tournamentQuery.data.end ?? tournamentQuery.data.start));
      setTeamSize(String(tournamentQuery.data.team_size ?? 11));
      setSelectedTeams(tournamentQuery.data.opponents?.map((o) => o.team_id) ?? []);
      setIsPublic(tournamentQuery.data.is_public ?? true);
      setOverlayValues({
        sponsorText: tournamentQuery.data.livestream_sponsor_text ?? '',
        topLeftFile: null,
        topRightFile: null,
        clearTopLeft: false,
        clearTopRight: false,
      });
    }
  }, [tournamentQuery.data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: name.trim(),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      team_size: Number(teamSize),
      teams: selectedTeams,
      is_public: isPublic,
      livestream_sponsor_text: overlayValues.sponsorText.trim(),
    };
    const saveOverlay = async (tournamentId: string) => {
      const hasOverlayChanges =
        overlayValues.topLeftFile ||
        overlayValues.topRightFile ||
        overlayValues.clearTopLeft ||
        overlayValues.clearTopRight ||
        overlayValues.sponsorText.trim() !== (tournamentQuery.data?.livestream_sponsor_text ?? '');
      if (!hasOverlayChanges) {
        return;
      }
      await updateTournamentLivestreamOverlay(tournamentId, {
        sponsorText: overlayValues.sponsorText,
        topLeftFile: overlayValues.topLeftFile,
        topRightFile: overlayValues.topRightFile,
        clearTopLeft: overlayValues.clearTopLeft,
        clearTopRight: overlayValues.clearTopRight,
      });
    };
    if (isEdit && id) {
      const existingTeamIds = tournamentQuery.data?.opponents?.map((o) => o.team_id) ?? [];
      const newTeamIds = selectedTeams.filter((teamId) => !existingTeamIds.includes(teamId));
      updateMutation.mutate(
        {
          id,
          payload: {
            name: payload.name,
            start: payload.start,
            end: payload.end,
            team_size: payload.team_size,
            is_public: isPublic,
            livestream_sponsor_text: payload.livestream_sponsor_text,
          },
        },
        {
          onSuccess: async () => {
            try {
              await saveOverlay(id);
              if (newTeamIds.length === 0) {
                navigate('/dashboard/tournaments');
                return;
              }
              addTeamsMutation.mutate(
                { tournamentId: id, teamIds: newTeamIds },
                { onSuccess: () => navigate('/dashboard/tournaments') }
              );
            } catch {
              // overlay save failed but tournament saved
            }
          },
        }
      );
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: async (created) => {
        try {
          await saveOverlay(created.id);
        } catch {
          // overlay save failed but tournament created
        }
        navigate('/dashboard/tournaments');
      },
    });
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId]
    );
  };

  const pending = createMutation.isPending || updateMutation.isPending || addTeamsMutation.isPending;
  const failed = createMutation.isError || updateMutation.isError || addTeamsMutation.isError;

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
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-4 sm:p-6">
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
            <label className="flex items-center gap-2 text-sm text-[#12233D]">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public tournament (visible to guests and non-members)
            </label>
            <LivestreamOverlayFields
              description="Default OBS overlay branding for all matches in this tournament. Matches can override these settings individually."
              values={overlayValues}
              onChange={setOverlayValues}
              topLeftPreview={tournamentQuery.data?.livestream_top_left_image ?? null}
              topRightPreview={tournamentQuery.data?.livestream_top_right_image ?? null}
              disabled={pending}
            />
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
