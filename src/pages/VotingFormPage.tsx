import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { VoteStandingsChart } from '@/components/voting/VoteStandingsChart';
import { usePlayers } from '@/hooks/usePlayers';
import { useTournaments } from '@/hooks/useTournaments';
import {
  useCreateNomineeVotingPlayer,
  useNomineeVotingPlayer,
  useUpdateNomineeVotingPlayer,
  useVotingPolls,
} from '@/hooks/useVoting';
import { getApiErrorMessage, parseApiFieldErrors, type FieldErrors } from '@/lib/api-errors';
import { buildStandings, findPollForNomination, totalVotes } from '@/lib/voting';
import { cn } from '@/lib/utils';

type DetailTab = 'results' | 'nominees';

export default function VotingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const nominationQuery = useNomineeVotingPlayer(id);
  const pollsQuery = useVotingPolls();
  const tournamentsQuery = useTournaments();
  const playersQuery = usePlayers();
  const createMutation = useCreateNomineeVotingPlayer();
  const updateMutation = useUpdateNomineeVotingPlayer();

  const [tab, setTab] = useState<DetailTab>(isEdit ? 'results' : 'nominees');
  const [tournamentId, setTournamentId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [playerSearch, setPlayerSearch] = useState('');

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

  const standings = useMemo(() => {
    if (!nominationQuery.data) return [];
    const poll = findPollForNomination(nominationQuery.data, pollsQuery.data?.results ?? []);
    return buildStandings(nominationQuery.data, poll);
  }, [nominationQuery.data, pollsQuery.data?.results]);

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    const players = playersQuery.data?.results ?? [];
    if (!q) return players;
    return players.filter((player) => player.full_name.toLowerCase().includes(q));
  }, [playerSearch, playersQuery.data?.results]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((pid) => pid !== playerId)
        : [...current, playerId]
    );
  };

  const handleMutationError = (error: unknown, fallback: string) => {
    const errors = parseApiFieldErrors(error);
    setFieldErrors(errors);
    toast.error(getApiErrorMessage(error, fallback));
  };

  const handleSubmit = (event: FormEvent) => {
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
            setTab('results');
          },
          onError: (error) => handleMutationError(error, 'Failed to update voting nomination.'),
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success('Voting nomination created.');
        navigate(`/dashboard/voting/${created.id}`);
      },
      onError: (error) => handleMutationError(error, 'Failed to create voting nomination.'),
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const isLoadingEdit = isEdit && nominationQuery.isLoading;
  const loadFailed = isEdit && nominationQuery.isError;
  const title = isEdit
    ? (nominationQuery.data?.tournament.name ?? 'Voting poll')
    : 'Create voting nomination';
  const ballots = totalVotes(standings);

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={
            isEdit
              ? `${standings.length} nominees · ${ballots} vote${ballots === 1 ? '' : 's'} · ${
                  nominationQuery.data?.is_voting_open ? 'Open' : 'Closed'
                }`
              : 'Nominate players for a tournament voting poll.'
          }
          backTo="/dashboard/voting"
          backLabel="All polls"
        />
        {isLoadingEdit ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : loadFailed ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load this voting nomination.{' '}
            <Link to="/dashboard/voting" className="font-medium underline">
              Return to voting polls
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {isEdit ? (
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <TabButton active={tab === 'results'} onClick={() => setTab('results')}>
                  Results
                </TabButton>
                <TabButton active={tab === 'nominees'} onClick={() => setTab('nominees')}>
                  Edit nominees
                </TabButton>
              </div>
            ) : null}

            {isEdit && tab === 'results' ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[#12233D]">Full standings</h2>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        nominationQuery.data?.is_voting_open
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {nominationQuery.data?.is_voting_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="mb-5 text-xs text-muted-foreground">
                    All nominees ranked by total votes for this tournament.
                  </p>
                  <VoteStandingsChart standings={standings} />
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#12233D] to-[#1a3358] p-5 text-white shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                      Ballots cast
                    </p>
                    <p className="mt-1 text-3xl font-bold tabular-nums">{ballots}</p>
                    <p className="mt-2 text-sm text-white/70">
                      Across {standings.length} nominee{standings.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Share of vote
                    </p>
                    <div className="mt-4 space-y-2">
                      {standings.slice(0, 5).map((player) => {
                        const votes = player.total_votes ?? 0;
                        const pct = ballots ? Math.round((votes / ballots) * 100) : 0;
                        return (
                          <div
                            key={player.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="truncate font-medium text-[#12233D]">
                              {player.full_name}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                      {!ballots ? (
                        <p className="text-sm text-muted-foreground">Waiting for first votes.</p>
                      ) : null}
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setTab('nominees')}>
                    Edit nominees
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
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
                <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-[#12233D]">Poll voting open</p>
                    <p className="text-xs text-muted-foreground">
                      When enabled, this poll appears on the mobile Vote screen (if organization
                      voting is also open).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isVotingOpen}
                    onChange={(event) => setIsVotingOpen(event.target.checked)}
                  />
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#12233D]">
                      Nominated players ({selectedPlayers.length})
                    </p>
                    <input
                      type="search"
                      value={playerSearch}
                      onChange={(event) => setPlayerSearch(event.target.value)}
                      placeholder="Search players…"
                      className="h-9 w-full max-w-xs rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-[#E8A93B]"
                    />
                  </div>
                  {fieldErrors.player ? (
                    <p className="text-sm text-red-600">{fieldErrors.player}</p>
                  ) : null}
                  <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                    {filteredPlayers.length ? (
                      filteredPlayers.map((player) => (
                        <label
                          key={player.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(String(player.id))}
                            onChange={() => togglePlayer(String(player.id))}
                          />
                          <span className="min-w-0 truncate font-medium text-[#12233D]">
                            {player.full_name}
                          </span>
                          {player.team_name ? (
                            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                              {player.team_name}
                            </span>
                          ) : null}
                        </label>
                      ))
                    ) : (
                      <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No players match your search.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={pending || !selectedPlayers.length}>
                    {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create nomination'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      isEdit && nominationQuery.data
                        ? setTab('results')
                        : navigate('/dashboard/voting')
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-[#12233D] text-white shadow-sm' : 'text-muted-foreground hover:text-[#12233D]'
      )}
    >
      {children}
    </button>
  );
}
