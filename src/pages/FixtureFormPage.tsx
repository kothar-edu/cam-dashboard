import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateFixture, useFixture, useUpdateFixture } from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import { useCreateTournamentFixture, useTournament, useTournaments } from '@/hooks/useTournaments';
import { updateMatchLivestreamOverlay } from '@/api/tournaments';
import { getApiErrorMessage, parseApiFieldErrors, type FieldErrors } from '@/lib/api-errors';
import { ROUND_CHOICES } from '@/lib/game-stages';
import {
  LivestreamOverlayFields,
  type LivestreamOverlayFormValues,
} from '@/components/forms/LivestreamOverlayFields';

function toLocalInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

const TOURNAMENT_NONE_VALUE = '__none__';

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPublic, setIsPublic] = useState(true);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [overlayCustom, setOverlayCustom] = useState(false);
  const [overlayValues, setOverlayValues] = useState<LivestreamOverlayFormValues>({
    sponsorText: '',
    topLeftFile: null,
    topRightFile: null,
    clearTopLeft: false,
    clearTopRight: false,
  });

  const tournamentDetailQuery = useTournament(tournamentId || undefined);
  const opponents = tournamentDetailQuery.data?.opponents ?? [];

  useEffect(() => {
    setTeamA('');
    setTeamB('');
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.opponent_a;
      delete next.opponent_b;
      delete next.team_a;
      delete next.team_b;
      return next;
    });
  }, [tournamentId]);

  useEffect(() => {
    if (fixtureQuery.data) {
      setName(fixtureQuery.data.tournament?.name ?? '');
      setTeamA(fixtureQuery.data.opponent_a.id);
      setTeamB(fixtureQuery.data.opponent_b.id);
      setTime(toLocalInput(fixtureQuery.data.time));
      setGround(fixtureQuery.data.ground ?? '');
      setRound(fixtureQuery.data.round ?? '');
      setIsPublic(fixtureQuery.data.is_public ?? true);
      setLiveStreamUrl(fixtureQuery.data.live_stream_url ?? '');
      setOverlayCustom(fixtureQuery.data.livestream_overlay_custom ?? false);
      setOverlayValues({
        sponsorText: fixtureQuery.data.livestream_sponsor_text ?? '',
        topLeftFile: null,
        topRightFile: null,
        clearTopLeft: false,
        clearTopRight: false,
      });
    }
  }, [fixtureQuery.data]);

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleMutationError = (error: unknown, fallback: string) => {
    const errors = parseApiFieldErrors(error);
    setFieldErrors(errors);
    toast.error(getApiErrorMessage(error, fallback));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    if (isEdit && id) {
      updateMutation.mutate(
        {
          id,
          payload: {
            time: new Date(time).toISOString(),
            ground,
            round,
            is_public: isPublic,
            live_stream_url: liveStreamUrl.trim() || null,
            livestream_overlay_custom: overlayCustom,
            livestream_sponsor_text: overlayCustom ? overlayValues.sponsorText.trim() : undefined,
          },
        },
        {
          onSuccess: async () => {
            try {
              const hasOverlayUpload =
                overlayCustom &&
                (overlayValues.topLeftFile ||
                  overlayValues.topRightFile ||
                  overlayValues.clearTopLeft ||
                  overlayValues.clearTopRight);
              if (hasOverlayUpload || overlayCustom !== (fixtureQuery.data?.livestream_overlay_custom ?? false)) {
                await updateMatchLivestreamOverlay(id, {
                  overlayCustom,
                  sponsorText: overlayValues.sponsorText,
                  topLeftFile: overlayValues.topLeftFile,
                  topRightFile: overlayValues.topRightFile,
                  clearTopLeft: overlayValues.clearTopLeft,
                  clearTopRight: overlayValues.clearTopRight,
                });
              }
            } catch {
              // overlay save failed but fixture saved
            }
            toast.success('Fixture updated');
            navigate('/dashboard/fixtures');
          },
          onError: (error) => handleMutationError(error, 'Failed to update fixture.'),
        }
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
            round: round || undefined,
            time: new Date(time).toISOString(),
            ground: ground.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success('Fixture created');
            navigate('/dashboard/fixtures');
          },
          onError: (error) => handleMutationError(error, 'Failed to create fixture.'),
        }
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
      {
        onSuccess: () => {
          toast.success('Fixture created');
          navigate('/dashboard/fixtures');
        },
        onError: (error) => handleMutationError(error, 'Failed to create fixture.'),
      }
    );
  };

  const pending =
    createMutation.isPending || updateMutation.isPending || createTournamentFixtureMutation.isPending;
  const teams = teamsQuery.data?.results ?? [];
  const tournaments = tournamentsQuery.data?.results ?? [];
  const tournamentDefaults = fixtureQuery.data?.tournament;

  const tournamentOptions = [
    { value: TOURNAMENT_NONE_VALUE, label: 'None — standalone/custom match' },
    ...tournaments.map((tournament) => ({ value: tournament.id, label: tournament.name })),
  ];

  const roundOptions = ROUND_CHOICES.map((choice) => ({ value: choice, label: choice }));

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
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-4 sm:p-6">
            {!isEdit ? (
              <>
                <SearchableSelect
                  label="Tournament (optional)"
                  value={tournamentId || TOURNAMENT_NONE_VALUE}
                  onChange={(value) => {
                    setTournamentId(value === TOURNAMENT_NONE_VALUE ? '' : value);
                    clearFieldError('tournament');
                  }}
                  options={tournamentOptions}
                  placeholder="None — standalone/custom match"
                  searchable
                  error={fieldErrors.tournament}
                />
                <p className="text-xs text-muted-foreground">
                  Select a tournament to create this match within it (uses the tournament's registered
                  teams). Leave unselected for a standalone/friendly match.
                </p>
              </>
            ) : null}
            {!isEdit && !tournamentId ? (
              <Input
                label="Series name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                error={fieldErrors.name}
                required
              />
            ) : null}
            {!isEdit && tournamentId ? (
              tournamentDetailQuery.isLoading ? (
                <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
              ) : (
                <>
                  <SearchableSelect
                    label="Team A"
                    value={teamA}
                    onChange={(value) => {
                      setTeamA(value);
                      clearFieldError('opponent_a');
                    }}
                    options={opponents.map((opponent) => ({
                      value: opponent.id,
                      label: opponent.team_name,
                    }))}
                    placeholder="Select team"
                    searchable
                    error={fieldErrors.opponent_a}
                  />
                  <SearchableSelect
                    label="Team B"
                    value={teamB}
                    onChange={(value) => {
                      setTeamB(value);
                      clearFieldError('opponent_b');
                    }}
                    options={opponents.map((opponent) => ({
                      value: opponent.id,
                      label: opponent.team_name,
                    }))}
                    placeholder="Select team"
                    searchable
                    error={fieldErrors.opponent_b}
                  />
                </>
              )
            ) : null}
            {!isEdit && !tournamentId ? (
              <>
                <SearchableSelect
                  label="Team A"
                  value={teamA}
                  onChange={(value) => {
                    setTeamA(value);
                    clearFieldError('team_a');
                  }}
                  options={teams.map((team) => ({ value: team.id, label: team.name }))}
                  placeholder="Select team"
                  searchable
                  error={fieldErrors.team_a}
                />
                <SearchableSelect
                  label="Team B"
                  value={teamB}
                  onChange={(value) => {
                    setTeamB(value);
                    clearFieldError('team_b');
                  }}
                  options={teams.map((team) => ({ value: team.id, label: team.name }))}
                  placeholder="Select team"
                  searchable
                  error={fieldErrors.team_b}
                />
              </>
            ) : null}
            <Input
              label="Scheduled time"
              type="datetime-local"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                clearFieldError('time');
              }}
              error={fieldErrors.time}
              required
            />
            <Input
              label="Ground"
              value={ground}
              onChange={(e) => {
                setGround(e.target.value);
                clearFieldError('ground');
              }}
              error={fieldErrors.ground}
              required={!isEdit}
            />
            {isEdit || tournamentId ? (
              <SearchableSelect
                label="Round"
                value={round}
                onChange={(value) => {
                  setRound(value);
                  clearFieldError('round');
                }}
                options={roundOptions}
                placeholder="Select round"
                searchable={false}
                error={fieldErrors.round}
              />
            ) : null}
            {isEdit ? (
              <label className="flex items-center gap-2 text-sm text-[#12233D]">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Public match (visible to guests and non-members)
              </label>
            ) : null}
            {isEdit ? (
              <Input
                label="YouTube live stream URL (optional)"
                value={liveStreamUrl}
                onChange={(e) => {
                  setLiveStreamUrl(e.target.value);
                  clearFieldError('live_stream_url');
                }}
                error={fieldErrors.live_stream_url}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            ) : null}
            {isEdit ? (
              <section className="space-y-3 rounded-lg border bg-[#12233D]/[0.03] p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-[#12233D]">
                  <input
                    type="checkbox"
                    checked={overlayCustom}
                    onChange={(event) => setOverlayCustom(event.target.checked)}
                  />
                  Use custom livestream overlay for this match
                </label>
                {overlayCustom ? (
                  <LivestreamOverlayFields
                    title="Match overlay"
                    description="These settings replace the tournament defaults for this match only."
                    values={overlayValues}
                    onChange={setOverlayValues}
                    topLeftPreview={fixtureQuery.data?.livestream_top_left_image ?? null}
                    topRightPreview={fixtureQuery.data?.livestream_top_right_image ?? null}
                    disabled={pending}
                  />
                ) : (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Using tournament defaults:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Sponsor text:{' '}
                        {tournamentDefaults?.livestream_sponsor_text?.trim() || 'None'}
                      </li>
                      <li>Top-left logo: {tournamentDefaults?.livestream_top_left_image ? 'Set' : 'None'}</li>
                      <li>Top-right logo: {tournamentDefaults?.livestream_top_right_image ? 'Set' : 'None'}</li>
                    </ul>
                  </div>
                )}
              </section>
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
