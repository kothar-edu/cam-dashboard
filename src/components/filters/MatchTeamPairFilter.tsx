import { ArrowLeftRight } from 'lucide-react';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ANY = '__any__';

export type MatchTeamPairValue = {
  teamId: string;
  opponentTeamId: string;
};

type Props = {
  value: MatchTeamPairValue;
  onChange: (next: MatchTeamPairValue) => void;
  teamOptions: Array<{ value: string; label: string }>;
  className?: string;
};

function toSelect(id: string) {
  return id || ANY;
}

function fromSelect(id: string) {
  return id === ANY ? '' : id;
}

export function MatchTeamPairFilter({ value, onChange, teamOptions, className }: Props) {
  const options = [{ value: ANY, label: 'Any team' }, ...teamOptions];
  const hasFilter = Boolean(value.teamId || value.opponentTeamId);

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end',
        className
      )}
    >
      <SearchableSelect
        label="Team A"
        value={toSelect(value.teamId)}
        onChange={(next) => onChange({ ...value, teamId: fromSelect(next) })}
        options={options}
        placeholder="Any team"
        searchable
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-0.5 h-10 w-10 justify-self-center px-0"
        aria-label="Swap teams"
        onClick={() =>
          onChange({ teamId: value.opponentTeamId, opponentTeamId: value.teamId })
        }
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>
      <SearchableSelect
        label="Team B"
        value={toSelect(value.opponentTeamId)}
        onChange={(next) => onChange({ ...value, opponentTeamId: fromSelect(next) })}
        options={options}
        placeholder="Any team"
        searchable
      />
      {hasFilter ? (
        <Button
          type="button"
          variant="outline"
          aria-label="Clear team filter"
          onClick={() => onChange({ teamId: '', opponentTeamId: '' })}
        >
          Clear
        </Button>
      ) : (
        <span className="hidden sm:block" aria-hidden />
      )}
    </div>
  );
}
