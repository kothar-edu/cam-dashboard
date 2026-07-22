import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateFixturesBulk } from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import { useTournament, useTournaments } from '@/hooks/useTournaments';
import { getApiErrorMessage } from '@/lib/api-errors';
import { ROUND_CHOICES } from '@/lib/game-stages';
import type { BulkFixtureRowPayload } from '@/api/fixtures';

const TOURNAMENT_NONE_VALUE = '__none__';

type BulkRow = {
  key: string;
  tournamentId: string;
  opponentA: string;
  opponentB: string;
  round: string;
  name: string;
  teamA: string;
  teamB: string;
  time: string;
  ground: string;
};

function emptyRow(): BulkRow {
  return {
    key: crypto.randomUUID(),
    tournamentId: '',
    opponentA: '',
    opponentB: '',
    round: '',
    name: '',
    teamA: '',
    teamB: '',
    time: '',
    ground: '',
  };
}

function isRowComplete(row: BulkRow): boolean {
  if (!row.time || !row.ground) return false;
  if (row.tournamentId) return Boolean(row.opponentA && row.opponentB);
  return Boolean(row.name && row.teamA && row.teamB);
}

function toPayloadRow(row: BulkRow): BulkFixtureRowPayload {
  const time = new Date(row.time).toISOString();
  if (row.tournamentId) {
    return {
      tournament: row.tournamentId,
      opponent_a: row.opponentA,
      opponent_b: row.opponentB,
      ...(row.round ? { round: row.round } : {}),
      time,
      ground: row.ground,
    };
  }
  return {
    name: row.name,
    team_a: row.teamA,
    team_b: row.teamB,
    time,
    ground: row.ground,
  };
}

function BulkFixtureRowFields({
  row,
  index,
  teams,
  tournamentOptions,
  onChange,
  onRemove,
  canRemove,
}: {
  row: BulkRow;
  index: number;
  teams: Array<{ id: string; name: string }>;
  tournamentOptions: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<BulkRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const tournamentDetail = useTournament(row.tournamentId || undefined);
  const opponents = tournamentDetail.data?.opponents ?? [];

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#12233D]">Row {index + 1}</span>
        {canRemove ? (
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <SearchableSelect
          label="Tournament"
          value={row.tournamentId || TOURNAMENT_NONE_VALUE}
          onChange={(value) =>
            onChange({
              tournamentId: value === TOURNAMENT_NONE_VALUE ? '' : value,
              opponentA: '',
              opponentB: '',
              round: '',
            })
          }
          options={tournamentOptions}
          placeholder="None — custom match"
          searchable
        />
        {row.tournamentId ? (
          tournamentDetail.isLoading ? (
            <div className="flex items-center md:col-span-2">
              <LoadingSpinner className="h-5 w-5 text-[#12233D]" />
            </div>
          ) : (
            <>
              <SearchableSelect
                label="Team A"
                value={row.opponentA}
                onChange={(value) => onChange({ opponentA: value })}
                options={opponents.map((opponent) => ({ value: opponent.id, label: opponent.team_name }))}
                placeholder="Select"
                searchable
              />
              <SearchableSelect
                label="Team B"
                value={row.opponentB}
                onChange={(value) => onChange({ opponentB: value })}
                options={opponents.map((opponent) => ({ value: opponent.id, label: opponent.team_name }))}
                placeholder="Select"
                searchable
              />
            </>
          )
        ) : (
          <>
            <Input
              label="Match name"
              value={row.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Friendly, Practice match"
            />
            <SearchableSelect
              label="Team A"
              value={row.teamA}
              onChange={(value) => onChange({ teamA: value })}
              options={teams.map((team) => ({ value: team.id, label: team.name }))}
              placeholder="Select"
              searchable
            />
            <SearchableSelect
              label="Team B"
              value={row.teamB}
              onChange={(value) => onChange({ teamB: value })}
              options={teams.map((team) => ({ value: team.id, label: team.name }))}
              placeholder="Select"
              searchable
            />
          </>
        )}
        <Input
          label="Time"
          type="datetime-local"
          value={row.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />
        <Input label="Ground" value={row.ground} onChange={(e) => onChange({ ground: e.target.value })} />
      </div>
      {row.tournamentId ? (
        <SearchableSelect
          label="Round (optional)"
          value={row.round}
          onChange={(value) => onChange({ round: value })}
          options={ROUND_CHOICES.map((choice) => ({ value: choice, label: choice }))}
          placeholder="Select round"
          searchable={false}
          className="max-w-xs"
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          No tournament selected — this row creates its own standalone match under a new one-off tournament
          named "{row.name || '…'}".
        </p>
      )}
    </div>
  );
}

export default function BulkFixtureFormPage() {
  const navigate = useNavigate();
  const teamsQuery = useTeams();
  const tournamentsQuery = useTournaments();
  const bulkMutation = useCreateFixturesBulk();
  const [rows, setRows] = useState<BulkRow[]>([emptyRow(), emptyRow()]);

  const updateRow = (key: string, patch: Partial<BulkRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const completeRows = rows.filter(isRowComplete);
  const incompleteCount = rows.length - completeRows.length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!completeRows.length) {
      toast.error('Fill in at least one complete row before creating fixtures.');
      return;
    }
    const payload = completeRows.map(toPayloadRow);
    bulkMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`${created.length} fixture${created.length === 1 ? '' : 's'} created.`);
        navigate('/dashboard/fixtures');
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'Failed to create fixtures.'));
      },
    });
  };

  const teams = teamsQuery.data?.results ?? [];
  const tournamentOptions = [
    { value: TOURNAMENT_NONE_VALUE, label: 'None — custom match' },
    ...(tournamentsQuery.data?.results ?? []).map((tournament) => ({
      value: tournament.id,
      label: tournament.name,
    })),
  ];

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Bulk fixture upload" backTo="/dashboard/fixtures/new" backLabel="Single fixture" />
        <p className="text-sm text-muted-foreground">
          Pick a tournament per row to schedule it there using that tournament's registered teams, or leave it
          as "None" for a standalone custom match. Mix both freely in the same batch.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {rows.map((row, index) => (
            <BulkFixtureRowFields
              key={row.key}
              row={row}
              index={index}
              teams={teams}
              tournamentOptions={tournamentOptions}
              onChange={(patch) => updateRow(row.key, patch)}
              onRemove={() => removeRow(row.key)}
              canRemove={rows.length > 1}
            />
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => setRows((r) => [...r, emptyRow()])}>
              Add row
            </Button>
            <Button type="submit" disabled={bulkMutation.isPending || !completeRows.length}>
              {bulkMutation.isPending ? 'Creating…' : 'Create fixtures'}
            </Button>
            {incompleteCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                {incompleteCount} incomplete row{incompleteCount === 1 ? '' : 's'} will be skipped.
              </span>
            ) : null}
          </div>
        </form>
      </div>
    </TenantRequired>
  );
}
